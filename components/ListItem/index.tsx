import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { IArticle } from 'pages/api/index';
import { Avatar } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import { markdownToTxt } from 'markdown-to-txt';
import styles from './index.module.scss';
import { useEffect, useState } from 'react'
import { observer } from "mobx-react-lite"

interface IProps {
  article: IArticle;
}
var globalWidth : any = 0;
const ListItem = (props: IProps) => {
  const { article } = props;
  const { user } = article;
  const [screenWidth, setScreenWidth] = useState(0)
  // 只有在用户端才执行,服务端不执行
  useEffect(() => {
    // 服务端无法访问document和window变量
    globalWidth = document.documentElement.clientWidth || document.body.clientWidth;
    setScreenWidth(globalWidth)
  }, globalWidth)
  return (
    // eslint-disable-next-line @next/next/link-passhref
    <Link href={`/article/${article.id}`} >
      <div className={styles.container}>
        <div className={(styles.article, screenWidth >=770?styles.cssnice1:styles.cssnice)}>
          <div className={styles.userInfo}>
            <span className={styles.name}>{user?.nickname}</span>
            <span className={styles.date}>
              {formatDistanceToNow(new Date(article?.update_time))}
            </span>
          </div>
          <h4 className={styles.title}>{article?.title}</h4>
          <p className={styles.content}>{markdownToTxt(article?.content)}</p>
          <div className={styles.statistics}>
            <EyeOutlined />
            <span className={styles.item}>{article?.views}</span>
          </div>
        </div>
        <Avatar src={user?.avatar} size={48} />
      </div>
    </Link>
  );
};

export default observer(ListItem);
