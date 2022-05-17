import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';

import redis from 'lib/redis'

export default withIronSessionApiRoute(getThumb, ironOptions);

// 文章点赞模块
async function getThumb(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.body
  // 判断用户是否点赞了
  const redisKey= await redis.hkeys('h_user_message:' + user_id)
  const redisValue= await redis.hvals('h_user_message:' + user_id)
  const result = [] as any
  for (let i = 0; i < redisKey.length; i++) {
    const obj = {} as any
    obj.fromUser = redisKey[i]
    obj.content = redisValue[i]
    result.push(obj)
  }
  res?.status(200).json({
    code: 0,
    msg: '查询成功',
    data: {
      messageList: result
    }
  });
}
