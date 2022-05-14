import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import redis from 'lib/redis'

export default withIronSessionApiRoute(del, ironOptions);

async function del(req: NextApiRequest, res: NextApiResponse) {
  const { user_id, byUser_id } = req.body
  const result = await redis.hdel(`h_user_follow:${byUser_id}`, user_id)
  console.log('取消关注成功', result)
  res?.status(200).json({
    code: 0,
    msg: '取消关注成功'
  });
}
