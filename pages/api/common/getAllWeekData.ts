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
  const articleWeekData = await Promise.all(
    weekTimeList.map(day => {
      return new Promise((rev, rej) => {
        redis.scard('s_article_day:id:' + day).then((dayArticleNum) => {
            rev(dayArticleNum)
        })
      })
    })
  )

  const userWeekData = await Promise.all(
    weekTimeList.map(day => {
      return new Promise((rev, rej) => {
        redis.scard('s_user_day:id:' + day).then((dayArticleNum) => {
            rev(dayArticleNum)
        })
      })
    })
  ) 

  const viewWeekData = await Promise.all(
    weekTimeList.map(day => {
      return new Promise((rev, rej) => {
        redis.scard('s_view_day:id:' + day).then((dayArticleNum) => {
            rev(dayArticleNum)
        })
      })
    })
  ) 
  
  res?.status(200).json({
    code: 0,
    msg: '获取圈占七日数据成功',
    data: {
      articleWeekData: articleWeekData.reverse(),
      userWeekData: userWeekData.reverse(),
      viewWeekData: viewWeekData.reverse(),
      weekDate: weekTimeList
    }
  });
}