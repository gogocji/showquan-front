import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { EXCEPTION_ARTICLE } from 'pages/api/config/codes';
import { prepareConnection } from 'db/index';
import { Thumb, User, Comment } from 'db/entity/index';
import redis from 'lib/redis'

export default withIronSessionApiRoute(thumb, ironOptions);

// 文章点赞模块
async function thumb(req: NextApiRequest, res: NextApiResponse) {
  const db = await prepareConnection();
  const userRepo = db.getRepository(User);
  const thumbRepo = db.getRepository(Thumb);
  const commentRepo = db.getRepository(Comment);

  const { comment_id, user_id } = req.body
  const result = await redis.sadd('s_comment_like:' + comment_id, user_id)
  // 如果result为0说明redis里面的set存在了，说明用户已经点赞过了
  if (result === 0) {
    res.status(200).json({ ...EXCEPTION_ARTICLE.THUMB_REPEAT });
  } else {
    const historyData = JSON.parse((await redis.hget('h_comment_like', comment_id)) || 'null')
    let addNum = !historyData?.like_count ? 0 : historyData?.like_count
    const updateData = {
      ...historyData,
      like_count: addNum + 1,
    }
    await redis.hset('s_comment_like', comment_id, JSON.stringify(updateData))
    
    // 写入数据库
    const userResult = await userRepo.findOne({
      id: user_id
    });
    const commentResult = await commentRepo.findOne({
      where: {
        id: comment_id,
      },
      relations: ['user', 'article']
    });
    console.log('22222222222222222222')
    console.log('commentResult', commentResult)
    if (userResult && commentResult) {
      const thumb = new Thumb()
      thumb.create_time = new Date()
      thumb.user = userResult
      thumb.comment = commentResult
      thumb.article = commentResult.article
      const resThumb = await thumbRepo.save(thumb)
      console.log('resThumb', resThumb)
      commentResult.like_count = addNum + 1
      await commentRepo.save(commentResult)

       // 给set结构添加comment这个type
       await redis.sadd('s_user_messageType:' + commentResult.user.id, 'thumb')
       // 给list结构添加comment.id
       await redis.lpush('l_user_thumbMessage:' + commentResult.user.id, resThumb.id)
    }
    res?.status(200).json({
      code: 0,
      msg: '点赞成功',
      data: updateData
    });
  }
  
}
