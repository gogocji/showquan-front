import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import redis from 'lib/redis'

export default withIronSessionApiRoute(publish, ironOptions);

async function publish(req: NextApiRequest, res: NextApiResponse) {
  const { user, byUser_id } = req.body
  const result = await redis.hset(`h_user_follow:${byUser_id}`, user?.id, JSON.stringify(user))
  console.log('关注成功', result)
  res?.status(200).json({
    code: 0,
    msg: '关注成功'
  });
}
