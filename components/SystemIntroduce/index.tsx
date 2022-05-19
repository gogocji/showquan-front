import styles from './index.module.scss';
import { Divider } from 'antd' 
import { SmileTwoTone } from '@ant-design/icons'
const HelloWorld = () => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <span>平台介绍&nbsp;<SmileTwoTone /></span>
      </div>
      <Divider style={{margin: '5px 0'}} dashed></Divider>
      <div className={styles.content}>
        <p>现代课程设计 Next.js全栈框架技术支持 </p>
        <p className={styles.contentItem}>
          <span className={styles.contentItemTitle}>前端：</span>
          Next.js + mobx + Ts + Antd Design;
        </p>
        <p className={styles.contentItem}>
          <span className={styles.contentItemTitle}>后台：</span>
          Vue3 + Pinia + Ts + ElementUI;
        </p>
        <p className={styles.contentItem}>
          <span className={styles.contentItemTitle}>后端：</span>
          Nest.js + Ts + Mysql;
        </p>
        <p className={styles.contentItemBottom}>
          全面拥抱TypeScript;
        </p>
      </div>
    </div>
  )
};

export default HelloWorld;
