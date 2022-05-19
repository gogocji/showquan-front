import styles from './index.module.scss';
import { Avatar, Button, message } from 'antd'
import { IUserInfo } from 'store/userStore';
import { useStore } from 'store';
import request from 'service/fetch';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import io from 'socket.io-client'
var socket : any
interface IProps {
  userInfo: IUserInfo
}
const FollowItem = (props: IProps) => {
  const { userInfo } = props
  const store = useStore()
  const [hasFollow, setHasFollow] = useState(true)
  const loginUserInfo = store.user.userInfo

  const handleDelFollow = () => {
    const byUser_id = loginUserInfo.userId
    const user_id = userInfo.id
    console.log(byUser_id, user_id)
    request.post('/api/follow/del', {
      user_id,
      byUser_id
    }).then((res: any) => {
      if (res?.code === 0) {
        message.success('取消关注成功')
        setHasFollow(false)
      }
    })
  }

  const handleFollow = () => {
    request.post('/api/follow/publish', {
      user: userInfo,
      byUser_id: loginUserInfo.userId
    }).then((res: any) => {
      if (res?.code === 0) {
        message.success('关注成功')
        setHasFollow(true)
        // socket通知用户
        socket.emit('message', {
          userId: userInfo.id,
          fromUserId: loginUserInfo.userId,
          content: '关注信息'
        })
      }
    })
  }
  useEffect(() => {
    if (!socket) {
      socket = io('http://localhost:3000')
    }
  }, [])
  return (
    <Link key={userInfo.id} href={`/user/${userInfo.id}`}>
      <div className={styles.item}>
        <div className={styles.itemLeft}>
          <Avatar className={styles.avatar} src={userInfo?.avatar} size={48} />
          <div className={styles.userInfo}>
            <div className={styles.nickname}>{userInfo.nickname}</div>
            <div className={styles.introduce}>{userInfo.introduce}</div>
          </div>
        </div>
        <div className={styles.itemRight}>
          {
            hasFollow ? <Button onClick={handleDelFollow} className={styles.button}>已关注</Button>
            : <Button onClick={handleFollow} className={styles.button}>关注</Button>
          }
        </div>
      </div>
    </Link>
  );
};

export default FollowItem;
