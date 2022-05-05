import styles from './index.module.scss';
import { BackTop } from 'antd';
import { RocketOutlined } from '@ant-design/icons'

const MyBackTop = () => {
  return (
    <BackTop>
      <div className={styles.backToTop} ><RocketOutlined  type="rocket"/></div>
    </BackTop>
  )
};

export default MyBackTop;
