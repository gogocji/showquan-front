import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Article } from 'db/entity/index';
import { EXCEPTION_ARTICLE } from 'pages/api/config/codes';

import redis from 'lib/redis'

export default withIronSessionApiRoute(getRank, ironOptions);

// 文章点赞排序（前k名）
async function getRank(req: NextApiRequest, res: NextApiResponse) {
  const { k } = req.body
  console.log('kkkkkkkkkkkkkkkk', k)
  const result = await redis.zrange('z_article_like', 0, k, 'WITHSCORES')
  console.log('result', result)
  if (result) {
    res?.status(200).json({
      code: 0,
      msg: `获取点赞前${k}成功`,
      data: result
    });
  }
}
