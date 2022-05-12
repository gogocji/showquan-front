import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { ISession } from 'pages/api/index';
import { prepareConnection } from 'db/index';
import { User, Article, Comment } from 'db/entity/index';
import { EXCEPTION_COMMENT } from 'pages/api/config/codes';

export default withIronSessionApiRoute(publish, ironOptions);

async function publish(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;
  const { articleId = 0, content = '', toUser_id = 0, pid = 0, rid = 0 } = req.body;
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
    id: articleId,
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
    comment.article = article;
  }
  comment.like_count = 0
  comment.is_delete = 0

  const resComment = await commentRepo.save(comment);

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
