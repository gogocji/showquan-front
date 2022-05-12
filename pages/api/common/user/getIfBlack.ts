import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { User } from 'db/entity/index';
import { EXCEPTION_USER } from 'pages/api/config/codes';

export default withIronSessionApiRoute(get, ironOptions);

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.body
  const db = await prepareConnection();
  const userRepo = db.getRepository(User);
  const user = await userRepo.findOne({
    id: user_id
  })
  if (!user) {
    res?.status(200)?.json({
      ...EXCEPTION_USER.NOT_FOUND,
    });
  } else {
    if (user.state === 1) {
      res?.status(200)?.json({
        ...EXCEPTION_USER.NOT_AUTHORIZE,
      });
    } else {
      res?.status(200).json({
        code: 0,
        msg: '正常用户',
      });
    }
  }
}
