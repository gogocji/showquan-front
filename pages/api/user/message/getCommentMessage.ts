import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Comment, User } from 'db/entity/index';
import redis from 'lib/redis'
import { join } from 'path';
import { Any, In } from 'typeorm';

export default withIronSessionApiRoute(getCommentMessage, ironOptions);

async function getCommentMessage(req: NextApiRequest, res: NextApiResponse) {
  const db = await prepareConnection();
  const commentRepo = db.getRepository(Comment);
  const { user_id } = req.body
  let commentIdList = await redis.lrange('l_user_commentMessage:' + user_id, 0, -1)
  // 转成int类型，不然下面查询不了，以为id是number类型的
  commentIdList = commentIdList.map((item : string) => {
    return parseInt(item)
  })
  console.log('commentIdList', commentIdList)
  // let getsql = 
  //   'select * from comments c'
  //   + ' left join users u1 on c.user_id = u1.id'
  //   + ' left join users u2 on c.toUser_id = u2.id'
  //   + ' left join comments c2 on c.rid = c2.id'
  //   + ' left join comments c3 on c.pid = c3.id'
  //   + ` where c.id IN ( ${commentIdList} )`
  // let commentList = await await commentRepo.query(getsql);
  
  // const commentList = await commentRepo.createQueryBuilder("comment")
  // .leftJoinAndSelect("comment.user", "user")
  // .leftJoinAndSelect("comment.article", "article")
  // .leftJoinAndSelect("comment.toUser", "user as user1")
  // .leftJoinAndSelect("comment.pComment", "comment")
  // .innerJoin("comment1.rComment", "comment as comment1")
  // .leftJoinAndSelect("comment.rComment", "comment")
  // .where(
  //     "comment.id IN (" + commentIdList + ")"
  //   )
  //   .getMany()

    const commentList = await commentRepo.find({
      where: {
        id : In( [...commentIdList])
      },
      relations: ['user', 'rComment', 'article']
    })

  console.log('commentList', commentList)
  if (commentList) {
    res?.status(200).json({
      code: 0,
      msg: `获取用户评论消息`,
      data: commentList.reverse()
    });
  }
}
