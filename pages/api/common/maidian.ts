import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Article } from 'db/entity/index';

export default withIronSessionApiRoute(maidian, ironOptions);

async function maidian(req: NextApiRequest, res: NextApiResponse) {
  console.log('埋点数据', req.body)
  res?.status(200).json({
    code: 0,
    msg: ''
  });
}
