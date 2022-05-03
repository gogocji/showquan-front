import Link from 'next/link';
import { format } from 'date-fns';
import { IArticle } from 'pages/api/index';
import { Avatar, List, Tag, Image } from 'antd';
import { EyeOutlined, TagOutlined, CalendarOutlined, FireOutlined, MessageOutlined, ArrowsAltOutlined, RightOutlined } from '@ant-design/icons';
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

  const handleToDetail = () => {

  }
  return (
    // eslint-disable-next-line @next/next/link-passhref
    <Link href={`/article/${article.id}`} >
      <div className={styles.container}>
        <div className={(styles.article, screenWidth >=770?styles.cssnice1:styles.cssnice)}>
          <div className={styles.header}>
            <h4 className={styles.title}>{article?.title}</h4>
            <div className={styles.userInfo}>
              <Avatar src={user?.avatar} size={48} />
              <span className={styles.name}>{user?.nickname}</span>
            </div>
          </div>
          <div className={styles.iconList}>
            <span className={styles.icon}><Tag color="red" style={{margin:0}} >置顶</Tag></span>
            <span className={styles.icon}><CalendarOutlined type='calendar' style={{color:'lightseagreen', marginRight: '5px'}}/>
              {format(new Date(article?.update_time), 'yyyy-mm-dd hh:mm')}
            </span>
            <Tag color="#f50">生活</Tag>
            <Tag color="#2db7f5">技术</Tag>
            <span className={styles.icon}><FireOutlined type='fire' style={{color:'red'}}/> {article?.views}</span>
            <span className={styles.icon}><MessageOutlined type='fire' style={{color:'black'}}/> 231</span>
          </div>
          <div className={styles.articleImg}>
            <Image preview={false} src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fi0.hdslb.com%2Fbfs%2Farticle%2Fd0553d88aff685f8a3cb4d0dd04bef8ae6174694.jpg&refer=http%3A%2F%2Fi0.hdslb.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=auto?sec=1654140843&t=0cd87c7be196ebb935777d9fac1223f9" alt="" />
          </div>
          <p className={styles.content}>{markdownToTxt(article?.content)}</p>
          <div className={styles.toDetail} style={{ textAlign: 'right', marginRight: 20, fontSize: 15, color: '#1e90ff',position: 'relative' }}>
            <a onClick={handleToDetail}><ArrowsAltOutlined style={{ marginRight: 10 }} /><span>查看全文 <RightOutlined  style={{marginLeft: 0}}/></span></a>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default observer(ListItem);
