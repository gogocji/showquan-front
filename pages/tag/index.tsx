import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Tabs, Empty } from 'antd';
import request from 'service/fetch';
import styles from './index.module.scss';
import TagItem from 'components/Tag'

const { TabPane } = Tabs;

interface IUser {
  id: number;
  nickname: string;
  avatar: string;
}

interface ITag {
  id: number;
  title: string;
  icon: string;
  follow_count: number;
  article_count: number;
  users: IUser[];
}

const Tag = () => {
  const [followTags, setFollowTags] = useState<ITag[]>();
  const [allTags, setAllTags] = useState<ITag[]>();
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => {
    request('/api/tag/get').then((res: any) => {
      if (res?.code === 0) {
        const { followTags = [], allTags = [] } = res?.data || {};
        setFollowTags(followTags);
        setAllTags(allTags);
      }
    })
  }, [needRefresh]);

  const refreshList = () => {
    setNeedRefresh(!needRefresh)
  }
  return (
    <div className={styles.contentLayout}>
      <Tabs defaultActiveKey="all">
        <TabPane tab="已关注标签" key="follow" className={styles.tags}>
          {
            followTags && followTags.length ? 
              (
                followTags?.map(tag => (
                  <TagItem key={tag?.id} tag={tag} needRefresh={refreshList} />
                ))
              )
               : (
              <div className={styles.emptyContainer}>
                <Empty />
              </div>
            )
          }
        </TabPane>
        <TabPane tab="全部标签" key="all" className={styles.tags}>
        {
          allTags?.length ? (
            allTags?.map(tag => (
              <TagItem key={tag?.id} tag={tag} needRefresh={refreshList} />
            ))
          ) : (
              <div className={styles.emptyContainer}>
                <Empty />
              </div>
            )
          }
        </TabPane>
      </Tabs>
    </div>
  );
};

export default observer(Tag);
