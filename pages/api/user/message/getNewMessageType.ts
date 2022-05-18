import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';

import redis from 'lib/redis'

export default withIronSessionApiRoute(getNewMessageType, ironOptions);

// 文章点赞排序（前k名）
async function getNewMessageType(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.body
  const result = await redis.smembers('s_user_messageType:' + user_id)
  console.log('result', result)
  if (result) {
    res?.status(200).json({
      code: 0,
      msg: `获取用户最新通知类型`,
      data: result
    });
  }
}
