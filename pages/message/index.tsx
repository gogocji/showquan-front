import styles from './index.module.scss'
import { Row, Col, Tabs } from 'antd';
import RightBar from "components/RightBar"
import { useEffect, useState } from 'react'
import MyMessage from 'components/MyMessage'
import request from 'service/fetch';
import { useStore } from 'store/index'
import { observer } from "mobx-react-lite"
import { Skeleton, Empty } from 'antd'
import io from 'socket.io-client'
var socket : any
const Message = () => {
  const { TabPane } = Tabs;
  // 设置每一个tab的消息列表
  const [commentMessages, setCommentMessages] = useState([])
  const [thumbMessages, setThumbMessages] = useState([])
  const [followMessages, setFollowMessages] = useState([])
  const [systemMessages, setSystemMessages] = useState([])
  
  // 设置是否有对应的消息并对小红点进行展示
  const [hasComment, setHasComment] = useState(false)
  const [hasThumb, setHasThumb] = useState(false)
  const [hasFollow, setHasFollow] = useState(false)
  const [hasSystem, setHasSystem] = useState(false)
  const [showSkeleton, setShowSkeleton] = useState(true)
	const store = useStore()

  // tab切换的时候触发
  const handleTabChange = (key: any) => {
    setShowSkeleton(true)
    if (key == 1) {
      setHasComment(false)
      getCommentMessage()
    } else if (key == 2) {
      setHasThumb(false)
      getThumbMessage()
    } else if (key == 3) {
      setHasFollow(false)
      getFollowMessage()
    } else if (key == 4) {
      setHasSystem(false)
      getNotificationMessage()
    }
  }

  // 根据不同的消息类型，给不同的tab设置小红点
  const changeTabStatus = (type: any) => {
    if (type === 'thumb') setHasThumb(true)
    else if (type === 'follow') setHasFollow(true)
    else if (type === 'system') setHasSystem(true)
  }
  // 获取最新的消息类型，用于设置小红点
  const getNewMessage = () => {
    request.post('/api/user/message/getNewMessageType', {
      user_id: store.user.userInfo.userId
    })
      .then((res: any) => {
        if (res?.code === 0) {
          res.data.map((item: any) => {
            changeTabStatus(item)
          })
        }
      })
  }
  // 获取当前评论消息列表
  const getCommentMessage = () => {
    request.post('/api/user/message/getCommentMessage', {
      user_id: store.user.userInfo.userId
    }).then((res: any) => {
      if (res?.code === 0) {
        setShowSkeleton(false)
        setCommentMessages(res.data)
      }
    })
  }
  // 获取当前关注消息列表
  const getFollowMessage = () => {
    request.post('/api/user/message/getFollowMessage', {
      user_id: store.user.userInfo.userId
    }).then((res: any) => {
      if (res?.code === 0) {
        setShowSkeleton(false)
        setFollowMessages(res.data)
      }
    })
  }
  const getThumbMessage = () => {
    request.post('/api/user/message/getThumbMessage', {
      user_id: store.user.userInfo.userId
    }).then((res: any) => {
      if (res?.code === 0) {
        setShowSkeleton(false)
        setThumbMessages(res.data)
      }
    })
  }
  // 获取当前系统消息列表
  const getNotificationMessage = () => {
    request.post('/api/common/notification/getSystemNotification', {
      is_start: 1
    }).then((res: any) => {
      if (res?.code === 0) {
        setShowSkeleton(false)
        setSystemMessages(res.data)
      }
    })
  }

  useEffect(() => {
    getNewMessage()
    getCommentMessage()
    if (!socket) {
      socket = io('http://localhost:3000')
    }
  }, [store.common.commonInfo.hasComment])

  return (
    <Row className={styles.container} typeof='flex' justify='center' style={{paddingTop:'3.2rem'}}>
      <Col className={styles.containerLeft} xs={24} sm={24} md={14} lg={14} xl={14} style={{backgroundColor:'rgba(255,255,255,.4)'}}>
        <div className={styles.messageContainer}>
          <Tabs tabBarStyle={{background: 'white', width: '100%', paddingLeft: '10px' }} defaultActiveKey="1" onChange={handleTabChange}>
            <TabPane className={styles.tabItem} tab={
              <span>
                评论消息
                { hasComment && <div className={styles.hasTips}></div>} 
              </span>
            } key="1">
              {
                commentMessages.length ? (
                  commentMessages.map(item => (
                    <MyMessage key={item} type='comment' contentItem={item} />
                  ))
                ) : (
                  showSkeleton 
                  ? (
                      <div className={styles.skeleton}>
                        <Skeleton className={styles.skeletonItem} avatar paragraph={{ rows: 1 }} />
                        <Skeleton className={styles.skeletonItem} avatar paragraph={{ rows: 1 }} />
                        <Skeleton className={styles.skeletonItem} avatar paragraph={{ rows: 1 }} />
                      </div>
                    )
                  : (
                    <div className={styles.emptyContainer}>
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                    </div>
                  )
                )
              }
            </TabPane>
            <TabPane className={styles.tabItem} tab={
              <span>
                点赞消息
                { hasThumb && <div className={styles.hasTips}></div>} 
              </span>
            } key="2">
              {
                thumbMessages.length ? (
                  thumbMessages.map(item => (
                    <MyMessage key={item} type='thumb' contentItem={item} />
                  ))
                ) : (
                  showSkeleton 
                  ? (
                      <div className={styles.skeleton}>
                        <Skeleton className={styles.skeletonItem} avatar paragraph={{ rows: 2 }} />
                        <Skeleton className={styles.skeletonItem} avatar paragraph={{ rows: 2 }} />
                        <Skeleton className={styles.skeletonItem} avatar paragraph={{ rows: 2 }} />
                      </div>
                    )
                  : (
                    <div className={styles.emptyContainer}>
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                    </div>
                  )
                )
              }
            </TabPane>
            <TabPane className={styles.tabItem} tab={
              <span>
               关注消息
                { hasFollow && <div className={styles.hasTips}></div>} 
              </span>
            } key="3">
              {
                followMessages.length ? (
                  followMessages.map(item => (
                    <MyMessage key={item} type='follow' contentItem={item} />
                  ))
                ) : (
                  showSkeleton 
                  ? (
                      <div className={styles.skeleton}>
                        <Skeleton className={styles.skeletonItem} avatar paragraph={{ rows: 2 }} />
                        <Skeleton className={styles.skeletonItem} avatar paragraph={{ rows: 2 }} />
                        <Skeleton className={styles.skeletonItem} avatar paragraph={{ rows: 2 }} />
                      </div>
                    )
                  : (
                    <div className={styles.emptyContainer}>
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                    </div>
                  )
                )
              }
            </TabPane>
            <TabPane className={styles.tabItem} tab={
              <span>
                系统消息
                { hasSystem && <div className={styles.hasTips}></div>} 
              </span>
            } key="4">
              {
                systemMessages.length ? (
                  systemMessages.map(item => (
                    <MyMessage key={item} type='system' contentItem={item} />
                  ))
                ) : (
                  showSkeleton 
                  ? (
                      <div className={styles.skeleton}>
                        <Skeleton className={styles.skeletonItem} avatar paragraph={{ rows: 2 }} />
                        <Skeleton className={styles.skeletonItem} avatar paragraph={{ rows: 2 }} />
                        <Skeleton className={styles.skeletonItem} avatar paragraph={{ rows: 2 }} />
                      </div>
                    )
                  : (
                    <div className={styles.emptyContainer}>
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                    </div>
                  )
                )
              }
            </TabPane>
          </Tabs>
        </div>
      </Col>
      <Col className={styles.containerRight} xs={0} sm={0} md={5} lg={5} xl={5}>
        <RightBar ifCanChangeAvatar={true}>
          <></>
        </RightBar>
      </Col>
    </Row>
  )
}

export default observer(Message)