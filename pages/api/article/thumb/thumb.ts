import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { EXCEPTION_ARTICLE } from 'pages/api/config/codes';
import { prepareConnection } from 'db/index';
import { Article, Thumb, User } from 'db/entity/index';
import redis from 'lib/redis'

export default withIronSessionApiRoute(thumb, ironOptions);

// 文章点赞模块
async function thumb(req: NextApiRequest, res: NextApiResponse) {
  const db = await prepareConnection();
  const articleRepo = db.getRepository(Article);
  const thumbRepo = db.getRepository(Thumb);
  const { article, user_id } = req.body
  const result = await redis.sadd('s_article_like:' + article?.id, user_id)
  // 如果result为0说明redis里面的set存在了，说明用户已经点赞过了
  if (result === 0) {
    res.status(200).json({ ...EXCEPTION_ARTICLE.THUMB_REPEAT });
  } else {
    const historyData = JSON.parse((await redis.hget('h_article_like', article?.id)) || 'null')
    let addNum = !historyData?.like_count ? 0 : historyData?.like_count
    const updateData = {
      ...historyData,
      like_count: addNum + 1,
    }
    const addRankData = {
      article_id: article?.id,
      article_title: article?.title
    }
    await redis.hset('h_article_like', article?.id, JSON.stringify(updateData))
    await redis.zincrby('z_article_like', 1, JSON.stringify(addRankData))
    
    // 写入数据库
    const userResult = await db.getRepository(User).findOne({
      id: user_id
    });
    const newArticle = await articleRepo.findOne({
      where: {
        id: article.id
      },
      relations: ['user']
    })
    if (newArticle && userResult) {
      newArticle.like_count = addNum + 1
      await articleRepo?.save(newArticle);
      const thumb = new Thumb()
      thumb.create_time = new Date()
      thumb.user = userResult
      thumb.article = newArticle
      const resThumb = await thumbRepo.save(thumb)
      // 给set结构添加comment这个type
      await redis.sadd('s_user_messageType:' + newArticle.user.id, 'thumb')
      // 给list结构添加comment.id
      await redis.lpush('l_user_thumbMessage:' + newArticle.user.id, resThumb.id)
    }
    res?.status(200).json({
      code: 0,
      msg: '点赞成功',
      data: updateData
    });
  }
  
}
