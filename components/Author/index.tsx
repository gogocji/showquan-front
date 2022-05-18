import styles from './index.module.scss'
import { IUserInfo } from 'store/userStore'
import { Avatar } from 'antd'
import { useStore } from 'store/index';
import { observer } from "mobx-react-lite"

interface IProps {
  userInfo: IUserInfo,
  ifCanChangeAvatar: boolean
}
var imgDeg = 0
const CountDown = (props: IProps) => {
  const { userInfo, ifCanChangeAvatar } = props;
  const store = useStore()
  const defstyle = store.common.commonInfo?.defstyle
  const hasMessage = store.common.commonInfo?.hasMessage

  const changeAvatar = () => {
    if (!ifCanChangeAvatar) {
      return
    }
    store.common.setCommonInfo({ defstyle: !defstyle, hasMessage: hasMessage })
    let img =document.getElementById('userImg')?.getElementsByClassName('ant-avatar')[0] as any
    if (defstyle) {
      imgDeg -= 360
      img.style.transform = 'rotate('+imgDeg+'deg)'
      setTimeout(()=>{
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
      {
        userInfo.job && <div className={styles.authorJob} style={{ color: 'rgb(17, 158, 130)' }}>@{userInfo.job}</div>
      }
      {
        userInfo.introduce && <div className={styles.authorIntroduction} style={{ color: 'rgb(17, 158, 130)' }}>-{userInfo.introduce}-</div>
      }
      {
        userInfo.skill && <div className={styles.skill} style={{ color: 'rgb(127, 127, 127)' }}>技术栈：{userInfo.skill}</div>
      }
    </div>
  )
}

export default observer(CountDown);