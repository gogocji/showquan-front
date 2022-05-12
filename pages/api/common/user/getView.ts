import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import redis from 'lib/redis'
import { getTimeYYYYMMDD } from 'utils'

export default withIronSessionApiRoute(getIp, ironOptions);

async function getIp(req: NextApiRequest, res: NextApiResponse) {
  const timestamp = getTimeYYYYMMDD()
  // 获取今日新增用户
  const dayViewNum = await redis.scard('s_view_day:id:' + timestamp)
  const allViewNum = await redis.scard('s_view_all:id')
  console.log(dayViewNum, allViewNum)
  res?.status(200).json({
    code: 0,
    msg: '获取全站阅览总量&每日新增阅览量成功',
    data: {
      dayViewNum,
      allViewNum
    }
  });
}
