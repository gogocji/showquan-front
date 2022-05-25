import styles from './index.module.scss';
import * as ANTD_ICONS from '@ant-design/icons';
import { useStore } from 'store/index';
import { Button, message } from 'antd';
import { useState } from 'react'
import request from 'service/fetch';

interface IProps {
  tag: any,
  needRefresh: () => void,
}
const Tag = (props: IProps) => {
  const store = useStore();
  const { tag, needRefresh } = props
  const { userId } = store?.user?.userInfo || {};
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)

  const unFollow = (tagId: number) => {
    setIsSubmitLoading(true)
    request.post('/api/tag/follow', {
      type: 'unfollow',
      tagId
    }).then((res: any) => {
      if (res?.code === 0) {
        message.success('取关成功');
        needRefresh()
      } else {
        message.error(res?.msg || '取关失败');
      }
      setIsSubmitLoading(false)
    })
  }

  const Follow = (tagId: number) => {
    setIsSubmitLoading(true)
    request.post('/api/tag/follow', {
      type: 'follow',
      tagId
    }).then((res: any) => {
      if (res?.code === 0) {
        message.success('关注成功');
        needRefresh()
      } else {
        message.error(res?.msg || '关注失败');
      }
      setIsSubmitLoading(false)
    })
  }
  return (
    <div key={tag?.title} className={styles.tagWrapper}>
      <div className={styles.icon}>{(ANTD_ICONS as any)[tag?.icon]?.render()}</div>
      <div className={styles.title}>{tag?.title}</div>
      <div>{tag?.follow_count} 关注 {tag?.article_count} 文章</div>
      {
        tag?.users?.find((user: any) => Number(user?.id) === Number(userId)) ? (
          <Button loading={isSubmitLoading}  type='primary' onClick={() => unFollow(tag?.id)}>已关注</Button>
        ) : (
          <Button loading={isSubmitLoading}  onClick={() => Follow(tag?.id)}>关注</Button>
        )
      }
    </div>
  );
};

export default Tag;
