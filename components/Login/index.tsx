import styles from './index.module.scss'
import { ChangeEvent, useState } from 'react'
import { message } from 'antd'
import { useStore } from 'store/index'
import CountDown from 'components/CountDown'
import request from 'service/fetch'
import { observer } from "mobx-react-lite"
import { Avatar } from 'antd'
import { GithubOutlined, QqOutlined, WechatOutlined } from '@ant-design/icons'

const Login = () => {
  const store = useStore()
  const [isShowVerifyCode, setIsShowVerifyCode] = useState(false)
  const [ form, setForm ] = useState({
    phone: '',
    verify: ''
  })

  const handleGetVerifyCode = () => {
    // setIsShowVerifyCode(true)
    // 校验用户输入的手机号
    if (!form?.phone) {
      message.warning('请输入手机号')
      return
    }

    request.post('/api/user/sendVerifyCode', {
      to: form?.phone,
      templateId: 1
    }).then((res: any) => {
      if (res?.code === 0) {
        setIsShowVerifyCode(true)
      } else {
        message.error(res?.msg || '未知错误')
      }
    })
  }

  const handleLogin = () => {
    request.post('/api/user/login', {
      ...form,
      identity_type: 'phone'
    }).then((res: any) => {
      if (res?.code === 0) {
        // 登录成功
        console.log('登录的用户信息', res?.data)
        store.user.setUserInfo(res?.data)
        setForm({
          phone: '',
          verify: ''
        })
        setIsShowVerifyCode(false)
      } else {
        message.error(res?.msg || '未知错误')
      }
    })
  }

  // client-id:b38643ee814f81945179
  // client-secret: c137a9e7f13b334e8f7bcc7d90fa3c2357aa1a79
  const handleOAuthGithub = () => {
    const githubClientId = 'b38643ee814f81945179'
    const redirectUrl = 'http://localhost:3000/api/oauth/redirect'
    window.open(`https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${redirectUrl}`)
  }

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value} = e.target;
    setForm({
      ...form,
      [name]: value
    })
  }

  const handleCountDownEnd = () => {
    setIsShowVerifyCode(false)
  }
  return (
    <div className={styles.loginArea} >
      <div className={styles.loginBox}>
        <div className={styles.loginTitle}>
          <p>手机登录</p>
        </div>
        <input type="text" placeholder="请输入手机号" name="phone" value={form.phone} onChange={handleFormChange}/>
        <div className={styles.verifyCodeArea}>
          <input type="text" placeholder="请输入验证码" name="verify" value={form.verify} onChange={handleFormChange}/>
          <span className={styles.verifyCode} onClick={handleGetVerifyCode}>
            { isShowVerifyCode ? <CountDown time={60} onEnd={handleCountDownEnd} /> : '获取验证码'}
          </span>
        </div>
        <div className={styles.loginBtn} onClick={handleLogin}>登录</div>
        <div className={styles.otherLogin}>
          <div className={styles.loginItem}>
            <Avatar size={48} icon={<WechatOutlined />} style={{backgroundColor:'#e5ffe1',color:'#00cc63'}}>
            </Avatar> 
          </div>
          <div className={styles.loginItem}>
            <Avatar size={48} icon={<QqOutlined />} style={{backgroundColor:'#edf5ff',color:'#368afe'}}>
            </Avatar>  
          </div>
          <div className={styles.loginItem} onClick={handleOAuthGithub}>
            <Avatar  size={48} icon={<GithubOutlined /> }  style={{backgroundColor:'rgb(240, 240, 240)',color:'black'}}>
            </Avatar>
          </div>
        </div>
        <div className={styles.loginPrivacy}>
          注册登录即表示同意{' '}
          <a
            href="https://moco.imooc.com/privacy.html"
            target="_blank"
            rel="noreferrer"
          >
            隐私政策
          </a>
        </div>
      </div>
    </div>
  )
}

export default observer(Login)

