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
import { CalendarOutlined, EyeOutlined, MessageOutlined, LikeFilled, HeartOutlined, MessageFilled, LikeOutlined, HeartFilled, CloseSquareFilled } from '@ant-design/icons'
import Tocify from 'components/Tocify'
import marked from 'marked'
import hljs from "highlight.js";
import 'highlight.js/styles/monokai-sublime.css';
import MyComment from 'components/Comment'
import { IComment } from 'pages/api';
import MyEmoji from 'components/MyEmoji'
import CommentUpload from 'components/Comment/upload'
import io from 'socket.io-client'
import { useRouter } from 'next/router'

var socket : any

interface IProps {
  article: IArticle,
  commentList: IComment[]
}

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

export async function getServerSideProps({ params }: any) {
  const articleId = params?.id
  const db = await prepareConnection()
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
  const newCommentList = comment.map((item : any) => {
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
  newCommentList.sort(compare).reverse()
  console.log('from server', newCommentList)
  return {
    props: {
      article: JSON.parse(JSON.stringify(article))[0],
      commentList: JSON.parse(JSON.stringify(newCommentList))
    }
  }
}

const ArticleDetail = (props: IProps) => {
  const { article, commentList } = props
  console.log('11111commentList reverse', commentList)
  const store = useStore();
  const loginUserInfo = store?.user?.userInfo;
  const { user: { nickname, avatar} } = article
  const [inputVal, setInputVal] = useState('');
  const [comments, setComments] = useState(commentList || []);
  const [ifThumb, setIfThumb] = useState(false)
  const [hasFollow, setHasFollow] = useState(false)
  const [hasCollect, setHasCollect] = useState(false)
  const [articleLikeNum, setArticleLikeNum] = useState(0)
  // const [hasTocify, setHasTocify] = useState(false)
  const [articleCommentNum, setArticleCommentNum] = useState(commentList.length || 0)
  const [uploadImgUrl, setUploadImgUrl] = useState('')
  const [isCommentLoading, setIsCommentLoading] = useState(false)
  const [isFollowLoading, setIsFollowLoading] = useState(false)
  const [ refreshList, setRefreshList ] = useState(false)
  const { push } = useRouter()

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
    breaks: false,
    smartLists: true,
    smartypants: false,
    highlight: function (code : any) {
      return hljs.highlightAuto(code).value;
    }
  }); 
  const html = marked(article?.content as string) 

  const handleComment = () => {
    if (inputVal === '') {
      message.error('评论不能为空')
      return
    }
    setIsCommentLoading(true)
    request
    .post('/api/comment/publish', {
      articleId: article?.id,
      content: inputVal,
      toUser_id: '',
      pid: '',
      rid: '',
      img: uploadImgUrl
    })
    .then((res: any) => {
      if (res?.code === 0) {
        message.success('发表成功');
        // 在已有评论的后面进行追加评论
        const newComments = [
          {
            id: res.data?.id,
            create_time: new Date(),
            update_time: new Date(),
            article: article,
            is_delete: 0,
            content: inputVal,
            user: {
              avatar: loginUserInfo?.avatar,
              nickname: loginUserInfo?.nickname,
              id: loginUserInfo?.userId
            },
          },
        ].concat([...(comments as any)]);
        setInputVal('');
        console.log('newComments', [...newComments])
        setArticleCommentNum(articleCommentNum + 1)
        setComments([...newComments]);
        if (article.comment_count || article.comment_count === 0)  {
          article.comment_count += 1
        }
        // socket通知用户
        const userId = article.user.id
        const fromUserId = loginUserInfo?.userId
        if (userId != fromUserId) {
          socket.emit('message', {
            userId,
            fromUserId,
            content: '评论信息'
          })
        }
        setRefreshList(!refreshList)
      } else if (res?.code === 4002) {
        message.error('内容敏感！请修改');
      }
      else {
        message.error('发表失败');
      }
      setIsCommentLoading(false)
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
    if (article.comment_count || article.comment_count === 0) 
      article.comment_count += 1
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
        if (article.like_count || article.like_count === 0) 
        {article.like_count += 1}
        // socket通知用户
        const userId = article.user.id
        const fromUserId = loginUserInfo.userId
        console.log('article.user.id', article.user.id)
        if (userId != fromUserId) {
          socket.emit('message', {
            userId,
            fromUserId,
            content: '点赞信息'
          })
        }
      }
    })
  }

  useEffect(() => {
    if (!socket) {
      socket = io('http://localhost:3000')
    }
    if (article.views === 0) {
      article.views += 1
    }
    // 判断是否已关注
    request.post('/api/follow/getById', {
      user_id: article.user?.id,
      byUser_id: loginUserInfo.userId
    }).then((res: any) => {
      if (res?.code === 0) {
        res.data === 1 ? setHasFollow(true) : ''
      }
    })
    // 判断文章是否被收藏
    request.post('/api/collect/getById', {
      article_id: article?.id,
      user_id: loginUserInfo.userId
    }).then((res: any) => {
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
      }).then((res: any) => {
        if (res?.code === 0) {
          const { ifLike, articleLikeData } = res.data
          setIfThumb(ifLike)
          setArticleLikeNum(articleLikeData?.like_count ? articleLikeData?.like_count : 0)
        }
      })
  }, [])

  useEffect(() => {
    request.post('/api/comment/getListByArticle', {
      articleId: article?.id
    }).then((res: any) => {
      if (res?.code === 0) {
        const { commentList } = res.data
        setComments([...commentList])
      }
    })
  }, [refreshList])

  // 关注用户
  const handleFollow = () => {
    setIsFollowLoading(true)
    request.post('/api/follow/publish', {
      user: article.user,
      byUser_id: loginUserInfo.userId
    }).then((res: any) => {
      if (res?.code === 0) {
        message.success('关注成功')
        setHasFollow(true)
        // socket通知用户
        const userId = article.user.id
        const fromUserId = loginUserInfo.userId
        if (userId != fromUserId) {
          socket.emit('message', {
            userId,
            fromUserId,
            content: '关注信息'
          })
        }
      }
      setIsFollowLoading(false)
    })
  }
  // 取消关注用户
  const handleDelFollow = () => {
    const byUser_id = loginUserInfo.userId
    const user_id = article.user?.id
    console.log(byUser_id, user_id)
    setIsFollowLoading(true)
    request.post('/api/follow/del', {
      user_id,
      byUser_id
    }).then((res: any) => {
      if (res?.code === 0) {
        message.success('取消关注成功')
        setHasFollow(false)
      }
      setIsFollowLoading(false)
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
    }).then((res: any) => {
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
    }).then((res: any) => {
      if (res?.code === 0) {
        message.success('取消收藏成功')
        setHasCollect(false)
      }
    })
  }

  // emoji输入
  const handleEmoji = (emojiItem: any) => {
    setInputVal(inputVal.concat(emojiItem))
  }
  
  // 处理上传图片
  const handleUploadUrl = (url: string) => {
    setUploadImgUrl(url)
  }

  // 删除上传图片
  const deleteUploadImg = () => {
    setUploadImgUrl('')
  }

  const handleGotoPersonalPage = () => {
    push(`/user/${article.user.id}`);
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
                  <div style={{cursor: 'pointer'}} onClick={handleGotoPersonalPage}>
                    <Avatar src={avatar} size={50} />
                  </div>
                  <div className={styles.info}>
                    <div className={styles.name}>{nickname}</div>
                  </div>
                </div>
                <div className={styles.iconList}>
                <span className={styles.icon}><CalendarOutlined type='calendar' style={{color:'lightseagreen', marginRight: '5px'}}/>
                  {format(new Date(article?.update_time as Date), 'yyyy-mm-dd hh:mm')}
                </span>
                <span className={styles.icon}><EyeOutlined type='fire' style={{color:'black'}}/> {article?.views}</span>
              <span className={styles.icon}><MessageOutlined type='fire' style={{color:'black'}}/> {article?.comment_count}</span>
              <span className={styles.icon}><LikeOutlined type='fire' style={{color:'black'}}/> {article?.like_count}</span>
                </div>
                {
                  Number(loginUserInfo?.userId) === article.user.id ? (
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
                  <div style={{cursor: 'pointer'}} onClick={handleGotoPersonalPage}>
                    <Avatar src={avatar} size={50} />
                  </div>
                  <div className={styles.info}>
                    <div className={styles.name}>{nickname}</div>
                  </div>
                  {
                    article.user.id != loginUserInfo.userId && (
                      hasFollow ? <Button loading={isFollowLoading} onClick={handleDelFollow}>已关注</Button>
                      : <Button loading={isFollowLoading} onClick={handleFollow}>关注</Button>
                    )
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
                  <div style={{cursor: 'pointer'}} onClick={handleGotoPersonalPage}>
                    <Avatar src={avatar} size={40} />
                  </div>
                  <div className={styles.content}>
                    <div className={styles.commentInputContainer}>
                      <Input.TextArea
                        bordered={false}
                        style={{minHeight: '100px', border: 'none', background: 'url("https://blog-1303885568.cos.ap-chengdu.myqcloud.com/useImg/comment.png") right bottom no-repeat'}}
                        placeholder="请输入评论"
                        value={inputVal}
                        onChange={(event) => setInputVal(event?.target?.value)}
                      />
                      {
                        uploadImgUrl && (
                        <div className={styles.inputImageContainer}>
                          <Image className={styles.inputImage} src={uploadImgUrl}></Image>
                          <div className={styles.deleImg}>
                            <CloseSquareFilled onClick={deleteUploadImg}/>
                          </div>
                        </div>
                        )
                      }
                    </div>
                   
                    <div className={styles.operation}>
                      <div style={{'display': 'flex'}}>
                        <MyEmoji handleEmoji={handleEmoji}  />
                        &nbsp;&nbsp;&nbsp;
                        <CommentUpload returnUploadUrl={handleUploadUrl}/>
                      </div>
                      <Button loading={isCommentLoading} type="primary" onClick={handleComment}>
                        发表评论
                      </Button>
                    </div>
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
          <RightBar ifCanChangeAvatar={true}>
            <></>
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