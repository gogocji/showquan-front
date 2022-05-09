import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Article } from 'db/entity/index';
import { EXCEPTION_ARTICLE } from 'pages/api/config/codes';

import redis from 'lib/redis'

export default withIronSessionApiRoute(getThumb, ironOptions);

// 文章点赞模块
async function getThumb(req: NextApiRequest, res: NextApiResponse) {
  const { article_id } = req.body
  // 判断用户是否点赞了
  const view_count= await redis.scard('s_article_view:' + article_id)
  res?.status(200).json({
    code: 0,
    msg: '查询成功',
    data: {
      view_count
    }
  });
}