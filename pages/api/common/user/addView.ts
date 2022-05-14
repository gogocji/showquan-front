import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { EXCEPTION_COMMON } from 'pages/api/config/codes';

import redis from 'lib/redis'
import { getTimeYYYYMMDD } from 'utils'

export default withIronSessionApiRoute(addView, ironOptions);

// 用户阅览网站 增加网站阅览量
async function addView(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.body
  const timestamp = getTimeYYYYMMDD()
  const result1 = await redis.sadd('s_view_all:id', user_id + ':' + timestamp)
  const result2 = await redis.sadd('s_view_day:id:' + timestamp, user_id)
  console.log(result1, result2)
  if (result2) {
    res.status(200).json({ code: 0, msg: '记录成功' });
  } else {
    res.status(200).json({ ...EXCEPTION_COMMON.ADDVIEW_FAILED });
  }
}
