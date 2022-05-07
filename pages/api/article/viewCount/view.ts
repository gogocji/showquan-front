import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Article } from 'db/entity/index';
import { EXCEPTION_ARTICLE } from 'pages/api/config/codes';

import redis from 'lib/redis'

export default withIronSessionApiRoute(thumb, ironOptions);

// 文章点赞模块
async function thumb(req: NextApiRequest, res: NextApiResponse) {
  const { article_id, user_id } = req.body
  const result = await redis.sadd('s_article_view:' + article_id, user_id)
  // 如果result为0说明redis里面的set存在了，说明用户已经点赞过了
  if (result === 0) {
    return
  } else {
    const historyData = JSON.parse((await redis.hget('h_article_view', article_id)) || 'null')
    let addNum = !historyData?.view_count ? 0 : historyData?.view_count
    const updateData = {
      ...historyData,
      view_count: addNum + 1,
    }
    await redis.hset('h_article_view', article_id, JSON.stringify(updateData))
    res?.status(200).json({
      code: 0,
      msg: '点赞成功',
      data: updateData
    });
  }
  
}
