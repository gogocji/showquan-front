import { prepareConnection } from "db/index"
import { Article, Comment } from "db/entity"
import { IArticle } from "pages/api"
import styles from './index.module.scss'
import { Button, Avatar, Input, Image, Breadcrumb, message, Row, Col, Divider, Affix } from 'antd';
import { format } from 'date-fns';
import { useStore } from 'store/index';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { observer } from "mobx-react-lite"
import request from 'service/fetch';
import MyBackTop from "components/BackTop"
import RightBar from "components/RightBar"
import { useRouter } from 'next/router';
import { CalendarOutlined, FireOutlined, MessageOutlined, LikeFilled, HeartOutlined, MessageFilled, LikeOutlined, HeartFilled } from '@ant-design/icons'
import Tocify from 'components/Tocify'
import marked from 'marked'
import hljs from "highlight.js";
import 'highlight.js/styles/monokai-sublime.css';
import MyComment from 'components/Comment'
import { IComment } from 'pages/api';

interface IProps {
  article: IArticle,
  commentList: IComment[]
}

export async function getServerSideProps({ params }: any) {
  const articleId = params?.id
  const db = await prepareConnection()
  const articleRepo = db.getRepository(Article);
  const article = await db.getRepository(Article).find({
    where: {
      id: articleId
    },
    relations: ['user', 'comments', 'comments.user']
  })

  const comment = await db.getRepository(Comment).find({
    where: {
      article: articleId
    },
    relations: ['user', 'toUser', 'pComment', 'rComment']
  })
  // 改变评论数据结构
  const newCommentList = comment.map((item : IComment) => {
    return {
      ...item,
      children : [] as IComment[]
    }
  })
  comment.map((item: any) => {
    if (item.rComment !== null) {
      for (let i = 0; i < newCommentList.length; i++) {
        if (newCommentList[i].id === item.rComment?.id) {
          newCommentList[i].children.push(item)
        }
      }
    }
  })
  return {
    props: {
      article: JSON.parse(JSON.stringify(article))[0],
      commentList: JSON.parse(JSON.stringify(newCommentList))
    }
  }
}

