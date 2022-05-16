import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Tag } from 'db/entity/index';
import { EXCEPTION_TAG} from 'pages/api/config/codes';

export default withIronSessionApiRoute(get, ironOptions);

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { is_delete = -1, id, title, icon } = req.body
  const db = await prepareConnection();
  const tagnRepo = db.getRepository(Tag);
  const history = await tagnRepo.findOne({
    where: (qb: any) => {
      qb.where('id = :id', {
        id
      })
    }
  })
  if (history) {
    history.is_delete = is_delete != -1 ? is_delete : history.is_delete
    history.icon = icon ? icon : history.icon
    history.title = title ? title : history.title

    const nowTag = await tagnRepo.save(history)
    if (nowTag) {
      res.status(200).json({ data: nowTag, code: 0, msg: '更新成功' });
    } else {
      res.status(200).json({ ...EXCEPTION_TAG.UPDATE_FAILED });
    }
  } else {
    res.status(200).json({ ...EXCEPTION_TAG.NOT_FOUND });
  }
}
