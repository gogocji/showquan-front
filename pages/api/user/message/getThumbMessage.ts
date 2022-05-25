import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Thumb } from 'db/entity/index';
import redis from 'lib/redis'
import { In } from 'typeorm'
export default withIronSessionApiRoute(getCommentMessage, ironOptions);

async function getCommentMessage(req: NextApiRequest, res: NextApiResponse) {
  const db = await prepareConnection();
  const thumbRepo = db.getRepository(Thumb);
  const { user_id } = req.body
  let thumbIdList = await redis.lrange('l_user_thumbMessage:' + user_id, 0, -1)
  // 转成int类型，不然下面查询不了，以为id是number类型的
  thumbIdList = thumbIdList.map((item : string) => {
    return parseInt(item)
  }) as any

  const thumbList = await thumbRepo.find({
    where: {
      id : In( [...thumbIdList])
    },
    relations: ['user', 'article', 'comment']
  })
  if (thumbList) {
    res?.status(200).json({
      code: 0,
      msg: `获取用户点赞消息`,
      data: thumbList.reverse()
    });
  }
}
