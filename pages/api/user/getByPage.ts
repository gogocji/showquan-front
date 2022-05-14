import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { User } from 'db/entity/index';

export default withIronSessionApiRoute(get, ironOptions);

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { pageSize = 10, page = 1, user_state } = req?.query || {};
  console.log(pageSize, page, user_state)
  const db = await prepareConnection();
  const userRepo = db.getRepository(User);
  const count = await userRepo.count()

  let users = [];

  if (user_state) {
    users = await userRepo.find({
      where: (qb: any) => {
        qb.where('state = :state', {
          state: Number(user_state),
        });
      },
      skip: pageSize as number * (page as number - 1),
      take: pageSize as number
    });
  } else {
    users = await userRepo.find({
      skip: pageSize as number * (page as number - 1),
      take: pageSize as number
    });
  }
  
  console.log('users', users)
  res?.status(200).json({
    code: 0,
    msg: '',
    data: {
      users: users || [],
      count
    } 
  });
}
