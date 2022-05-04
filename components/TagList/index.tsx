import styles from './index.module.scss'
import { AntCloudOutlined } from '@ant-design/icons'
import { Tag } from 'antd'
import { useState, useEffect } from 'react';
import request from 'service/fetch';

interface ITag {
  id: number;
  title: string;
}

interface IProps {
  tags: ITag[]
  setTagArticle: (selectTag: number) => void
}

const TagList = (props: IProps) => {
  const { tags, setTagArticle } = props
  const [selectTag, setSelectTag] = useState(0);
  const handleSelectTag = (event: any) => {
    const { tagid } = event?.target?.dataset || {};
    setSelectTag(Number(tagid));
  };

  useEffect(() => {
    setTagArticle(selectTag)
  }, [selectTag]);

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        标签云
        <AntCloudOutlined />
      </div>
      <div className={styles.tagList}>
        <Tag 
          data-tagid={0}  
          onClick={handleSelectTag}
          className={styles.tagItem}
          style={selectTag === 0 ? {border: '5px double white'}: {}}
          color="#2db7f5">
            全部
        </Tag>
        {
          tags?.map((tag) => (
            <Tag 
              key={tag?.id}
              data-tagid={tag?.id}  
              onClick={handleSelectTag}
              className={styles.tagItem}
              style={selectTag === tag?.id ? {border: '5px double white'}: {}}
              color="#f50">
                {tag?.title}
            </Tag>
          ))
        }
        {/* <Tag className={styles.tagItem} color="#2db7f5">教四</Tag>
        <Tag className={styles.tagItem} color="#87d068">芷园</Tag>
        <Tag className={styles.tagItem} color="#108ee9">做核酸啦</Tag>
        <Tag className={styles.tagItem} color="rgb(243, 91, 91)">返校申请</Tag>
        <Tag className={styles.tagItem} color="rgb(255, 193, 1)">快来运动</Tag>
        <Tag className={styles.tagItem} color="rgb(35, 99, 144)">美食分享</Tag>
        <Tag className={styles.tagItem} color="rgb(255, 87, 119">活动公告</Tag>
        <Tag className={styles.tagItem} color="#87d068">二手市场</Tag>
        <Tag className={styles.tagItem} color="#108ee9">公益活动</Tag>
        <Tag className={styles.tagItem} color="rgb(243, 91, 91)">考试资料</Tag> */}

      </div>
    </div>
  )
}

export default TagList