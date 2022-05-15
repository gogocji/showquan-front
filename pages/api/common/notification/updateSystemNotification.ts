import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Notification } from 'db/entity/index';
import { EXCEPTION_NOTIFICATION } from 'pages/api/config/codes';

export default withIronSessionApiRoute(get, ironOptions);

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { isStart = -1, id, content, title, type  } = req.body
  console.log('req.body', req.body)
  const db = await prepareConnection();
  const notificationRepo = db.getRepository(Notification);
  const history = await notificationRepo.findOne({
    where: (qb: any) => {
      qb.where('id = :id', {
        id
      })
    }
  })
  if (history) {
    history.is_start = isStart != -1 ? isStart : history.is_start
    history.content = content ? content : history.content
    history.title = title ? title : history.title
    history.type = type ? type : history.type

    const nowNotification = await notificationRepo.save(history)
    if (nowNotification) {
      res.status(200).json({ data: nowNotification, code: 0, msg: '更新成功' });
    } else {
      res.status(200).json({ ...EXCEPTION_NOTIFICATION.UPDATE_FAILED });
    }
  } else {
    res.status(200).json({ ...EXCEPTION_NOTIFICATION.NOT_FOUND });
  }
}
