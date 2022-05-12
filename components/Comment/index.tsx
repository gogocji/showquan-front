import { useEffect, useState } from 'react';
import styles from './index.module.scss';
import { Tooltip, Comment, Avatar, Modal, Button, Input, message } from 'antd'
import { LikeFilled, LikeOutlined } from '@ant-design/icons'
import { IArticle, IComment } from 'pages/api';
import { format } from 'date-fns';
import request from 'service/fetch';
import { IUserInfo } from 'store/userStore';
import { observer } from "mobx-react-lite"

interface IProps {
  // 设置是否可回复（默认一级评论可以回复，二级评论不能回复）
  noPingLun?: boolean
  children?: any,
  comment: IComment,
  article: IArticle,
  userInfo: IUserInfo,
  // eslint-disable-next-line no-unused-vars
  handleAddComment: (childComment: IComment) => void
}

const MyComment = (props: IProps) => {
  const { noPingLun, children, comment, article, userInfo, handleAddComment } = props
  // 用户操作
  const [userAction, setUserAction] = useState('')
  // 是否展示评论输入框
  const [showModal, setShowModal] = useState(false)
  // 提交loading
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)
  // 评论内容
  const [inputComment, setInputComment] = useState('')
  const [commentLikeNum, setCommentLikeNum] = useState(0)

  // 找到最终的父评论 
  const findCommentRoot = (comment : any) => {
    if(comment?.rComment !== null) {
      comment = comment?.rComment
    }
    return comment.id
  }
  // 发布评论
  const handleSubmitComment = () => {
    if (inputComment === '') {
      message.error('评论不能为空')
      return
    }
    setIsSubmitLoading(true)
    // 找到最终的父评论
    const pid = findCommentRoot(comment)
    request
    .post('/api/comment/publish', {
      articleId: article?.id,
      content: inputComment,
      toUser_id: comment?.user?.id,
      pid: comment.id,
      rid: pid
    })
    .then((res: any) => {
      if (res?.code === 0) {
        message.success('发表成功');
        // 在已有评论的后面进行追加评论
        const tempComment = comment.rComment ? comment.rComment : comment
        const newChildComment = {
          id: res.data?.id,
          rComment: tempComment,
          pComment: comment,
          create_time: new Date(),
          update_time: new Date(),
          content: inputComment,
          toUser: comment?.user,
          user: {
            avatar: userInfo?.avatar,
            nickname: userInfo?.nickname,
            id: userInfo.userId
          },
        }
        // 回传给父组件，添加comment展示给用户
        handleAddComment(newChildComment)
        setIsSubmitLoading(false)
        setInputComment('');
        setShowModal(false)
      } else {
        message.error('发表失败');
      }
    });
  }
  // 取消评论
  const handleCancelComment = () => {
    setShowModal(false)
  }
  const handleLike = () => {
    console.log('222')
    request
    .post('/api/comment/thumb/thumb', {
      comment_id: comment.id,
      user_id: userInfo.userId
    })
    .then((res: any) => {
      if (res?.code === 0) {
        message.success('点赞成功')
        setUserAction('liked')
        setCommentLikeNum(commentLikeNum ? commentLikeNum : 0 + 1)
      }
    })
  }
  const handleInputComment = (value: string) => {
    setInputComment(value)
  }

  // 点击【已点赞按钮】
  const handleHasLikeArticle = () => {
    message.error('无法重复点赞')
  }
  useEffect(() => {
    // 获取文章点赞情况
    request
      .post('/api/comment/thumb/getThumb', {
        comment_id: comment.id,
        user_id: userInfo.userId
      }).then((res: any) => {
        if (res?.code === 0) {
          const { ifLike, commentLikeData } = res.data
          setUserAction( ifLike ? 'liked' : '')
          setCommentLikeNum(commentLikeData?.like_count)
        }
      })
  }, [])
  // 评论的操作区
  const commentActions = [
    <span key="comment-basic-like">
      <Tooltip title="赞同">
        {
          userAction === 'liked' ? <LikeFilled onClick={handleHasLikeArticle} /> : <LikeOutlined onClick={handleLike} />
        }
      </Tooltip>
      <span style={{ paddingLeft: 8, cursor: 'auto' }}>{commentLikeNum ? commentLikeNum : 0}</span>
    </span>,
    noPingLun ? null :
        <span key="comment-basic-reply-to" onClick={() => setShowModal(true)}>回复</span>,
  ]
  return (
    <Comment
      actions={commentActions}
      author={ <a style={comment && comment?.user.id == 2 ? { color:'red',fontWeight:'700'}:{} }>{ comment.user.id == 2 ?'博主' : comment.user.nickname }</a>}
      avatar={
        <Avatar
            src={comment?.user?.avatar}
            alt="你真好看~"
            size={40} 
        />
      }
      content={
        <p>
          {
            comment?.toUser?.nickname ? (
              <div className={styles.historyMessageContainer}>
                <div style={{color: 'rgb(85, 181, 154)'}}>
                  {
                    comment?.toUser.id == 2 ? <span>@博主：</span>
                    : <span>@{comment?.toUser?.nickname}：</span>
                  }
                </div>
                <div className={styles.historyMessageText}>{comment.pComment?.content}</div>
              </div>
              
            ) : null
          }
          <div>{comment.content }</div>
        </p>
      }
      datetime={
        <span>{format(
          new Date(comment?.update_time),
            'yyyy-MM-dd hh:mm:ss'
          )}
        </span>
      }
  >{ children }
      <Modal
        visible={showModal}
        title="追评"
        onOk={handleSubmitComment}
        onCancel={handleCancelComment}
        footer={[
          <Button key="back" onClick={handleCancelComment}>
              返回
          </Button>,
          <Button key="submit" type="primary" loading={isSubmitLoading} onClick={handleSubmitComment}>
              提交评论
          </Button>,
        ]}
      >
        <Input style={{marginBottom: '10px'}} value={`回复@${comment.user.nickname}`} disabled></Input>
        <Input.TextArea value={inputComment} rows={4} placeholder="输入您的留言" onChange={ (event: any) => handleInputComment(event?.target?.value) } />
      </Modal>
    </Comment>
  )
};

export default observer(MyComment);