import { prepareConnection } from "db/index"
import { Article } from "db/entity"
import { IArticle } from "pages/api"
import styles from './index.module.scss'
import { Button, Avatar, Input, Image, Breadcrumb, message, Row, Col, Divider } from 'antd';
import { format } from 'date-fns';
import { useStore } from 'store/index';
import MyMarkDown from 'components/MyMarkDown'
import Link from 'next/link';
import { useState } from 'react';
import { observer } from "mobx-react-lite"
import request from 'service/fetch';
import MyBackTop from "components/BackTop"
import RightBar from "components/RightBar"
import { useRouter } from 'next/router';
import { CalendarOutlined, FireOutlined, MessageOutlined } from '@ant-design/icons'

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
        <Col className={styles.containerLeft} xs={24} sm={24} md={14} lg={14} xl={14} style={{backgroundColor:'rgba(255,255,255,.4)'}}>
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
            <div className={styles.articleContent}>
              <MyMarkDown textContent={article?.content}  />
            </div>
            <Divider />
            <div className={styles.comment}>
              <h3>评论</h3>
              {loginUserInfo?.userId && (
                <div className={styles.enter}>
                  <Avatar src={avatar} size={40} />
                  <div className={styles.content}>
                    <Input.TextArea
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
                  <div className={styles.wrapper} key={comment?.id}>
                    <Avatar src={comment?.user?.avatar} size={40} />
                    <div className={styles.info}>
                      <div className={styles.name}>
                        <div>{comment?.user?.nickname}</div>
                        <div className={styles.date}>
                          {format(
                            new Date(comment?.update_time),
                            'yyyy-MM-dd hh:mm:ss'
                          )}
                        </div>
                      </div>
                      <div className={styles.content}>{comment?.content}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>  
          </div>
        </Col>
        <Col className={styles.containerRight} xs={0} sm={0} md={5} lg={5} xl={5}>
          <RightBar>
            文章目录
          </RightBar>
        </Col>
      </Row>
    </div>
  )
}

export default observer(ArticleDetail)