import styles from './index.module.scss';
import { Button, message } from 'antd'
import { LikeOutlined, LikeFilled } from '@ant-design/icons'
import { useRouter } from 'next/router'
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react'
import request from 'service/fetch';
import { useStore } from 'store/index';
import io from 'socket.io-client'

var socket : any
interface IProps {
  type: string,
  contentItem: any
}
const MyMessage = (props: IProps) => {
  const { type, contentItem} = props
  const { push } = useRouter()
  const [hasLike, setHasLike] = useState(false)
  const [ commentLikeNum, setCommentLikeNum] = useState(contentItem?.comment?.like_count || 0)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)
  
  const store = useStore()
  const handleToArticle = () => {
    push(`/article/${contentItem.article.article_id}`)
  }
  const title = () => {
    if (type === 'comment') {
      if (contentItem.rComment) {
        return (
          <span>
            {contentItem.user.nickname} 回复了你在文章 <span onClick={handleToArticle} style={{color: '#007fff', cursor: 'pointer'}}>{contentItem.article.title}</span> 下的评论
          </span>
        )
      } else {
        return (
          <span>
            {contentItem.user.nickname} 评论了你的文章 <span onClick={handleToArticle} style={{color: '#007fff', cursor: 'pointer'}}>{contentItem.article.title}</span>
          </span>
        )
      }
    } else if (type === 'thumb') {
      if (contentItem.comment) {
        return (
          <span>
            {contentItem.user.nickname} 赞了你在文章 <span onClick={handleToArticle} style={{color: '#007fff', cursor: 'pointer'}}>{contentItem.article.title}下的评论</span>
          </span>
        )
      } else {
        return (
          <span>
            {contentItem.user.nickname} 赞了你的文章 <span onClick={handleToArticle} style={{color: '#007fff', cursor: 'pointer'}}>{contentItem.article.title}</span>
          </span>
        )
      }
    } else if (type === 'follow') {
        return (<span> {contentItem.user.nickname} 关注了你 </span>)
    } else {
      return (<span>{contentItem.title}</span>)
    }
  }
  // 点击【已点赞按钮】
  const handleHasLikeArticle = () => {
    message.error('无法重复点赞')
  }

  // 点赞评论
  const handleLike = () => {
    console.log('222')
    request
    .post('/api/comment/thumb/thumb', {
      comment_id: type === 'comment' ? contentItem.id : contentItem.comment.id,
      user_id: store.user.userInfo.userId
    })
    .then((res: any) => {
      if (res?.code === 0) {
        setHasLike(true)
        message.success('点赞成功')
        setCommentLikeNum(commentLikeNum ? commentLikeNum + 1 : 1)
        // socket通知用户
        socket.emit('message', {
          userId: contentItem.user.id,
          fromUserId: store.user.userInfo.userId,
          content: '点赞信息'
        })
      }
    })
  }

  const handleDelFollow = () => {
    const byUser_id = store.user.userInfo.userId
    const user_id = contentItem.user.id
    setIsSubmitLoading(true)
    request.post('/api/follow/del', {
      user_id,
      byUser_id
    }).then((res: any) => {
      if (res?.code === 0) {
        message.success('取消关注成功')
        contentItem.hasLike = false
      }
      setIsSubmitLoading(false)
    })
  }

  const handleFollow = () => {
    const byUser_id = store.user.userInfo.userId
    const user = contentItem.user
    setIsSubmitLoading(true)
    request.post('/api/follow/publish', {
      user,
      byUser_id
    }).then((res: any) => {
      if (res?.code === 0) {
        message.success('关注成功')
        contentItem.hasLike = true
        // socket通知用户
        const userId = contentItem.user.id
        const fromUserId = store.user.userInfo.userId
        if (userId != fromUserId) {
          socket.emit('message', {
            userId,
            fromUserId,
            content: '关注信息'
          })
        }
      }
      setIsSubmitLoading(false)
    })
  }

  const handleGotoPersonalPage = () => {
    push(`/user/${contentItem.user.id}`);
  }

  useEffect(() => {
    if (!socket) {
      socket = io('http://localhost:3000')
    }
    // 获取文章点赞情况
    if (type === 'comment' || (type === 'thumb' && contentItem.comment)) {
      request
      .post('/api/comment/thumb/getThumb', {
        comment_id: type === 'comment' ? contentItem.id : contentItem.comment.id,
        user_id: store.user.userInfo.userId
      }).then((res: any) => {
        if (res?.code === 0) {
          const { ifLike, commentLikeData } = res.data
          setHasLike( ifLike ? true : false)
          setCommentLikeNum(commentLikeData?.like_count)
        }
      })
    }
  })
  return (
    <div className={styles.container} >
      <div className={styles.left}>
        {
          type !== 'system' ? <img style={{cursor: 'pointer'}} onClick={handleGotoPersonalPage} className={styles.img} src={contentItem.user.avatar}></img>
          : <img className={styles.img} src='/images/masterLogo.jpg'/>
        }
      </div>
      <div className={styles.right}>
        <div className={styles.rightHeader}>
          <div className={styles.rightContent}>
            <div className={styles.title}>
              { title() }
            </div>
            {
              type === 'comment' && <div className={styles.comment}>{contentItem.content}</div>
            }
            {
              type === 'thumb' && contentItem.comment && <div className={styles.comment}>{contentItem.comment.content}</div>
            }
            {
              type === 'system' && contentItem.content && <div className={styles.sysmtemContent}>{contentItem.content}</div>
            }
          </div>
          {
            type === 'follow' && (
              <div className={styles.followButton}>
                {
                  contentItem.hasLike
                   ? <Button loading={isSubmitLoading} onClick={handleDelFollow}>已关注</Button>
                   : <Button loading={isSubmitLoading} onClick={handleFollow}>关注</Button>
                }
              </div>
            )
          }
        </div>
        <div className={styles.rightFooter}>
          <div className={styles.time}>
          {formatDistanceToNow(new Date(contentItem?.create_time as Date))}
          </div>
          {
            type === 'comment' && (
              <div className={styles.operation}>
                <div className={styles.like}>
                {
                  hasLike ? <LikeFilled onClick={handleHasLikeArticle} /> : <LikeOutlined onClick={handleLike} />
                }
                  &nbsp;{commentLikeNum}</div>
              </div>
            )
          }
          {
            type === 'thumb' && contentItem.comment && (
              <div className={styles.operation}>
                <div className={styles.like}>
                {
                  hasLike ? <LikeFilled onClick={handleHasLikeArticle} /> : <LikeOutlined onClick={handleLike} />
                }
                  &nbsp;{commentLikeNum}</div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default MyMessage;
