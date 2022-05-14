import styles from './index.module.scss';
import { HeartTwoTone } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs';
import request from 'service/fetch'

const UserInfo = () => {
  const [nowDayTime, setNowDayTime] = useState('')
  const [nowYearTime, setNowYearTime] = useState('')
  const [userIp, setUserIp] = useState('')
  const [userIpAddress, setUserIpAddress] = useState('')

  const getUserIp = () => {
    request.get('/api/common/getIp')
    .then((res: any) => {
      const userIp = res.data?.userIp
      const userIpAddress = res.data?.userIpAddress
      setUserIp(userIp)
      setUserIpAddress(userIpAddress)
    })
  }

  const getNowTime = () => {
    const date = dayjs();
    let nowDayTime = date.format('hh:mm:ss')
    setNowDayTime(nowDayTime)
  }

  useEffect(() => {
    const date = dayjs();
    let nowYearTime =  date.format('YYYY-MM-DD')
    setNowYearTime(nowYearTime)
    getUserIp()
    setInterval(() => {
      getNowTime()
    }, 1000)
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <span>相见恨晚&nbsp;</span>
        <HeartTwoTone twoToneColor="#eb2f96" />
      </div>
      <div className={styles.content}>
        <div>
          <span>您的IP：</span>
          <span className={styles.contentText}>{userIp}</span>
        </div>
        <div>
          <span>您的地址：</span>
          <span className={styles.contentText}>{userIpAddress}</span>
        </div>
        <div className={styles.contentText}>
          你好呀~，现在是：   
          {nowYearTime} {nowDayTime}。
        </div>
        <div className={styles.contentText}>
          祝你早安 午安 晚安。
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
