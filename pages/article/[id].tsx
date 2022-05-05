import { prepareConnection } from "db/index"
import { Article } from "db/entity"
import { IArticle } from "pages/api"
import styles from './index.module.scss'
import { Avatar, Input, Button, Divider, message, Row, Col } from 'antd';
import { format } from 'date-fns';
import { useStore } from 'store/index';
import MarkDown from 'markdown-to-jsx';
import Link from 'next/link';
import { useState } from 'react';
import { observer } from "mobx-react-lite"
import request from 'service/fetch';
import MyBackTop from "components/BackTop"
import RightBar from "components/RightBar"

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
  return (
    <div>
      <MyBackTop />
      <Row className={styles.container} typeof='flex' justify='center' style={{paddingTop:'3.2rem'}}>
        <Col className={styles.containerLeft} xs={24} sm={24} md={14} lg={14} xl={14} style={{backgroundColor:'rgba(255,255,255,.4)'}}>
          文章详情
        </Col>
        <Col className={styles.containerRight} xs={0} sm={0} md={5} lg={5} xl={5}>
          <RightBar>
            文章目录
          </RightBar>
        </Col>
      </Row>
    </div>
    // <div>
    //   <div className="content-layout">
    //     <h2 className={styles.title}>{article?.title}</h2>
    //     <div className={styles.user}>
    //       <Avatar src={avatar} size={50} />
    //       <div className={styles.info}>
    //         <div className={styles.name}>{nickname}</div>
    //         <div className={styles.date}>
    //           <div>
    //             {format(new Date(article?.update_time), 'yyyy-MM-dd hh:mm:ss')}
    //           </div>
    //           <div>阅读 {article?.views}</div>
    //           {Number(loginUserInfo?.userId) === Number(id) && (
    //             <Link href={`/editor/${article?.id}`}>编辑</Link>
    //           )}
    //         </div>
    //       </div>
    //     </div>
    //     <MarkDown className={styles.markdown}>{article?.content}</MarkDown>
    //   </div>
    //   <div className={styles.divider}></div>
    //   <div className="content-layout">
    //     <div className={styles.comment}>
    //       <h3>评论</h3>
    //       {loginUserInfo?.userId && (
    //         <div className={styles.enter}>
    //           <Avatar src={avatar} size={40} />
    //           <div className={styles.content}>
    //             <Input.TextArea
    //               placeholder="请输入评论"
    //               rows={4}
    //               value={inputVal}
    //               onChange={(event) => setInputVal(event?.target?.value)}
    //             />
    //             <Button type="primary" onClick={handleComment}>
    //               发表评论
    //             </Button>
    //           </div>
    //         </div>
    //       )}
    //       <Divider />
    //       <div className={styles.display}>
    //         {comments?.map((comment: any) => (
    //           <div className={styles.wrapper} key={comment?.id}>
    //             <Avatar src={comment?.user?.avatar} size={40} />
    //             <div className={styles.info}>
    //               <div className={styles.name}>
    //                 <div>{comment?.user?.nickname}</div>
    //                 <div className={styles.date}>
    //                   {format(
    //                     new Date(comment?.update_time),
    //                     'yyyy-MM-dd hh:mm:ss'
    //                   )}
    //                 </div>
    //               </div>
    //               <div className={styles.content}>{comment?.content}</div>
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   </div>
    // </div>
  )
}

export default observer(ArticleDetail)