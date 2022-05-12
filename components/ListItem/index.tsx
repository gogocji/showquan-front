import Link from 'next/link';
import { format } from 'date-fns';
import { IArticle } from 'pages/api/index';
import { Avatar, Tag, Image } from 'antd';
import { CalendarOutlined, FireOutlined, MessageOutlined, ArrowsAltOutlined, RightOutlined } from '@ant-design/icons';
import { markdownToTxt } from 'markdown-to-txt';
import styles from './index.module.scss';
import { useEffect, useState } from 'react'
import { observer } from "mobx-react-lite"
import LazyLoad from 'react-lazyload';

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
    !article.state && <LazyLoad height={200} offset={-200}>
      <Link href={`/article/${article.id}`} >
        <div className={styles.container}>
          <div className={(styles.article, screenWidth >=770?styles.cssnice1:styles.cssnice)}>
            <div className={styles.header}>
              <h4 className={styles.title}>{article?.title}</h4>
              <div className={styles.userInfo}>
                <Avatar src={user?.avatar} size={30} />
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
              {
                article.headImg ? (
                  <Image preview={false} src={article.headImg} alt="" />
                ) : <div></div>
              }
            </div>
            <p className={styles.content}>{markdownToTxt(article.description || '')}</p>
            <div className={styles.toDetail} style={{ textAlign: 'right', marginRight: 20, fontSize: 15, color: '#1e90ff',position: 'relative' }}>
              <a onClick={handleToDetail}><ArrowsAltOutlined style={{ marginRight: 10 }} /><span>查看全文 <RightOutlined  style={{marginLeft: 0}}/></span></a>
            </div>
          </div>
        </div>
      </Link>
    </LazyLoad>
  );
};

export default observer(ListItem);
