import { NextApiRequest, NextApiResponse} from "next"
import { withIronSessionApiRoute } from 'iron-session/next'
import { ironOptions } from "config"
import { ISession } from "pages/api/index"
import { prepareConnection } from "db/index"
import { User, UserAuth} from 'db/entity/index'
import { Cookie } from 'next-cookie'
import { setCookie } from "utils/index"
import redis from 'lib/redis'
import { getTimeYYYYMMDD } from 'utils'
import { EXCEPTION_USER } from 'pages/api/config/codes';

export default withIronSessionApiRoute(login, ironOptions)

async function login(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session
  const cookies = Cookie.fromApiRoute(req, res)
  const { phone = '', verify = '', identity_type = 'phone' } = req.body
  const db = await prepareConnection();

  const userAuthRepo = db.getRepository(UserAuth)

  if (String(session.verifyCode) === String(verify)) {
    // 验证正确，在user_auths表中查找identity_type是否有记录
    const userAuth = await userAuthRepo.findOne({
      identity_type,
      identifier: phone
    },
    {
      relations: ['user']
    })

    if (userAuth) {
      // 已存在用户
      const user = userAuth.user
      const { id, nickname, avatar, skill, introduce, job } = user
      session.userId = id
      session.nickname = nickname
      session.avatar = avatar
      session.skill = skill
      session.introduce = introduce
      session.job = job

      // 判断用户是否在黑名单
      if ( user.state === 1) {
        res?.status(200)?.json({
          ...EXCEPTION_USER.NOT_AUTHORIZE,
        });
      }

      await session.save()

      setCookie(cookies, { id, nickname, avatar, skill, introduce, job })

      res?.status(200).json({
        msg: '登录成功',
        code: 0,
        data: {
          userId: id,
          nickname,
          avatar,
          skill,
          introduce,
          job
        }
      })
    } else {
      // 新用户，自动注册
      const user = new User()
      user.nickname = `用户_${Math.floor(Math.random() * 10000)}`
      user.skill = ''
      user.job = ''
      user.introduce = ''
      let randFrom0To6=Math.floor(Math.random()*Math.floor(6));
      user.avatar = `/images/avatar${randFrom0To6}.webp`
      user.introduce = '博主在忙，啥也没写'
      user.job = ''
      user.state = 0

      const userAuth = new UserAuth()
      userAuth.identifier = phone
      userAuth.identity_type = identity_type
      userAuth.credential = session.verifyCode
      userAuth.user = user

      const resUserAuth = await userAuthRepo.save(userAuth)

      // 存入session
      const { user: { id, nickname, avatar, skill, introduce, job }} = resUserAuth
      session.userId = id
      session.nickname = nickname
      session.avatar = avatar
      session.skill = skill
      session.introduce = introduce
      session.job = job
      await session.save()

      setCookie(cookies, { id, nickname, avatar, skill, introduce, job })

      // redis添加新用户
      const timestamp = getTimeYYYYMMDD()
      await redis.sadd('s_user_all:id', id + ':' + timestamp)
      await redis.sadd('s_user_day:id:' + timestamp, id)


      res?.status(200).json({
        msg: '登录成功',
        code: 0,
        data: {
          userId: id,
          nickname,
          avatar
        }
      })
    }
  } else {
    // 用户输入验证码错误情况
    res?.status(200).json({
      msg: '验证码错误',  
      code: -1
    })
  }
}
