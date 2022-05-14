import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import redis from 'lib/redis'

export default withIronSessionApiRoute(getList, ironOptions);

async function getList(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.body
  const result = await redis.hvals(`h_user_collect:${user_id}`)
  res?.status(200).json({
    code: 0,
    msg: '获取用户收藏列表成功',
    data: result
  });
}
