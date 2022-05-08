import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { User, Follow } from 'db/entity/index';
import { EXCEPTION_FOLLOW } from 'pages/api/config/codes';
import redis from 'lib/redis'

export default withIronSessionApiRoute(getById, ironOptions);

async function getById(req: NextApiRequest, res: NextApiResponse) {
  const { byUser_id, user_id } = req.body
  const result = await redis.hexists(`h_user_follow:${byUser_id}`, user_id)
  console.log('是否已关注', result)
  res?.status(200).json({
    code: 0,
    msg: '获取用户关注列表成功',
    data: result
  });
}
