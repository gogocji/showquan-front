import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import request from 'service/fetch'

export default withIronSessionApiRoute(getIp, ironOptions);
export interface AxiosResponse<T = any>  {
  data: T;
  status: number;
  statusText: string;
  request?: any;
  split?: any
}
async function getIp(req: NextApiRequest, res: NextApiResponse) {
  console.log('req getip', req.body)
  request.get('https://pv.sohu.com/cityjson?ie=utf-8')
  .then((result : AxiosResponse<any>) => {
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
