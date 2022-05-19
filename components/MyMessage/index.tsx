import styles from './index.module.scss';
import { Image, Button } from 'antd'
import { LikeOutlined } from '@ant-design/icons'
import { useRouter } from 'next/router'
import { formatDistanceToNow } from 'date-fns';

interface IProps {
  type: string,
  contentItem: any
}
const MyMessage = (props: IProps) => {
  const { type, contentItem} = props
  const { push } = useRouter()
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
      return (<span>{contentItem.content}</span>)
    }
  }
  return (
    <div className={styles.container} >
      <div className={styles.left}>
        <Image className={styles.img} src={contentItem.user.avatar}></Image>
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
          </div>
          {
            type === 'follow' && (
              <div className={styles.followButton}>
                {
                  contentItem.hasLike ? <Button>已关注</Button> : <Button>关注</Button>
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
                  <LikeOutlined></LikeOutlined>&nbsp;{contentItem.like_count}</div>
                <div className={styles.reply}>回复</div>
              </div>
            )
          }
          {
            type === 'thumb' && contentItem.comment && (
              <div className={styles.operation}>
                <div className={styles.like}>
                  <LikeOutlined></LikeOutlined>&nbsp;{contentItem.comment.like_count}</div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
};

export default MyMessage;
