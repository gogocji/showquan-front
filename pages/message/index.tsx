import styles from './index.module.scss'
import { Row, Col, Tabs } from 'antd';
import RightBar from "components/RightBar"
import { useState } from 'react'
import MyMessage from 'components/MyMessage'

const Message = () => {
  const { TabPane } = Tabs;
  const [commentMessages, setCommentMessages] = useState([])
  const [thumbtMessages, setThumbMessages] = useState([])
  const [followMessages, setFollowMessages] = useState([])
  const [systemMessages, setSystemMessages] = useState([])
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
  }
  return (
    <Row className={styles.container} typeof='flex' justify='center' style={{paddingTop:'3.2rem'}}>
      <Col className={styles.containerLeft} xs={24} sm={24} md={14} lg={14} xl={14} style={{backgroundColor:'rgba(255,255,255,.4)'}}>
        <div className={styles.messageContainer}>
          <Tabs tabBarStyle={{background: 'white', width: '100%', paddingLeft: '10px' }} defaultActiveKey="1" onChange={handleTabChange}>
            <TabPane tab="评论消息" key="1">
              <MyMessage type='comment' contentItem={commentTest} />
            </TabPane>
            <TabPane tab="点赞消息" key="2">
              <MyMessage type='thumb' contentItem={thumbTest} />
            </TabPane>
            <TabPane tab="关注消息" key="3">
              <MyMessage type='follow' contentItem={followTest} />
            </TabPane>
            <TabPane tab="系统消息" key="4">
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

export default Message