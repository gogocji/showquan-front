/* eslint-disable @next/next/link-passhref */
import React from 'react';
import Link from 'next/link';
import { observer } from 'mobx-react-lite';
import { Button, Avatar, Divider, Row, Col, Spin, Pagination, Tabs, Empty } from 'antd';
import {
  CodeOutlined,
  FireOutlined,
  FundViewOutlined,
} from '@ant-design/icons';
import { prepareConnection } from 'db/index';
import { User, Article } from 'db/entity';
import styles from './index.module.scss';
import RightBar from "components/RightBar"
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic';
import { IArticle } from 'pages/api/index'
import LazyLoad from 'react-lazyload';
import request from 'service/fetch';
import FollowItem from "components/FollowItem"
import { useCallbackState } from 'utils/index'

const DynamicComponent = dynamic(() => import('components/ListItem') as any) as any;

// 文章根据日期排序
const compare = function (obj1: any, obj2: any) {
  var val1 = new Date(obj1.create_time);
  var val2 = new Date(obj2.create_time);
  if (val1 < val2) {
      return -1;
  } 
  else if (val1 > val2) {
      return 1;
  } 
  else {
      return 0;
  }            
}

export async function getStaticPaths() {
  // user/[id]
  const db = await prepareConnection();
  const users = await db.getRepository(User).find();
  const userIds = users?.map((user) => ({ params: { id: String(user?.id) } }));
  
  // [{params: 1}, {params: 2}, {params: 3}]
  return {
    paths: userIds,
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }: { params: any }) {
  const userId = params?.id;
  const db = await prepareConnection();
  const user = await db.getRepository(User).findOne({
    where: {
      id: Number(userId),
    },
  });
  const articles = await db.getRepository(Article).find({
    where: {
      user: {
        id: Number(userId),
      },
    },
    relations: ['user', 'tags'],
  });

  // 文章顺序
  articles.sort(compare).reverse()

  return {
    props: {
      userInfo: JSON.parse(JSON.stringify(user)),
      articles: JSON.parse(JSON.stringify(articles)),
    },
  };
}

// export async function getServerSideProps({ params }: { params: any }) {
//   const userId = params?.id;
//   const db = await prepareConnection();
//   const user = await db.getRepository(User).findOne({
//     where: {
//       id: Number(userId),
//     },
//   });
//   const articles = await db.getRepository(Article).find({
//     where: {
//       user: {
//         id: Number(userId),
//       },
//     },
//     relations: ['user', 'tags'],
//   });

//   return {
//     props: {
//       userInfo: JSON.parse(JSON.stringify(user)),
//       articles: JSON.parse(JSON.stringify(articles)),
//     },
//   };
// }