const ArticleDetail = (props: IProps) => {
  const { article, commentList } = props
  console.log('commentList', commentList)
  const store = useStore();
  const loginUserInfo = store?.user?.userInfo;
  const { user: { nickname, avatar, id} } = article
  const [inputVal, setInputVal] = useState('');
  const [comments, setComments] = useState(commentList || []);
  const [ifThumb, setIfThumb] = useState(false)
  const [hasFollow, setHasFollow] = useState(false)
  const [hasCollect, setHasCollect] = useState(false)
  const [articleLikeNum, setArticleLikeNum] = useState(0)
  // const [hasTocify, setHasTocify] = useState(false)
  const [articleCommentNum, setArticleCommentNum] = useState(commentList.length || 0)
  const { pathname } = useRouter()
  // 文章内容md格式转化和文章导航相关
  const renderer = new marked.Renderer();
  const tocify = new Tocify()
  var hasTocify = false
  renderer.heading = function(text : any, level : any) {
      hasTocify = true
      const anchor = tocify.add(text, level);
      return `<a id="${anchor}" href="#${anchor}" class="anchor-fix"><h${level}>${text}</h${level}></a>\n`;
    };
  marked.setOptions({
    renderer: renderer,
    gfm: true,
    pedantic: false,
    sanitize: false,
    tables: true,
    breaks: false,
    smartLists: true,
    smartypants: false,
    highlight: function (code : any) {
      return hljs.highlightAuto(code).value;
    }
  }); 
  const html = marked(article?.content) 

  const handleComment = () => {
    if (inputVal === '') {
      message.error('评论不能为空')
      return
    }
    request
    .post('/api/comment/publish', {
      articleId: article?.id,
      content: inputVal,
      toUser_id: '',
      pid: '',
      rid: ''
    })
    .then((res: any) => {
      if (res?.code === 0) {
        message.success('发表成功');
        // 在已有评论的后面进行追加评论
        const newComments = [
          {
            id: res.data?.id,
            pComment: null,
            rComment: null,
            create_time: new Date(),
            update_time: new Date(),
            content: inputVal,
            toUser: null,
            user: {
              avatar: loginUserInfo?.avatar,
              nickname: loginUserInfo?.nickname,
              id: loginUserInfo?.userId
            },
          },
        ].concat([...(comments as any)]);
        setComments([...newComments]);
        setInputVal('');
        setArticleCommentNum(articleCommentNum + 1)
      } else {
        message.error('发表失败');
      }
    });
  }

  // 对二级评论进行封装
  const handleChildComment = (childComment : IComment) => {
    const tempList = comments
    tempList.map((item) => {
      if (!item.children) {
        item.children = []
      }
      if (item.id == childComment?.rComment?.id) {
        item.children?.push(childComment)
      }
    })
    setArticleCommentNum(articleCommentNum + 1)
    setComments([...tempList]);
  }

  const handleLikeArticle = () => {
    request
    .post('/api/article/thumb/thumb', {
      article: article,
      user_id: loginUserInfo.userId
    })
    .then((res: any) => {
      if (res?.code === 0) {
        message.success('点赞成功')
        setIfThumb(true)
        setArticleLikeNum(articleLikeNum + 1)
      }
    })
  }

  useEffect(() => {
    // 判断是否已关注
    request.post('/api/follow/getById', {
      user_id: article.user?.id,
      byUser_id: loginUserInfo.userId
    }).then((res) => {
      if (res?.code === 0) {
        res.data === 1 ? setHasFollow(true) : ''
      }
    })
    // 判断文章是否被收藏
    request.post('/api/collect/getById', {
      article_id: article?.id,
      user_id: loginUserInfo.userId
    }).then((res) => {
      if (res?.code === 0) {
        res.data === 1 ? setHasCollect(true) : ''
      }
    })
    console.log('22')
    // 文章阅读次数 +1
    request.post('/api/article/viewCount/view', {
      article_id: article.id,
      user_id: loginUserInfo.userId
    })
    // 获取文章点赞情况
    request
      .post('/api/article/thumb/getThumb', {
        article_id: article.id,
        user_id: loginUserInfo.userId
      }).then((res) => {
        if (res?.code === 0) {
          const { ifLike, articleLikeData } = res.data
          setIfThumb(ifLike)
          setArticleLikeNum(articleLikeData?.like_count ? articleLikeData?.like_count : 0)
        }
      })
  }, [])

  // 关注用户
  const handleFollow = () => {
    request.post('/api/follow/publish', {
      user: article.user,
      byUser_id: loginUserInfo.userId
    }).then((res) => {
      if (res?.code === 0) {
        message.success('关注成功')
        setHasFollow(true)
      }
    })
  }
  // 取消关注用户
  const handleDelFollow = () => {
    const byUser_id = loginUserInfo.userId
    const user_id = article.user?.id
    console.log(byUser_id, user_id)
    request.post('/api/follow/del', {
      user_id,
      byUser_id
    }).then((res) => {
      if (res?.code === 0) {
        message.success('取消关注成功')
        setHasFollow(false)
      }
    })
  }

  // 点击【已点赞按钮】
  const handleHasLikeArticle = () => {
    message.error('无法重复点赞')
  } 
  
  // 收藏文章
  const handleCollect = () => {
    request.post('/api/collect/publish', {
      article: article,
      user_id: loginUserInfo.userId
    }).then((res) => {
      if (res?.code === 0) {
        message.success('收藏成功')
        setHasCollect(true)
      }
    })
  }

  // 取消收藏
  const handleDelCollect = () => {
    request.post('/api/collect/del', {
      article_id: article?.id,
      user_id: loginUserInfo.userId
    }).then((res) => {
      if (res?.code === 0) {
        message.success('取消收藏成功')
        setHasCollect(false)
      }
    })
  }
  return (
    <div>
      <MyBackTop />
      <Row className={styles.container} typeof='flex' justify='center' style={{paddingTop:'3.2rem'}}>
        <Col className={styles.containerLeft} xs={24} sm={24} md={14} lg={14} xl={14} style={{backgroundColor:'rgba(255,255,255)'}}>
          <div>
            <div className={styles.breadDiv}>
              <Breadcrumb>
                <Breadcrumb.Item><Link href='/'>首页</Link></Breadcrumb.Item>
                <Breadcrumb.Item>{article?.title}</Breadcrumb.Item>
              </Breadcrumb>
            </div>
            <div className={styles.articleHeader}>
              <div className={styles.articleTitle}>
                {article?.title}
              </div>
              <div className={styles.articleInfo}>
                <div className={styles.userInfo}>
                  <Avatar src={avatar} size={50} />
                  <div className={styles.info}>
                    <div className={styles.name}>{nickname}</div>
                  </div>
                </div>
                <div className={styles.iconList}>
                <span className={styles.icon}><CalendarOutlined type='calendar' style={{color:'lightseagreen', marginRight: '5px'}}/>
                  {format(new Date(article?.update_time), 'yyyy-mm-dd hh:mm')}
                </span>
                <span className={styles.icon}><FireOutlined type='fire' style={{color:'red'}}/> {article?.views}</span>
                <span className={styles.icon}><MessageOutlined type='fire' style={{color:'black'}}/> 231</span>  
                </div>
                {
                  Number(loginUserInfo?.userId) === 1 ? (
                    <Link href={`/editor/${article?.id}`}>编辑</Link>
                  ) : (
                    hasCollect
                      ? 
                        (
                          <div  onClick={handleDelCollect} className={styles.likeContainer}>
                            <HeartFilled style={{color: 'rgb(252, 85, 49)', marginRight: '5px'}} />
                            <div style={{color: 'rgb(252, 85, 49)'}}>已收藏</div>
                          </div>
                        )
                      : 
                        (
                          <div onClick={handleCollect} className={styles.likeContainer}>
                            <HeartOutlined  style={{color: 'rgb(252, 85, 49)', marginRight: '5px'}}/>
                            <div>收藏</div>
                          </div>
                        )
                  )
                }
              </div>
              <div className={styles.articleImg}>
                <Image preview={false} src={ article.headImg ? article.headImg : 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2Fd0553d88aff685f8a3cb4d0dd04bef8ae6174694.jpg&refer=http%3A%2F%2Fi0.hdslb.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1654140843&t=0cd87c7be196ebb935777d9fac1223f9'} alt="" />
              </div>
            </div>
            <div className={styles.articleContent}
              dangerouslySetInnerHTML = {{__html:html}}>
            </div>
            <Divider />
              <div className={styles.operationArea}>
                <div className={styles.userInfo}>
                  <Avatar src={avatar} size={50} />
                  <div className={styles.info}>
                    <div className={styles.name}>{nickname}</div>
                  </div>
                  {
                    hasFollow ? <Button onClick={handleDelFollow}>已关注</Button>
                    : <Button onClick={handleFollow}>关注</Button>
                  }
                </div>
                <div className={styles.operation}>
                  <div className={styles.love}>
                    {
                      ifThumb ? <LikeFilled onClick={handleHasLikeArticle}  style={{color: 'rgb(24, 144, 255)', fontSize: 20}} /> : <LikeOutlined onClick={handleLikeArticle} style={{color: '#c8c8cc', fontSize: 20}}/>
                    }
                    <span className={styles.operationText}>{articleLikeNum}</span>
                  </div>
                  {/* 不打算搞 👎 的功能 */}
                  {/* <div className={styles.dislove}>
                    <DislikeFilled style={{color: '#c8c8cc', fontSize: 20}}/>
                    <span className={styles.operationText}>0</span>
                  </div> */}
                  <div className={styles.message}>
                    <MessageFilled style={{color: '#c8c8cc', fontSize: 20}}/>
                    <span className={styles.operationText}>{articleCommentNum}</span>
                  </div>
                </div>
              </div>
            <Divider />
            <div className={styles.comment}>
              <h3>评论</h3>
              {loginUserInfo?.userId && (
                <div className={styles.enter}>
                  <Avatar src={avatar} size={40} />
                  <div className={styles.content}>
                    <Input.TextArea
                      style={{background: 'url("https://blog-1303885568.cos.ap-chengdu.myqcloud.com/useImg/comment.png") right bottom no-repeat'}}
                      placeholder="请输入评论"
                      rows={4}
                      value={inputVal}
                      onChange={(event) => setInputVal(event?.target?.value)}
                    />
                    <Button type="primary" onClick={handleComment}>
                      发表评论
                    </Button>
                  </div>
                </div>
              )}
              <Divider />
              <div className={styles.display}>
                {comments?.map((comment: any) => (
                  comment.rComment === null ? <MyComment handleAddComment={handleChildComment} userInfo={loginUserInfo} article={article}  key={comment.id} comment={comment}>
                    {
                      comment?.children?.length  ? comment.children.map((item : IComment) => {
                        return <MyComment handleAddComment={handleChildComment} userInfo={loginUserInfo} article={article} key={item.id} comment={item}  ></MyComment>
                      }) : null
                    }
                  </MyComment> : null
                ))}
              </div>
            </div>  
          </div>
        </Col>
        <Col className={styles.containerRight} xs={0} sm={0} md={5} lg={5} xl={5}>
          <RightBar>
          </RightBar>
          {
            hasTocify && (
              <Affix offsetTop={50} className={styles.navContainer}>
                <div className={styles.navTitle}>文章目录</div>
                <div className={styles.navTitleList}>
                  { tocify &&tocify.render() }
                </div> 
              </Affix>
            )
          }
        </Col>
      </Row>
    </div>
  )
}

export default observer(ArticleDetail)