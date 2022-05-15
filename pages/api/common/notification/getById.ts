import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Notification } from 'db/entity/index';

export default withIronSessionApiRoute(get, ironOptions);

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.body
  const db = await prepareConnection();
  const notificationRepo = db.getRepository(Notification);
  let result
  result = await notificationRepo.findOne({
    where: (qb: any) => {
      qb.where('id = :id', {
        id
      })
    }
  })
  
  console.log('result', result)
  res?.status(200).json({
    code: 0,
    msg: '根据id获取系统通知成功',
    data: result
  });
}
