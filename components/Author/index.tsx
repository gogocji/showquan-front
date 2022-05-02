import styles from './index.module.scss'
import { IUserInfo } from 'store/userStore'
import { Avatar } from 'antd'
import { useStore } from 'store/index';

interface IProps {
  userInfo: IUserInfo
}
var imgDeg = 0
const CountDown = (props: IProps) => {
  const { userInfo } = props;
  const store = useStore()
  const defstyle = store.common.commonInfo?.defstyle

  const changeAvatar = () => {
    store.common.setCommonInfo({ defstyle: !defstyle })
    let img =document.getElementById('userImg')?.getElementsByClassName('ant-avatar')[0] as any
    console.log("img", img)
    if (defstyle) {
      imgDeg -= 360
      img.style.transform = 'rotate('+imgDeg+'deg)'
      setTimeout(()=>{
        console.log('111')
      },300)
    }
    else{
      imgDeg += 360
      img.style.transform = 'rotate('+imgDeg+'deg)'
    }
  }
  return (
    <div className={styles.container}>
      <div id="userImg" className={styles.avatarContainer} >
        <div className={styles.avatar} onMouseEnter={()=>{changeAvatar()}}>
          <Avatar size={100} src={defstyle ? '/images/avatar.jpg' :userInfo.avatar} className={styles.userlight} />
        </div>
      </div>
      <div className={styles.userName} style={defstyle ?{color:'hotpink'}:{color:'rgba(0, 0, 0, 0.65)'}}>{userInfo.nickname}</div>
      <div className={styles.authorIntroduction} style={{ color: 'rgb(0,216,255)' }}>软件工程</div>
      <div className={styles.authorIntroduction} style={{ color: 'rgb(0,216,255)' }}>2019-2023级学生</div>
      <div className={styles.authorIntroduction}></div>
    </div>
  )
}

export default CountDown;