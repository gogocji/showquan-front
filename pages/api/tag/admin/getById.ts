import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Tag } from 'db/entity/index';

export default withIronSessionApiRoute(getById, ironOptions);

async function getById(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.body
  console.log('id', id)
  const db = await prepareConnection();
  const tagRepo = db.getRepository(Tag);
  let result
  result = await tagRepo.findOne({
    where: (qb: any) => {
      qb.where('id = :id', {
        id
      })
    }
  })
  
  console.log('result', result)
  res?.status(200).json({
    code: 0,
    msg: '根据id获取标签成功',
    data: result
  });
}
