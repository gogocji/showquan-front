import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Tag } from 'db/entity/index';
import { EXCEPTION_TAG} from 'pages/api/config/codes';

export default withIronSessionApiRoute(get, ironOptions);

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { is_delete = 0, title, icon } = req.body
  const db = await prepareConnection();
  const tagnRepo = db.getRepository(Tag);
  const tag = new Tag()
  tag.is_delete = is_delete
  tag.icon = icon
  tag.title = title
  tag.follow_count = 0
  tag.article_count = 0

  const nowTag = await tagnRepo.save(tag)
  if (nowTag) {
    res.status(200).json({ data: nowTag, code: 0, msg: '新建成功' });
  } else {
    res.status(200).json({ ...EXCEPTION_TAG.CREATE_FAILED });
  }
}
