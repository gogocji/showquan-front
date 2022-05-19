import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Notification } from 'db/entity/index';
import { EXCEPTION_NOTIFICATION } from 'pages/api/config/codes';

export default withIronSessionApiRoute(get, ironOptions);

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { isStart, content, title, type  } = req.body
  const db = await prepareConnection();
  const notificationRepo = db.getRepository(Notification);
  const notification = new Notification()
  notification.is_start = isStart 
  notification.content = content
  notification.title = title
  notification.type = type
  notification.create_time = new Date()

  const nowNotification = await notificationRepo.save(notification)
  if (nowNotification) {
    res.status(200).json({ data: nowNotification, code: 0, msg: '新建成功' });
  } else {
    res.status(200).json({ ...EXCEPTION_NOTIFICATION.CREATE_FAILED });
  }
}
