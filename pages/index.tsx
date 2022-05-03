import { prepareConnection } from "db/index"
import { Article, Tag } from "db/entity"
import { Divider, Row, Col, BackTop, Pagination } from 'antd'
import { RocketOutlined } from '@ant-design/icons'
import { IArticle } from 'pages/api/index'
import styles from './index.module.scss';
import dynamic from 'next/dynamic';
import request from 'service/fetch';
import { useState, useEffect } from 'react';
import { useStore } from 'store/index';
import { observer } from "mobx-react-lite"
import Author from 'components/Author/index'
import UserInfo from 'components/UserInfo/index'
import LazyLoad from 'react-lazyload';
import Login from 'components/Login/index'
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
  const { articles } = props;
  const [selectTag] = useState(0);
  const [showAricles, setShowAricles] = useState([...articles]);
  const [currentPage, setCurrentPage] = useState(0)
  const [currentList, setCurrentList] = useState<IArticle[]>()
  const store = useStore()
  const { isShowDrawer, defStyle} = store.common.commonInfo
  const userId = store.user.userInfo?.userId
  // const handleSelectTag = (event: any) => {
  //   const { tagid } = event?.target?.dataset || {};
  //   setSelectTag(Number(tagid));
  // };

  useEffect(() => {
    selectTag &&
      request.get(`/api/article/get?tag_id=${selectTag}`).then((res: any) => {
        if (res?.code === 0) {
          setShowAricles(res?.data);
        }
      });
  }, [selectTag]);

  const handlePagination = (e: any) => {
    let data = showAricles
    let currentList = data.slice((e-1)*8,e*8)
    setCurrentPage(e)
    setCurrentList(currentList)
    if (document) {
      document && document.getElementById('root')?.scrollIntoView(true);
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
          {currentList?.map((article) => (
            <>
              <DynamicComponent article={article} />
            </>
          ))}
          <LazyLoad height={200} offset={-10}>
            <Pagination showQuickJumper defaultCurrent={1} total={articles.length} onChange={(e)=>{handlePagination(e)}} 
            className='cssnice3' current={currentPage} style={{textAlign: 'center',padding:'.5rem 0 .5rem'}}/>
          </LazyLoad>
        </Col>
        <Col className={styles.containerRight} xs={0} sm={0} md={5} lg={5} xl={5}>
            {
              !userId ? <Login /> 
              : (
                <div>
                  <Author userInfo={store.user.userInfo} />
                  <UserInfo />
                </div>
                )
            }
        </Col>
      </Row>
    </div>
    // <div>
    //   <div className={styles.tags} onClick={handleSelectTag}>
    //     {tags?.map((tag) => (
    //       <div
    //         key={tag?.id}
    //         data-tagid={tag?.id}
    //         className={classnames(
    //           styles.tag,
    //           selectTag === tag?.id ? styles['active'] : ''
    //         )}
    //       >
    //         {tag?.title}
    //       </div>
    //     ))}
    //   </div>
    // </div>
  )
}

export default observer(Home)