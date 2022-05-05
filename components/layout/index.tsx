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
    document.addEventListener('visibilitychange',function(){
      var isHidden = document.hidden;
      if(isHidden){
        document.title = '404!!!页面丢失(￣▽￣)"';
      } else {
        document.title = '嘤嘤嘤，你回来了啊(ಥ _ ಥ)';
          setTimeout(()=>{
            document.title = '首页 | 华农秀秀'
          },3000)
      }
    });
  }, [])
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