import { prepareConnection } from "db/index"
import { Article, Tag } from "db/entity"
import { Row, Col, Pagination, Spin, Divider, Input, message, Empty, Drawer } from 'antd'
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
import HotArticle from "components/HotArticle";
import HotUser from "components/HotUser";
import { ChangeEvent } from 'react'
import { User } from 'db/entity/index';
import { useStore } from 'store/index';

const DynamicComponent = dynamic(() => import('components/ListItem'));
const { Search } = Input

interface ITag {
  id: number;
  title: string;
}

interface IProps {
  articles: IArticle[],
  tags: ITag[];
  thumbTopList: [],
  userTopList: []
}

// 文章根据日期排序
const compare = function (obj1, obj2) {
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

export async function getServerSideProps() {
  const db = await prepareConnection()
  const userRepo = db.getRepository(User);
  const articles = await db.getRepository(Article).find({
    relations: ['user', 'tags']
  })
  // 文章顺序
  articles.sort(compare).reverse()
  const tags = await db.getRepository(Tag).find({
    relations: ['users'],
  });
  // 获取点赞排行榜
  const thumbResult = await redis.zrevrange('z_article_like', 0, 5, 'WITHSCORES')
  // 获取用户排行榜
  const userHotList = await redis.zrange('z_user_hot', 0, 5, 'WITHSCORES')
  
  // 改变点赞排行榜数据结构
  let thumbTopList = [];
  let obj = {}
  console.log('后端thumbResult', thumbResult, thumbTopList.length)
  for (let i = 0; i < thumbResult.length;i++) {
    if (i === 0 || i % 2 === 0) {
      let thumbObj = JSON.parse(thumbResult[i])
      obj = {...thumbObj}
    } else {
      obj.like_count = thumbResult[i]
      thumbTopList.push(obj)
    }
  }

  // 改变用户排行榜数据结构
  let userTopTemplList = [];
  let userTopIdList = []
  let userObj = {}
  for (let i = 0; i < userHotList.length;i++) {
    if (i === 0 || i % 2 === 0) {
      userObj.user_id = userHotList[i]
      userTopIdList.push(userHotList[i])
    } else {
      userObj.hot_count = userHotList[i]
      userTopTemplList.push(userObj)
    }
  }
  // TODO
  let userTopList = []
  if (userTopIdList.length) {
    userTopList = await userRepo.createQueryBuilder("user")
    .where(
      "user.id IN (" + userTopIdList + ")"
    )
    .getMany()
  }
  console.log('users', userTopList)
  // userTopTemplList.map(async (userItem) => {
  //   const user_id = userItem.user_id
  //   const user = await userRepo.find({
  //     where: {
  //       id: [1| 2],
  //     },
  //   });
  //   user.hot_count = userItem.hot_count
  //   userTopList.push(user)
  // })
  console.log('用户排行榜', userTopTemplList)
  return {
    props: {
      articles: JSON.parse(JSON.stringify(articles)) || [],
      tags: JSON.parse(JSON.stringify(tags)) || [],
      thumbTopList: JSON.parse(JSON.stringify(thumbTopList)) || [],
      userTopList: JSON.parse(JSON.stringify(userTopList)) || []
    }
  }
}
const Home = (props: IProps) => {
  const { articles, tags, thumbTopList, userTopList } = props;
  const [showAricles, setShowAricles] = useState([...articles]);
  const [currentPage, setCurrentPage] = useState(1)
  const [selectTag, setSelectTag] = useState(0)
  const [currentList, setCurrentList] = useState<IArticle[]>(articles.slice(1, 9))
  const [isLoading, setIsLoading] = useState(true)
  const [searchValue, setSearchValue] = useState('')
  const store = useStore()
  var isDrawerOpen = store.common.commonInfo.isShowDrawer
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
      console.log('showList', showList)
      setShowAricles(showList)
    } else {
      data = articles
      setShowAricles(articles)
    }
    let currentList = data.slice((e-1)*8,e*8)
    console.log('currentList', currentList)
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

  // 处理用户搜索内容
  const handleSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value)
    let searchValue = e.target.value.toLocaleUpperCase() // 转换成小写
    if (searchValue.length > 0) {
      let blogList = articles
      let regexpList = [] as IArticle[] // 存储匹配到的数据
      blogList.map((item: IArticle) => {
        // 拼接这个博客的所有信息
        let itemAllInfo = item.content + item.description + item.title + item.user?.nickname
        // 防止正则匹配失败
        var re;
        try {
          re = new RegExp(searchValue, 'i') // i表示忽略大小写
        } catch (error) {
          message.warning('搜索词出错,请重新输入!')
          searchValue ='\\w'
          re = new RegExp( searchValue , 'i')
          setSearchValue('')
        }

        if (re.test(itemAllInfo.toLowerCase())) {
          regexpList.push(item)
        }
      })
      console.log('regexpList', regexpList)
      // setShowAricles(regexpList)
      handlePagination(1, 1, regexpList)
    } else {
      setShowAricles(articles)
    }

  }

  const closeDrawer = () => {
    store.common.setCommonInfo({ isShowDrawer: false})
  }
 
  return (
    // TODO 根据左上角的drawer是否存在来进行padding的样式
    <Row className={styles.container} typeof='flex' justify='center' style={{paddingTop:'3.2rem'}}>
      <Col className={styles.containerLeft} xs={24} sm={24} md={14} lg={14} xl={14} style={{backgroundColor:'rgba(255,255,255,.4)'}}>
        <Drawer

            width={306}
            placement="left"
            closable={true}
            onClose={closeDrawer}
            visible={isDrawerOpen}
            // drawerStyle={{backgroundColor: 'rgb(245 249 253)'}}
          >
            <RightBar ifCanChangeAvatar={false}>
              <TagList tags={tags} setTagArticle={changeTagList} />
              <Divider style={{margin: '10px 0'}} dashed></Divider>
              <HotArticle thumbTopList={thumbTopList}/>
              <Divider style={{margin: '10px 0'}} dashed></Divider>
              <HotUser userTopList={userTopList}/>
            </RightBar>
          </Drawer>
        <Row className={styles.searchContainer}>
          <Col xs={12} sm={14} md={15} lg={17} xl={17}><div style={{ fontWeight: 'bold', paddingLeft: 20 ,lineHeight: '32px'}}>博客日志 <span style={{color: 'red'}}>{showAricles.length}</span> 篇</div></Col>
          <Col xs={11} sm={9} md={8} lg={6} xl={6}><Search value={searchValue} placeholder="搜索首页内容" onChange={(e)=>{handleSearchInput(e)}} /></Col>
          <Col xs={1} sm={1} md={1} lg={1} xl={1}></Col>
        </Row>
        <Divider style={{margin: '0px 0'}} dashed></Divider>
          {
            currentList.length ? (
               <Spin tip='加载中...' spinning={isLoading}>
                {
                  currentList?.map((article) => (
                    <>
                      <DynamicComponent article={article} />
                    </>
                  ))
                }
                {
                  ( showAricles.length > 8 ) ? 
                    <LazyLoad height={200} offset={-10}>
                      <Pagination showQuickJumper defaultCurrent={1} total={articles.length} onChange={(e)=>{handlePagination(e)}} 
                      className='cssnice3' current={currentPage} style={{textAlign: 'center',padding:'.5rem 0 .5rem'}}/>
                    </LazyLoad> : null
                }
              </Spin>
            )
            : (
                <div className={styles.emptyContainer}>
                  <Empty />
                </div>
              )
          }
      </Col>
      <Col className={styles.containerRight} xs={0} sm={0} md={5} lg={5} xl={5}>
        <RightBar>
          <TagList tags={tags} setTagArticle={changeTagList} />
          <Divider style={{margin: '10px 0'}} dashed></Divider>
          <HotArticle thumbTopList={thumbTopList}/>
          <Divider style={{margin: '10px 0'}} dashed></Divider>
          <HotUser userTopList={userTopList}/>
        </RightBar>
      </Col>
    </Row>
  )
}

export default observer(Home)