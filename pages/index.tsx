import { prepareConnection } from "db/index"
import { Article, Tag } from "db/entity"
import { Row, Col, Pagination, Spin } from 'antd'
import { IArticle } from 'pages/api/index'
import styles from './index.module.scss';
import dynamic from 'next/dynamic';
import request from 'service/fetch';
import { useState, useEffect } from 'react';
import { observer } from "mobx-react-lite"
import LazyLoad from 'react-lazyload';
import TagList from 'components/TagList/index'
import RightBar from "components/RightBar"
import redis from 'lib/redis'

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
  // 获取点赞排行榜
  const thumbResult = await redis.zrevrange('z_article_like', 0, 10, 'WITHSCORES')
  // 改变数据结构
  let thumbTopList = [];
  for (let i = 0; i < thumbResult.length; i++) {
    if (i === 0 || i % 2 === 0) {
      thumbTopList.push(thumbResult[i])
    }
  }
  return {
    props: {
      articles: JSON.parse(JSON.stringify(articles)) || [],
      tags: JSON.parse(JSON.stringify(tags)) || [],
      thumbTopList: JSON.parse(JSON.stringify(thumbTopList)) || [],
    }
  }
}
const Home = (props: IProps) => {
  const { articles, tags, thumbTopList } = props;
  const [showAricles, setShowAricles] = useState([...articles]);
  const [currentPage, setCurrentPage] = useState(1)
  const [selectTag, setSelectTag] = useState(0)
  const [currentList, setCurrentList] = useState<IArticle[]>(articles.slice(1, 9))
  const [isLoading, setIsLoading] = useState(true)
  console.log('thumbTopList', thumbTopList)
  // 初始化currentList
  useEffect(() => {
    setIsLoading(false)
  }, [currentList])

  const handlePagination = (e: any, tagId = selectTag, showList = articles) => {
    if (document) {
      document && document.getElementById('root')?.scrollIntoView(true);
    }
    let data
    if (tagId) {
      data = showList
      setShowAricles(showList)
    } else {
      data = articles
      setShowAricles(articles)
    }
    let currentList = data.slice((e-1)*8,e*8)
    setCurrentPage(e)
    setCurrentList(currentList)
  }

  const changeTagList = (selectTag: number) => {
    setSelectTag(selectTag)
    if (document) {
      document && document.getElementById('root')?.scrollIntoView(true);
    }
    if (selectTag) {
      request.get(`/api/article/get?tag_id=${1}`).then((res: any) => {
        if (res?.code === 0) {
          // 解决异步的问题
          handlePagination(1, selectTag, res?.data)
        }
      }).finally(() => {
      })
    } else {
      handlePagination(1, selectTag)
    }
  }

  return (
    // TODO 根据左上角的drawer是否存在来进行padding的样式
    <Row className={styles.container} typeof='flex' justify='center' style={{paddingTop:'3.2rem'}}>
      <Col className={styles.containerLeft} xs={24} sm={24} md={14} lg={14} xl={14} style={{backgroundColor:'rgba(255,255,255,.4)'}}>
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
      </Col>
      <Col className={styles.containerRight} xs={0} sm={0} md={5} lg={5} xl={5}>
        <RightBar>
          <TagList tags={tags} setTagArticle={changeTagList} />
        </RightBar>
      </Col>
    </Row>
  )
}

export default observer(Home)