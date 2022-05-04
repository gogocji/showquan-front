import { prepareConnection } from "db/index"
import { Article, Tag } from "db/entity"
import { Divider, Row, Col, BackTop, Pagination, Spin } from 'antd'
import { RocketOutlined } from '@ant-design/icons'
import { IArticle } from 'pages/api/index'
import styles from './index.module.scss';
import dynamic from 'next/dynamic';
import request from 'service/fetch';
import { useState, useEffect, useRef } from 'react';
import { useStore } from 'store/index';
import { observer } from "mobx-react-lite"
import Author from 'components/Author/index'
import UserInfo from 'components/UserInfo/index'
import LazyLoad from 'react-lazyload';
import Login from 'components/Login/index'
import TagList from 'components/TagList/index'
const DynamicComponent = dynamic(() => import('components/ListItem'));

interface ITag {
  id: number;
  title: string;
}

interface IProps {
  articles: IArticle[],
  tags: ITag[];
}

export async function getServerSideProps() {
  const db = await prepareConnection()
  const articles = await db.getRepository(Article).find({
    relations: ['user', 'tags']
  })
  const tags = await db.getRepository(Tag).find({
    relations: ['users'],
  });

  return {
    props: {
      articles: JSON.parse(JSON.stringify(articles)) || [],
      tags: JSON.parse(JSON.stringify(tags)) || [],
    }
  }
}
const Home = (props: IProps) => {
  const { articles, tags } = props;
  const [showAricles, setShowAricles] = useState([...articles]);
  const [currentPage, setCurrentPage] = useState(1)
  const [currentList, setCurrentList] = useState<IArticle[]>(articles.slice(1, 9))
  const [isLoading, setIsLoading] = useState(true)
  // 初始化currentList
  const store = useStore()
  const { isShowDrawer, defStyle} = store.common.commonInfo
  const userId = store.user.userInfo?.userId

  const handlePagination = (e: any) => {
    if (document) {
      document && document.getElementById('root')?.scrollIntoView(true);
    }
    let data = showAricles
    let currentList = data.slice((e-1)*8,e*8)
    setCurrentPage(e)
    setCurrentList(currentList)
    setIsLoading(false)
  }

  const changeTagList = (selectTag: number) => {
    if (document) {
      document && document.getElementById('root')?.scrollIntoView(true);
    }
    if (selectTag) {
      request.get(`/api/article/get?tag_id=${selectTag}`).then((res: any) => {
        if (res?.code === 0) {
          setCurrentList(res?.data)
          setCurrentPage(1)
        }
      }).finally(() => {})
    } else {
      handlePagination(1);
    }
  }
  return (
    // TODO 根据左上角的drawer是否存在来进行padding的样式
    <div id='root' style={isShowDrawer ? {paddingLeft:'306px',transition:'all linear .3s',position:'fixed',width:'170%'} : {}}>
      <BackTop>
        <div className={styles.backToTop} ><RocketOutlined  type="rocket"/></div>
      </BackTop>
      <Row className={styles.container} typeof='flex' justify='center' style={{paddingTop:'3.2rem'}}>
        <Col className={styles.containerLeft} xs={24} sm={24} md={14} lg={14} xl={14} style={{backgroundColor:'rgba(255,255,255,.4)'}}>
          <Spin tip='加载中...' spinning={isLoading}>
            {currentList?.map((article) => (
              <>
                <DynamicComponent article={article} />
              </>
            ))}
            {
              ( currentList.length > 8 ) ? 
                <LazyLoad height={200} offset={-10}>
                  <Pagination showQuickJumper defaultCurrent={1} total={articles.length} onChange={(e)=>{handlePagination(e)}} 
                  className='cssnice3' current={currentPage} style={{textAlign: 'center',padding:'.5rem 0 .5rem'}}/>
                </LazyLoad> : null
            }
          </Spin>
        </Col>
        <Col className={styles.containerRight} xs={0} sm={0} md={5} lg={5} xl={5}>
            {
              !userId ? <Login /> 
              : (
                <div>
                  <Author userInfo={store.user.userInfo} />
                  <UserInfo />
                  <TagList tags={tags} setTagArticle={changeTagList} />
                </div>
                )
            }
        </Col>
      </Row>
    </div>
  )
}

export default observer(Home)