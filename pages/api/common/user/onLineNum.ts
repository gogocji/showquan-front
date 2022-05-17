import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import redis from 'lib/redis'

export default withIronSessionApiRoute(getIp, ironOptions);

async function getIp(req: NextApiRequest, res: NextApiResponse) {
  const allOnlineNum = await redis.scard('s_online_user')
  res?.status(200).json({
    code: 0,
    msg: '获取全栈在线用户',
    data: {
      allOnlineNum
    }
  });
}
