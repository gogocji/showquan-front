import { NextApiRequest, NextApiResponse} from "next"
import { withIronSessionApiRoute } from 'iron-session/next'
import { ironOptions } from "config/index"
import { prepareConnection } from 'db/index'
import { User, UserAuth } from 'db/entity/index'
import { Cookie } from 'next-cookie'
import { ISession } from "pages/api/index"
import { setCookie } from "utils/index"
import request from 'service/fetch'

export default withIronSessionApiRoute(redirect, ironOptions)

// client-id:b38643ee814f81945179
// client-secret: c137a9e7f13b334e8f7bcc7d90fa3c2357aa1a79
async function redirect(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session
  // 回调的url自带一个code参数：http://localhost:3000/api/oauth/redirect?code=xxx
  const { code } = req?.query || {}
  console.log('获取到第三方的授权码', code)
  const githubClientID = 'b38643ee814f81945179'
  const githubSecrect = 'c137a9e7f13b334e8f7bcc7d90fa3c2357aa1a79'
  const url = `https://github.com/login/oauth/access_token?client_id=${githubClientID}&client_secret=${githubSecrect}&code=${code}`

  const result = await request.post(
    url,
    {},
    {
      headers: {
        accept: 'application/json',
      },
    }
  )
  console.log('获取github回调 获取result')
  console.log(result)
  const { access_token } = result as any

  console.log('获取到github的acces_token')
  console.log(access_token)

  const githubUserInfo = await request.get('https://api.github.com/user', {
    headers: {
      accept: 'application/json',
      Authorization: `token ${access_token}`
    }
  })

  console.log('获取到github回调用户信息')
  console.log(githubUserInfo)


  // 把获取到的github用户信息保存到数据库中
  const cookies = Cookie.fromApiRoute(req, res)
  const db = await prepareConnection()
  const userAuth = await db.getRepository(UserAuth).findOne({
    identity_type: 'github',
    identifier: githubClientID
  }, {
    relations: ['user']
  })

  console.log('获取用户userAuth')
  console.log(userAuth)

  if (userAuth) {
    // 之前登录过的用户，直接从user里面获取用户信息，并且更新credential
    const user = userAuth.user
    const { id, nickname, avatar } = user

    // 更新auth表中的credential
    userAuth.credential = access_token

    session.userId = id
    session.nickname = nickname
    session.avatar = avatar

    await session.save()

    setCookie(cookies, { id, nickname, avatar }as any)

    res.writeHead(302, {
      Location: '/'
    })
  } else {
    const { login = '', avatar_url = '' } = githubUserInfo as any
    const user = new User()
    user.nickname = login
    user.avatar = avatar_url

    const userAuth = new UserAuth()
    userAuth.identity_type = 'github'
    userAuth.identifier = githubClientID
    userAuth.credential = access_token
    userAuth.user = user

    const userAuthRepo = db.getRepository(UserAuth)
    const resUserAuth = await userAuthRepo.save(userAuth)

    console.log('写入数据库后返回userAuth')
    console.log(resUserAuth)

    const { id, nickname, avatar } = resUserAuth?.user || {}
    session.userId = id
    session.nickname = nickname
    session.avatar = avatar

    await session.save()

    setCookie(cookies, { id, nickname, avatar } as any)

    res.writeHead(302, {
      Location: '/'
    })
  }
}