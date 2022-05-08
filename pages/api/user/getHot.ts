import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Article } from 'db/entity/index';
import { EXCEPTION_ARTICLE } from 'pages/api/config/codes';

import redis from 'lib/redis'

export default withIronSessionApiRoute(getHot, ironOptions);

// 文章点赞排序（前k名）
async function getHot(req: NextApiRequest, res: NextApiResponse) {
  const { k } = req.body
  const result = await redis.zrange('z_user_hot', 0, k, 'WITHSCORES')
  console.log('result', result)
  if (result) {
    res?.status(200).json({
      code: 0,
      msg: `获取用户排行榜前${k}名成功`,
      data: result
    });
  }
}
