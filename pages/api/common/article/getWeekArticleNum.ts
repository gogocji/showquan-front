import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Article } from 'db/entity/index';
import request from 'service/fetch'
import redis from 'lib/redis'
import { getWeekYYYYMMDD } from 'utils'

export default withIronSessionApiRoute(getIp, ironOptions);

async function getIp(req: NextApiRequest, res: NextApiResponse) {
  const weekTimeList = getWeekYYYYMMDD()
  // 获取今日新增动态
  const result = await Promise.all(
    weekTimeList.map(day => {
      return new Promise((rev, rej) => {
        redis.scard('s_article_day:id:' + day).then((dayArticleNum) => {
            rev(dayArticleNum)
        })
      })
    })
  )
  console.log('res', result.reverse())
  res?.status(200).json({
    code: 0,
    msg: '获取七日文章发布量',
    data: result.reverse()
  });
}
