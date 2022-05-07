import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { ISession } from 'pages/api/index';
import { prepareConnection } from 'db/index';
import { User } from 'db/entity/index';
import { EXCEPTION_USER } from 'pages/api/config/codes';
import { setCookie } from "utils/index"
import { Cookie } from 'next-cookie'

export default withIronSessionApiRoute(update, ironOptions);

async function update(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;
  const { userId } = session;
  const { nickname = '', job = '', introduce = '', userImgUrl = '' } = req.body;
  const db = await prepareConnection();
  const userRepo = db.getRepository(User);
  const cookies = Cookie.fromApiRoute(req, res)

  const user = await userRepo.findOne({
    where: {
      id: Number(userId),
    },
  });

  if (user) {
    user.nickname = nickname;
    user.job = job;
    user.introduce = introduce;
    user.avatar = userImgUrl

    const resUser = await userRepo.save(user);
    if (resUser) {
      const { id, nickname, avatar } = resUser
      session.userId = id
      session.nickname = nickname
      session.avatar = avatar
      await session.save()

      setCookie(cookies, { id, nickname, avatar })
    }
    console.log('resUser', resUser)
    res?.status(200)?.json({
      code: 0,
      msg: '更新用户信息成功',
      data: resUser,
    });
  } else {
    res?.status(200)?.json({
      ...EXCEPTION_USER.NOT_FOUND,
    });
  }
}
