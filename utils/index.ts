interface ICookieInfo {
  id: number
  nickname: string
  avatar: string
  skill: string
  introduce: string
  job: string
}


export const setCookie = (
  cookies: any, 
  { id, nickname, avatar, skill, introduce, job }: ICookieInfo
) => {
  // 登录时效，24h
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const path = '/'

  cookies.set('userId', id, {
    path,
    expires
  })
  cookies.set('nickname ', nickname, {
    path,
    expires
  })
  cookies.set('avatar', avatar, {
    path,
    expires
  })
  cookies.set('skill', skill, {
    path,
    expires
  })
  cookies.set('introduce ', introduce, {
    path,
    expires
  })
  cookies.set('job', job, {
    path,
    expires
  })
}

export const clearCookie = (
  cookies: any
) => {
  // 登录时效，24h
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const path = '/'

  cookies.set('userId', '', {
    path,
    expires
  })
  cookies.set('nickname ', '', {
    path,
    expires
  })
  cookies.set('avatar', '', {
    path,
    expires
  })
  cookies.set('skill', '', {
    path,
    expires
  })
  cookies.set('introduce ', '', {
    path,
    expires
  })
  cookies.set('job', '', {
    path,
    expires
  })
}

export const getTimeYYYYMMDD = () => {
  let nowDate = new Date()
  let year = nowDate.getFullYear()
  let month = nowDate.getMonth() + 1
  let day = nowDate.getDate()
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (day >= 0 && day <= 9) {
    day = "0" + day;
  }
  console.log(year + '' + month + '' + day)
  return year + '' + month + '' + day
}