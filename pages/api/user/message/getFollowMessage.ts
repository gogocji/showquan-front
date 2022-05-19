import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Follow } from 'db/entity/index';
import redis from 'lib/redis'
import { In } from 'typeorm'
export default withIronSessionApiRoute(getCommentMessage, ironOptions);

async function getCommentMessage(req: NextApiRequest, res: NextApiResponse) {
  const db = await prepareConnection();
  const followRepo = db.getRepository(Follow);
  const { user_id } = req.body
  let followIdList = await redis.lrange('l_user_followMessage:' + user_id, 0, -1)
  // 转成int类型，不然下面查询不了，以为id是number类型的
  followIdList = followIdList.map((item : string) => {
    return parseInt(item)
  })

  const followList = await followRepo.find({
    where: {
      id : In( [...followIdList])
    },
    relations: ['byUser', 'user']
  })
  followList.map(item => {
    item.user = item.byUser
  })
  if (followList) {
    res?.status(200).json({
      code: 0,
      msg: `获取用户关注消息`,
      data: followList
    });
  }
}
