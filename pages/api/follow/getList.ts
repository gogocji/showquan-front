import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { Follow } from 'db/entity/index';
import { prepareConnection } from 'db/index';

export default withIronSessionApiRoute(getList, ironOptions);

async function getList(req: NextApiRequest, res: NextApiResponse) {
  const { byUser_id } = req.body
  const db = await prepareConnection();
  const followRepo = db.getRepository(Follow);
  const follow = await followRepo.find({
    where:{
      byUser: byUser_id
    },
    relations: ['user']
  })
  console.log('follow', follow)
  res?.status(200).json({
    code: 0,
    msg: '获取用户关注列表成功',
    data: follow
  });
}
