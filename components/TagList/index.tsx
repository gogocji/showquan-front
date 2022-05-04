import styles from './index.module.scss'
import { AntCloudOutlined } from '@ant-design/icons'
import { Tag } from 'antd'
const TagList = () => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        标签云
        <AntCloudOutlined />
      </div>
      <div className={styles.tagList}>
        <Tag className={styles.tagItem} color="#f50">全部</Tag>
        <Tag className={styles.tagItem} color="#2db7f5">教四</Tag>
        <Tag className={styles.tagItem} color="#87d068">芷园</Tag>
        <Tag className={styles.tagItem} color="#108ee9">做核酸啦</Tag>
        <Tag className={styles.tagItem} color="rgb(243, 91, 91)">返校申请</Tag>
        <Tag className={styles.tagItem} color="rgb(255, 193, 1)">快来运动</Tag>
        <Tag className={styles.tagItem} color="rgb(35, 99, 144)">美食分享</Tag>
        <Tag className={styles.tagItem} color="rgb(255, 87, 119">活动公告</Tag>
        <Tag className={styles.tagItem} color="#87d068">二手市场</Tag>
        <Tag className={styles.tagItem} color="#108ee9">公益活动</Tag>
        <Tag className={styles.tagItem} color="rgb(243, 91, 91)">考试资料</Tag>

      </div>
    </div>
  )
}

export default TagList