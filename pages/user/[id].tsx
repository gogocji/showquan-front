/* eslint-disable @next/next/link-passhref */
import React from 'react';
import Link from 'next/link';
import { observer } from 'mobx-react-lite';
import { Button, Avatar, Divider, Row, Col, Spin, Pagination, Tabs,  } from 'antd';
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

const DynamicComponent = dynamic(() => import('components/ListItem'));

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
  const [currentList, setCurrentList] = useState<IArticle[]>(articles.slice(1, 9))
  const [isLoading, setIsLoading] = useState(true)
  const { TabPane } = Tabs;

  const viewsCount = articles?.reduce(
    (prev: any, next: any) => prev + next?.views,
    0
  );
  useEffect(() => {
    setIsLoading(false)
  }, [currentList])

  const handlePagination = (e: any) => {
    if (document) {
      document && document.getElementById('root')?.scrollIntoView(true);
    }
    let data
    data = articles
    setShowAricles(articles)
    let currentList = data.slice((e-1)*8,e*8)
    setCurrentPage(e)
    setCurrentList(currentList)
  }

  const handleTabChange = (key) => {
    console.log(key);
  }

  return (
    <Row className={styles.container} typeof='flex' justify='center' style={{paddingTop:'3.2rem'}}>
      <Col className={styles.containerLeft} xs={24} sm={24} md={14} lg={14} xl={14} style={{backgroundColor:'rgba(255,255,255,.4)'}}>
      <div className={styles.left}>
        <div className={styles.userInfo}>
          <Avatar className={styles.avatar} src={userInfo?.avatar} size={90} />
          <div>
            <div className={styles.nickname}>{userInfo?.nickname}</div>
            <div className={styles.desc}>
              <CodeOutlined /> {userInfo?.job}
            </div>
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
              <Spin tip='加载中...' spinning={isLoading}>
                {currentList?.map((article) => (
                  <>
                    <DynamicComponent article={article} />
                  </>
                ))}
                {
                  ( showAricles.length > 8 ) ? 
                    <LazyLoad height={200} offset={-10}>
                      <Pagination showQuickJumper defaultCurrent={1} total={articles.length} onChange={(e)=>{handlePagination(e)}} 
                      className='cssnice3' current={currentPage} style={{textAlign: 'center',padding:'.5rem 0 .5rem'}}/>
                    </LazyLoad> : null
                }
              </Spin>
            </TabPane>
            <TabPane tab="关注" key="2">
              Content of Tab Pane 2
            </TabPane>
            <TabPane tab="收藏" key="3">
              Content of Tab Pane 3
            </TabPane>
          </Tabs> 
        </div>
      </div>
      </Col>
      <Col className={styles.containerRight} xs={0} sm={0} md={5} lg={5} xl={5}>
        <RightBar>
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