const UserDetail = (props: any) => {
  const { userInfo = {}, articles = [] } = props;
  const [showAricles, setShowAricles] = useState([...articles]);
  const [currentPage, setCurrentPage] = useState(1)
  const [currentList, setCurrentList] = useCallbackState<IArticle[]>(articles.slice(1, 9)) as any
  const [isLoading, setIsLoading] = useState(true)
  const [followList, setFollowList] = useState([] as any)
  const [collectList] = useState([])
  const [tabKey, setTabKey ] = useState(1)
  const { TabPane } = Tabs;

  const viewsCount = articles?.reduce(
    (prev: any, next: any) => prev + next?.views,
    0
  );

  const getFollowList = () => {
    request.post('/api/follow/getList', {
      byUser_id: userInfo.id
    }).then((res: any) => {
      if (res?.code === 0) {
        const resultList =  res.data
        // let followList = []
        // for (let i = 0; i < resultList.length; i++) {
        //   let userItem = JSON.parse(resultList[i])
        //   followList.push(userItem)
        // }
        setFollowList(resultList)
      }
    })
  }

  const getCollectList = () => {
    request.post('/api/collect/getList', {
      user_id: userInfo.id
    }).then((res: any) => {
      if (res?.code === 0) {
        const resultList =  res.data
        let collectList = []
        for (let i = 0; i < resultList.length; i++) {
          let userItem = JSON.parse(resultList[i])
          collectList.push(userItem)
        }
        setCurrentList(collectList)
        handlePagination(1, collectList)
      }
    })
  }

  useEffect(() => {
    setIsLoading(true)
    if (tabKey == 1) {
      handlePagination(1, articles)
    } else if (tabKey == 2) {
      getFollowList()
    } else if (tabKey == 3) {
      getCollectList()
    }
  }, [])

  const handlePagination = (e: any, itemList: any) => {
    if (document) {
      document && document.getElementById('root')?.scrollIntoView(true);
    }
    let data
    data = itemList
    setShowAricles(itemList)
    let currentList = data.slice((e-1)*8,e*8)
    setCurrentPage(e)
    setCurrentList(currentList, () => {
      setIsLoading(false)
    })
  }

  const handleTabChange = (key: any) => {
    setTabKey(key)
    setCurrentList([], () => {
      setIsLoading(true)
      if (key == 1) {
        handlePagination(1, articles)
      } else if (key == 2) {
        getFollowList()
      } else if (key == 3) {
        getCollectList()
      }
    })
  }

  const handleToPersonal = () => {
    // setFollowList([])
  }

  return (
    <Row className={styles.container} typeof='flex' justify='center' style={{paddingTop:'3.2rem'}}>
      <Col className={styles.containerLeft} xs={24} sm={24} md={14} lg={14} xl={14} style={{backgroundColor:'rgba(255,255,255,.4)'}}>
      <div className={styles.left}>
        <div className={styles.userInfo}>
          <Avatar className={styles.avatar} src={userInfo?.avatar} size={90} />
          <div>
            <div className={styles.nickname}>{userInfo?.nickname}</div>
              {
                userInfo?.job &&
                  (
                    <div className={styles.desc}>
                      <CodeOutlined /> {userInfo?.job}
                    </div>
                  )
              }
            <div className={styles.desc}>
              <FireOutlined /> {userInfo?.introduce}
            </div>
          </div>
          <Link href="/user/profile">
            <Button>编辑个人资料</Button>
          </Link>
        </div>
        <Divider />
        <div className={styles.article}>
          <Tabs defaultActiveKey="1" onChange={handleTabChange}>
            <TabPane tab="文章" key="1">
              {
                currentList.length ? (
                  <Spin tip='加载中...' spinning={isLoading}>
                    {currentList?.map((article: any) => (
                      <>
                        <DynamicComponent key={article.id} article={article} />
                        {/* <ListItem article={article} /> */}
                      </>
                    ))}
                    {
                      ( showAricles.length > 8 ) ? 
                        <LazyLoad height={200} offset={-10}>
                          <Pagination showQuickJumper defaultCurrent={1} total={articles.length} onChange={(e)=>{handlePagination(e, articles)}} 
                          className='cssnice3' current={currentPage} style={{textAlign: 'center',padding:'.5rem 0 .5rem'}}/>
                        </LazyLoad> : null
                    }
                  </Spin>
                ) : (
                  <div className={styles.emptyContainer}>
                    <Empty />
                  </div>
                )
              }
              
            </TabPane>
            <TabPane tab="关注" key="2">
              {
                followList.length ? (
                  followList?.map((item: any) => (
                    <FollowItem handleToPersonal={handleToPersonal} key={item.id} userInfo={item.user} />
                  ))
                )
                : (
                  <div className={styles.emptyContainer}>
                    <Empty />
                  </div>
                )
              }
            </TabPane>
            <TabPane tab="收藏" key="3">
              {
                currentList.length ? (
                  <div>
                    {
                      currentList?.map((article: any) => (
                        <>
                         <DynamicComponent key={article.id} article={article} />
                        </>
                      ))
                    }
                    {
                      ( showAricles.length > 8 ) &&
                        <LazyLoad height={200} offset={-10}>
                          <Pagination showQuickJumper defaultCurrent={1} total={articles.length} onChange={(e)=>{handlePagination(e, collectList)}} 
                          className='cssnice3' current={currentPage} style={{textAlign: 'center',padding:'.5rem 0 .5rem'}}/>
                        </LazyLoad>
                    }
                  </div>
                ) :
                (
                  <div className={styles.emptyContainer}>
                    <Empty />
                  </div>
                )
              }
            </TabPane>
          </Tabs> 
        </div>
      </div>
      </Col>
      <Col className={styles.containerRight} xs={0} sm={0} md={5} lg={5} xl={5}>
        <RightBar ifCanChangeAvatar={true}>
        <div className={styles.achievement}>
          <div className={styles.header}>个人成就</div>
          <div className={styles.number}>
            <div className={styles.wrapper}>
              <FundViewOutlined />
              <span>共创作 {articles?.length} 篇文章</span>
            </div>
            <div className={styles.wrapper}>
              <FundViewOutlined />
              <span>文章被阅读 {viewsCount} 次</span>
            </div>
          </div>
        </div>
        </RightBar>
      </Col>
    </Row>
  );
};

export default observer(UserDetail);
