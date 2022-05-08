import styles from './index.module.scss';
import { Avatar, Button, Divider } from 'antd'
import { IUserInfo } from 'store/userStore';
interface IProps {
  userInfo: IUserInfo
}
const FollowItem = (props: IProps) => {
  const { userInfo } = props
  return (
    <div className={styles.item}>
      <div className={styles.itemLeft}>
        <Avatar className={styles.avatar} src={userInfo?.avatar} size={48} />
        <div className={styles.userInfo}>
          <div className={styles.nickname}>{userInfo.nickname}</div>
          <div className={styles.introduce}>{userInfo.introduce}</div>
        </div>
      </div>
      <div className={styles.itemRight}>
        <Button className={styles.button}>已关注</Button>
      </div>
    </div>
  );
};

export default FollowItem;
