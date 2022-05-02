import { useState, useEffect } from 'react'
import styles from './index.module.scss'
import userStore, { IUserInfo } from 'store/userStore'
import { Avatar } from 'antd'
import { useStore } from 'store/index';

interface IProps {
  userInfo: IUserInfo
}

const CountDown = (props: IProps) => {
  const { userInfo } = props;
  const store = useStore()
  const defstyle = store.common.commonInfo?.defstyle

  const changeAvatar = () => {
    store.common.setCommonInfo({ defstyle: !defstyle })
  }
  return (
    <div className={styles.container}>
      <div className={styles.avatar}>
        <Avatar size={100} src={userInfo.avatar} className={styles.userlight} onMouseEnter={()=>{changeAvatar()}}/>
      </div>
      <div className='userName' style={defstyle ?{color:'hotpink'}:{color:'rgba(0, 0, 0, 0.65)'}}>{userInfo.nickname}</div>
      <div className='author-introduction' style={{ color: 'rgb(0,216,255)' }}>软件工程</div>
      <div className='author-introduction myname1' style={{ color: 'rgb(0,216,255)' }}>2017-2021级学生</div>
      <div className='author-introduction position'></div>
    </div>
  )
}

export default CountDown;