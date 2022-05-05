import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';

export default withIronSessionApiRoute(upload, ironOptions);

async function upload(req: NextApiRequest, res: NextApiResponse) {
  res?.status(200)?.json({
    code: 0,
    msg: '',
    data: '上传文件',
  });
}
