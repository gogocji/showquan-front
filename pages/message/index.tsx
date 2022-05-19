import styles from './index.module.scss'
import { Row, Col, Tabs } from 'antd';
import RightBar from "components/RightBar"
import { useEffect, useState } from 'react'
import MyMessage from 'components/MyMessage'
import request from 'service/fetch';
import { useStore } from 'store/index'
import { observer } from "mobx-react-lite"
import { Divider, Empty } from 'antd'
import io from 'socket.io-client'
var socket : any
const Message = () => {
  const { TabPane } = Tabs;
  const [commentMessages, setCommentMessages] = useState([])
  const [thumbtMessages, setThumbMessages] = useState([])
  const [followMessages, setFollowMessages] = useState([])
  const [systemMessages, setSystemMessages] = useState([])
  const [hasComment, setHasComment] = useState(false)
  const [hasThumb, setHasThumb] = useState(false)
  const [hasFollow, setHasFollow] = useState(false)
  const [hasSystem, setHasSystem] = useState(false)
	const store = useStore()

  const commentTest = {
    user: {
      nickname: '啊狗',
      userid: 28,
      avatar: '/images/avatar.jpg'
    },
    create_time: '2022-05-12 20:40:44',
    article: {
      title: '主题',
      article_id: 9
    },
    content: '评论内容'
  }
  const followTest = {
    user: {
      nickname: '啊狗',
      userid: 28,
      avatar: '/images/avatar.jpg'
    }
  }
  const thumbTest = {
    user: {
      nickname: '啊狗',
      userid: 28,
      avatar: '/images/avatar.jpg'
    },
    article: {
      title: '主题',
      article_id: 9
    },
    create_time: '2022-05-12 20:40:44',
  }
  const systemTest = {
    user: {
      nickname: '啊狗',
      userid: 28,
      avatar: '/images/avatar.jpg'
    },
    content: '系统消息',
    create_time: '2022-05-12 20:40:44',
  }
  const handleTabChange = (key: any) => {
    console.log('111', key)
    if (key == 1) {
      setHasComment(false)
      getCommentMessage()
    } else if (key == 2) {
      setHasThumb(false)
    } else if (key == 3) {
      setHasFollow(false)
      getFollowMessage()
    } else if (key == 4) {
      setHasSystem(false)
    }
  }
  const changeTabStatus = (type) => {
    if (type === 'thumb') setHasThumb(true)
    else if (type === 'follow') setHasFollow(true)
    else if (type === 'system') setHasSystem(true)
  }
  const getNewMessage = () => {
    request.post('/api/user/message/getNewMessageType', {
      user_id: store.user.userInfo.userId
    })
      .then((res) => {
        if (res?.code === 0) {
          res.data.map(item => {
            changeTabStatus(item)
          })
        }
      })
  }
  const getCommentMessage = () => {
    request.post('/api/user/message/getCommentMessage', {
      user_id: store.user.userInfo.userId
    }).then((res) => {
      if (res?.code === 0) {
        console.log('res', res)
        setCommentMessages(res.data)
      }
    })
  }
  const getFollowMessage = () => {
    request.post('/api/user/message/getFollowMessage', {
      user_id: store.user.userInfo.userId
    }).then((res) => {
      if (res?.code === 0) {
        console.log('res', res)
        setFollowMessages(res.data)
      }
    })
  }
  useEffect(() => {
    getNewMessage()
    getCommentMessage()
    if (!socket) {
      socket = io('http://localhost:3000')
    }
    // store.common.setCommonInfo({hasMessage: !store.common.commonInfo.hasMessage})
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
                  <div className={styles.emptyContainer}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                  </div>
                )
              }
            </TabPane>
            <TabPane className={styles.tabItem} tab={
              <span>
                点赞消息
                { hasThumb && <div className={styles.hasTips}></div>} 
              </span>
            } key="2">
              <MyMessage type='thumb' contentItem={thumbTest} />
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
                  <div className={styles.emptyContainer}>
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE}/>
                  </div>
                )
              }
            </TabPane>
            <TabPane className={styles.tabItem} tab={
              <span>
                系统消息
                { hasSystem && <div className={styles.hasTips}></div>} 
              </span>
            } key="4">
              <MyMessage type='system' contentItem={systemTest} />
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