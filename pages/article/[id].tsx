import { prepareConnection } from "db/index"
import { Article } from "db/entity"
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
import { CalendarOutlined, FireOutlined, MessageOutlined, LikeFilled, DislikeFilled, MessageFilled } from '@ant-design/icons'
import Tocify from 'components/Tocify'
import marked from 'marked'
import hljs from "highlight.js";
import 'highlight.js/styles/monokai-sublime.css';
import MyComment from 'components/Comment'
import { IComment } from 'pages/api';

interface IProps {
  article: IArticle
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

  if (article) {
    // 阅读次数 +1
    article[0].views = article[0]?.views + 1;
    await articleRepo.save(article[0]);
  }
  return {
    props: {
      article: JSON.parse(JSON.stringify(article))[0]
    }
  }
}

const ArticleDetail = (props: IProps) => {
  const { article } = props
  const store = useStore();
  const loginUserInfo = store?.user?.userInfo;
  const { user: { nickname, avatar, id} } = article
  const [inputVal, setInputVal] = useState('');
  const [comments, setComments] = useState(article?.comments || []);
  const { pathname } = useRouter()

  // 文章内容md格式转化和文章导航相关
  const renderer = new marked.Renderer();
  const tocify = new Tocify()
  renderer.heading = function(text : any, level : any) {
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
    request
    .post('/api/comment/publish', {
      articleId: article?.id,
      content: inputVal,
    })
    .then((res: any) => {
      if (res?.code === 0) {
        message.success('发表成功');
        // 在已有评论的后面进行追加评论
        const newComments = [
          {
            id: Math.random(),
            create_time: new Date(),
            update_time: new Date(),
            content: inputVal,
            user: {
              avatar: loginUserInfo?.avatar,
              nickname: loginUserInfo?.nickname,
            },
          },
        ].concat([...(comments as any)]);
        setComments(newComments);
        setInputVal('');
      } else {
        message.error('发表失败');
      }
    });
  }

  const toMainPage = () => {

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
                {Number(loginUserInfo?.userId) === Number(id) && (
                  <Link href={`/editor/${article?.id}`}>编辑</Link>
                )}
              </div>
              <div className={styles.articleImg}>
                <Image preview={false} src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2Fd0553d88aff685f8a3cb4d0dd04bef8ae6174694.jpg&refer=http%3A%2F%2Fi0.hdslb.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1654140843&t=0cd87c7be196ebb935777d9fac1223f9" alt="" />
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
                  <Button>关注</Button>
                </div>
                <div className={styles.operation}>
                  <div className={styles.love}>
                    <LikeFilled style={{color: '#c8c8cc', fontSize: 20}}/>
                    <span className={styles.operationText}>5</span>
                  </div>
                  <div className={styles.dislove}>
                    <DislikeFilled style={{color: '#c8c8cc', fontSize: 20}}/>
                    <span className={styles.operationText}>0</span>
                  </div>
                  <div className={styles.message}>
                    <MessageFilled style={{color: '#c8c8cc', fontSize: 20}}/>
                    <span className={styles.operationText}>0</span>
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
                  <MyComment key={comment.id} comment={comment}>
                    {
                      comment.children ? comment.children.map((item : IComment) => {
                        <MyComment noPingLun={true} key={item.id} comment={item}  />
                      }) : null
                    }
                  </MyComment>
                ))}
              </div>
            </div>  
          </div>
        </Col>
        <Col className={styles.containerRight} xs={0} sm={0} md={5} lg={5} xl={5}>
          <RightBar>
          </RightBar>
          <Affix offsetTop={50} className={styles.navContainer}>
            <div className={styles.navTitle}>文章目录</div>
            <div className={styles.navTitleList}>
              {tocify && tocify.render()}
            </div> 
          </Affix>
        </Col>
      </Row>
    </div>
  )
}

export default observer(ArticleDetail)