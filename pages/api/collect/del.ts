import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { User, Follow } from 'db/entity/index';
import { EXCEPTION_FOLLOW } from 'pages/api/config/codes';
import redis from 'lib/redis'

export default withIronSessionApiRoute(del, ironOptions);

async function del(req: NextApiRequest, res: NextApiResponse) {
  const { user_id, article_id } = req.body
  const result = await redis.hdel(`h_user_collect:${user_id}`, article_id)
  console.log('取消收藏成功', result)
  res?.status(200).json({
    code: 0,
    msg: '取消收藏成功'
  });
}
