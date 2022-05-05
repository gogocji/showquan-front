import { useStore } from 'store/index';
import Login from 'components/Login/index'
import Author from 'components/Author/index'
import UserInfo from 'components/UserInfo/index'
import { observer } from "mobx-react-lite"

const RightBar = ({ children } : any) => {
  // 获取用户id
  const store = useStore()
  const userId = store.user.userInfo?.userId

  return (
    <div>
      {
        !userId ? <Login /> 
        : (
          <div>
            <Author userInfo={store.user.userInfo} />
            <UserInfo />
            <main>{children}</main>
          </div>
          )
      }
    </div>
  )
}

export default observer(RightBar);
