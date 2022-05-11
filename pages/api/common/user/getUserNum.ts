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
  const dayUserNum = await redis.scard('s_user_day:id:' + timestamp)
  const allUserNum = await redis.scard('s_user_all:id')
  console.log(dayUserNum, allUserNum)
  res?.status(200).json({
    code: 0,
    msg: '获取用户总数量&每日新增数量成功',
    data: {
      dayUserNum,
      allUserNum
    }
  });
}
