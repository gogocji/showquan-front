import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { User } from 'db/entity/index';

export default withIronSessionApiRoute(get, ironOptions);

async function get(req: NextApiRequest, res: NextApiResponse) {
  const db = await prepareConnection();
  const userRepo = db.getRepository(User);
  const { searchKey } = req?.query || {};

  const result =  await userRepo.createQueryBuilder("user")
    .where("user.nickname like :key", {key: '%' + searchKey + '%'})
    .getMany()
  const count = result.length
  console.log("result", result)
  res?.status(200).json({
    code: 0,
    msg: '',
    data: {
      users: result || [],
      count
    } 
  });
}
