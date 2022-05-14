import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import redis from 'lib/redis'
import { getTimeYYYYMMDD } from 'utils'

export default withIronSessionApiRoute(getIp, ironOptions);

async function getIp(req: NextApiRequest, res: NextApiResponse) {
  const timestamp = getTimeYYYYMMDD()
  // 获取今日新增动态
  const dayArticleNum = await redis.scard('s_article_day:id:' + timestamp)
  const allArticleNum = await redis.scard('s_article_all:id')
  console.log(dayArticleNum, allArticleNum)
  res?.status(200).json({
    code: 0,
    msg: '获取动态总数量&每日新增数量成功',
    data: {
      dayArticleNum,
      allArticleNum
    }
  });
}
