import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Article } from 'db/entity/index';
import request from 'service/fetch'
import redis from 'lib/redis'
import { getTimeYYYYMMDD } from 'utils'

export default withIronSessionApiRoute(getIp, ironOptions);

async function getIp(req: NextApiRequest, res: NextApiResponse) {
  const timestamp = getTimeYYYYMMDD()
  // 获取今日新增用户
  const dayViewNum = await redis.scard('s_view_day:id:' + timestamp)
  const allViewNum = await redis.scard('s_view_all:id')
  const dayUserNum = await redis.scard('s_user_day:id:' + timestamp)
  const allUserNum = await redis.scard('s_user_all:id')
  const dayArticleNum = await redis.scard('s_article_day:id:' + timestamp)
  const allArticleNum = await redis.scard('s_article_all:id')
  console.log(dayViewNum, allViewNum)
  res?.status(200).json({
    code: 0,
    msg: '获取全站数据和每日数据成功',
    data: {
      dayViewNum,
      allViewNum,
      dayUserNum,
      allUserNum,
      dayArticleNum,
      allArticleNum
    }
  });
}
