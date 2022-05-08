import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { User, Follow } from 'db/entity/index';
import { EXCEPTION_FOLLOW } from 'pages/api/config/codes';
import redis from 'lib/redis'

export default withIronSessionApiRoute(getList, ironOptions);

async function getList(req: NextApiRequest, res: NextApiResponse) {
  const { byUser_id } = req.body
  const result = await redis.hvals(`h_user_follow:${byUser_id}`)
  res?.status(200).json({
    code: 0,
    msg: '获取用户关注列表成功',
    data: result
  });
}
