import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { ISession } from 'pages/api/index';
import { prepareConnection } from 'db/index';
import { User, Article, Comment } from 'db/entity/index';
import { EXCEPTION_COMMENT } from 'pages/api/config/codes';
import request from 'service/fetch';
import redis from 'lib/redis';

export default withIronSessionApiRoute(publish, ironOptions);

async function publish(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;
  const { articleId = 0, content = '', toUser_id = 0, pid = 0, rid = 0, img = '' } = req.body;
  const sexResult = await request.post('http://hn216.api.yesapi.cn/api/App/Common_BannerWord/Check', {
    app_key: '76439D57AFB52CE4B964D1CD94339917',
    content
  })
  if (sexResult.data.err_code !== 0) {
    res.status(200).json({ failContent:  sexResult.data.sensitiveWord, ...EXCEPTION_COMMENT.CONTENT_FAILED });
  } else {
    const db = await prepareConnection();
    const commentRepo = db.getRepository(Comment);
  
    const comment = new Comment();
    comment.content = content;
    comment.create_time = new Date();
    comment.update_time = new Date();
  
    const user = await db.getRepository(User).findOne({
      id: session?.userId,
    });
  
    const toUser = await db.getRepository(User).findOne({
      id: toUser_id,
    });
  
    const pComment = await db.getRepository(Comment).findOne({
      id: pid,
    });
  
    const rComment = await db.getRepository(Comment).findOne({
      id: rid,
    });
  
    const article = await db.getRepository(Article).findOne({
      where: {
        id: articleId,
      },
      relations: ['user']
    });
  
    if (user) {
      comment.user = user;
    }
    if (toUser) {
      comment.toUser = toUser;
    }
    if (pComment) {
      comment.pComment = pComment;
    }
    if (rComment) {
      comment.rComment = rComment;
    }
    if (article) {
      console.log('article', article)
      comment.article = article;
      article.comment_count = article.comment_count + 1
      await db.getRepository(Article).save(article)
    }
    comment.like_count = 0
    comment.is_delete = 0
    comment.img = img
  
    const resComment = await commentRepo.save(comment);

    // 给子评论就是评论
    if (toUser_id) {
      // 给set结构添加comment这个type
      await redis.sadd('s_user_messageType:' + toUser_id, 'comment')
      // 给list结构添加comment.id
      await redis.lpush('l_user_commentMessage:' + toUser_id, resComment.id)
    } else if (article) {
      console.log('article', article)
      // 给set结构添加comment这个type
      await redis.sadd('s_user_messageType:' + article.user?.id, 'comment')
      // 给list结构添加comment.id
      await redis.lpush('l_user_commentMessage:' + article.user?.id, resComment.id)
    }
    
    if (resComment) {
      res.status(200).json({
        code: 0,
        msg: '发表成功',
        data: resComment,
      });
    } else {
      res.status(200).json({
        ...EXCEPTION_COMMENT.PUBLISH_FAILED,
      });
    }
  }
}
