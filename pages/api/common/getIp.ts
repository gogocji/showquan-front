import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Article } from 'db/entity/index';
import request from 'service/fetch'

export default withIronSessionApiRoute(getIp, ironOptions);

async function getIp(req: NextApiRequest, res: NextApiResponse) {
  request.get('https://pv.sohu.com/cityjson?ie=utf-8')
  .then(result => {
    // var returnCitySN = {"cip": "125.88.24.132", "cid": "440981", "cname": "广东省高州市"};
    console.log('res', result)
    const userIp = JSON.parse(result.split('=')[1].replace(';', '')).cip
    const userIpAddress = JSON.parse(result.split('=')[1].replace(';', '')).cname
    res?.status(200).json({
      code: 0,
      msg: '获取用户定位成功',
      data: {
        userIp,
        userIpAddress
      }
    });
  })
}
