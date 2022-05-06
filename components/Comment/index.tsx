import { useState } from 'react';
import styles from './index.module.scss';
import { Tooltip, Comment, Avatar, Modal, Button, Input, TextArea } from 'antd'
import { LikeFilled, LikeOutlined } from '@ant-design/icons'
import { IComment } from 'pages/api';
import { format } from 'date-fns';

interface IProps {
  // 设置是否可回复（默认一级评论可以回复，二级评论不能回复）
  noPingLun?: boolean
  children?: any,
  comment: IComment
}

const MyComment = (props: IProps) => {
  const { noPingLun, children, comment } = props
  // 是否已点赞
  const [isLike, setIsLike] = useState(false)
  // 用户操作
  const [userAction, setUserAction] = useState(null)
  // 是否展示评论输入框
  const [showModal, setShowModal] = useState(false)
  // 提交loading
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)
  // 提交loading
  const [inputComment, setInputComment] = useState('')
  
  // 发布评论
  const handleSubmitComment = () => {

  }
  // 删除评论
  const handleCancelComment = () => {

  }
  const handleLike = () => {

  }
  const handleInputComment = (value: string) => {
    setInputComment(value)
  }
  // 评论的操作区
  const commentActions = [
    <span key="comment-basic-like">
      <Tooltip title="赞同">
        {
          userAction === 'liked' ? <LikeFilled onClick={handleLike} /> : <LikeOutlined />
        }
      </Tooltip>
      <span style={{ paddingLeft: 8, cursor: 'auto' }}>10</span>
    </span>,
    noPingLun ? null :
        <span key="comment-basic-reply-to" onClick={() => setShowModal(true)}>回复</span>,
  ]
  return (
    <Comment
      actions={commentActions}
      author={ <a style={comment.user.id === 2 ? { color:'red',fontWeight:'700'}:{} }>{ comment.user.id === 2 ?'博主' : comment.user.nickname }</a>}
      avatar={
        <Avatar
            src={comment?.user?.avatar}
            alt="你真好看~"
            size={40} 
        />
      }
      content={
        <p>
            { comment.content }
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
        <Input.TextArea value={inputComment} rows={4} placeholder="输入您的留言" onChange={ (event: any) => handleInputComment(event?.target?.value) } />
      </Modal>
    </Comment>
  )
};

export default MyComment;
