import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import redis from 'lib/redis'

export default withIronSessionApiRoute(getIpList, ironOptions);

async function getIpList(req: NextApiRequest, res: NextApiResponse) {
  const result = await redis.zrange('z_province', 0, 25, 'WITHSCORES')
  let tempList = [];
  let Obj = {} as any
  for (let i = 0; i < result.length;i++) {
    if (i === 0 || i % 2 === 0) {
      Obj.name = result[i]
    } else {
      Obj.value = result[i]
      tempList.push(Obj)
    }
  }
  res?.status(200).json({
    code: 0,
    msg: '注册用户所在i省成功',
    data: tempList
  });
}
