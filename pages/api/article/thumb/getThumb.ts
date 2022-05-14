import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';

import redis from 'lib/redis'

export default withIronSessionApiRoute(getThumb, ironOptions);

// 文章点赞模块
async function getThumb(req: NextApiRequest, res: NextApiResponse) {
  const { article_id, user_id } = req.body
  // 判断用户是否点赞了
  const ifLike = await redis.sismember('s_article_like:' + article_id, user_id)
  // 获取该文章的点赞信息
  const articleLikeData = JSON.parse((await redis.hget('h_article_like', article_id)) || 'null')
  // 如果result为0说明redis里面的set存在了，说明用户已经点赞过了
  res?.status(200).json({
    code: 0,
    msg: '查询成功',
    data: {
      ifLike: ifLike === 1,
      articleLikeData
    }
  });
}
