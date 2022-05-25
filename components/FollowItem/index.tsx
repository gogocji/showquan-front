import styles from './index.module.scss';
import { Avatar, Button, message } from 'antd'
import { IUserInfo } from 'store/userStore';
import { useStore } from 'store';
import request from 'service/fetch';
import { useEffect, useState } from 'react';
import io from 'socket.io-client'
import { useRouter } from 'next/router'

var socket : any
interface IProps {
  userInfo: IUserInfo,
  handleToPersonal?: () => void
}
const FollowItem = (props: IProps) => {
  const { userInfo, handleToPersonal } = props
  const store = useStore()
  const [hasFollow, setHasFollow] = useState(true)
  const loginUserInfo = store.user.userInfo
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)
  const { push } = useRouter()

  const handleDelFollow = () => {
    const byUser_id = loginUserInfo.userId
    const user_id = userInfo.id
    console.log(byUser_id, user_id)
    setIsSubmitLoading(true)
    request.post('/api/follow/del', {
      user_id,
      byUser_id
    }).then((res: any) => {
      if (res?.code === 0) {
        message.success('取消关注成功')
        setHasFollow(false)
      }
      setIsSubmitLoading(false)
    })
  }

  const handleFollow = () => {
    setIsSubmitLoading(true)
    request.post('/api/follow/publish', {
      user: userInfo,
      byUser_id: loginUserInfo.userId
    }).then((res: any) => {
      if (res?.code === 0) {
        message.success('关注成功')
        setHasFollow(true)
        // socket通知用户
        const userId = userInfo.id
        const fromUserId = loginUserInfo.userId
        if (userId != fromUserId) {
          socket.emit('message', {
            userId,
            fromUserId,
            content: '关注信息'
          })
        }
      }
      setIsSubmitLoading(false)
    })
  }

  const handleGotoPersonalPage = () => {
    push(`/user/${userInfo.id}`);
    handleToPersonal && handleToPersonal()
  }

  useEffect(() => {
    if (!socket) {
      socket = io('http://localhost:3000')
    }
  }, [])

  return (
    <div className={styles.item}>
      <div className={styles.itemLeft}>
        <div onClick={handleGotoPersonalPage} style={{cursor: 'pointer'}}>
          <Avatar className={styles.avatar} src={userInfo?.avatar} size={48} />
        </div>
        <div className={styles.userInfo}>
          <div className={styles.nickname}>{userInfo.nickname}</div>
          <div className={styles.introduce}>{userInfo.introduce}</div>
        </div>
      </div>
      <div className={styles.itemRight}>
        {
          hasFollow ? <Button loading={isSubmitLoading} onClick={handleDelFollow} className={styles.button}>已关注</Button>
          : <Button loading={isSubmitLoading} onClick={handleFollow} className={styles.button}>关注</Button>
        }
      </div>
    </div>
  );
};

export default FollowItem;
