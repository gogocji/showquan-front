import { useStore } from 'store/index';
import Login from 'components/Login/index'
import Author from 'components/Author/index'
import UserInfo from 'components/UserInfo/index'
import { observer } from "mobx-react-lite"

const RightBar = (props) => {
  const { children, ifCanChangeAvatar = true } =props
  // 获取用户id
  const store = useStore()
  const userId = store.user.userInfo?.userId
  console.log('store.user.userInfo', store.user.userInfo)
  return (
    <div>
      {
        !userId ? <Login /> 
        : (
          <div>
            <Author ifCanChangeAvatar={ifCanChangeAvatar} userInfo={store.user.userInfo} />
            <UserInfo />
            <main>{children}</main>
          </div>
          )
      }
    </div>
  )
}

export default observer(RightBar);
