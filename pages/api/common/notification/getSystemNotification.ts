import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Notification } from 'db/entity/index';

export default withIronSessionApiRoute(get, ironOptions);

async function get(req: NextApiRequest, res: NextApiResponse) {
  const db = await prepareConnection();
  const notificationRepo = db.getRepository(Notification);
  const result = await notificationRepo.find({
    where: (qb: any) => {
      qb.where('is_delete = :is_delete', {
        is_delete: 0
      })
    }
  })
  console.log('result', result)
  res?.status(200).json({
    code: 0,
    msg: '获取系统通知成功',
    data: result
  });
}
