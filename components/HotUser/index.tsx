import styles from './index.module.scss';
import Icon, { FireOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { Avatar, Divider } from 'antd' 
interface IProps {
  userTopList: []
}
const HotArticle = (props: IProps) => {
  const { userTopList } = props
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <span>作者榜&nbsp;🎖️</span>
      </div>
      <Divider style={{margin: '5px 0'}} dashed></Divider>
      <div className={styles.list}>
        {
          userTopList?.map((item: any) => 
            (
              <Link key={item?.id} href={`/user/${item?.id}`} >
                <div className={styles.listItem}>
                  <Avatar className={styles.avatar} src={item?.avatar} size={50} />
                  <div className={styles.userInfo}>
                    <div className={styles.nickname}>{item.nickname}</div>
                    <div className={styles.job}>@{item.job}</div>
                    <div className={styles.introduce}>{item.introduce}</div>
                  </div>
                </div>
              </Link>
           )
          )
        }
      </div>
    </div>
  )
};

export default HotArticle;