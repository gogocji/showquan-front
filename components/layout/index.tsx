import Navbar from "components/Navbar"
import Footer from "components/Footer"
import { useStore } from 'store/index';
import MyBackTop from "components/BackTop"
import { useEffect } from "react";
import { observer } from "mobx-react-lite"

const Layout = ({ children } : any) => {
  const store = useStore()
  const { isShowDrawer } = store.common.commonInfo
  useEffect(() => {
    console.log('isShowDrawer', isShowDrawer)
  }, [isShowDrawer])
  return (
    <div>
      <Navbar />
        <div id='root' style={isShowDrawer ? {paddingLeft:'306px',transition:'all linear .3s',position:'fixed',width:'170%'} : {}}>
          <MyBackTop />
          <main>{children}</main>
        </div>
      <Footer />
    </div>
  )
}

export default observer(Layout)