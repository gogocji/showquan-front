import Navbar from "components/Navbar"
import Footer from "components/Footer"
import { useStore } from 'store/index';
import MyBackTop from "components/BackTop"
import { useEffect, useRef, useState } from "react";
import { observer } from "mobx-react-lite"
import io from 'socket.io-client'
import { notification } from 'antd';
import debounce from 'lodash/debounce';
var socket : any
var canNotification = true
const Layout = ({ children } : any) => {
  const store = useStore()
  const { isShowDrawer } = store.common.commonInfo
  const { userId } = store.user.userInfo
  const randomUserId = new Date().getTime() + Math.floor(Math.random()*Math.floor(6))
  const sendNotification = (title, content) => {
    notification.open({
      message: title,
      description:
      content,
      onClick: () => {
        console.log('Notification Clicked!');
      },
    });
  } 
  const clineOnline = () => {
    console.log('上线', userId)
    if (userId) {
      socket.emit('clientOnline', userId)
    } else {
      socket.emit('clientOnline', randomUserId)
    }
  }
  const clineClose = () => {
    console.log('下线', userId)
    if (userId) {
      socket.emit('clientClose', userId)
    } else {
      socket.emit('clientClose', randomUserId)
    }
  }
  useEffect(() => {
    // 获取用户是否有离线信息

    if (!socket) {
      socket = io('http://localhost:3000')
    }
    if (userId) {
      socket.emit('clientConnect', userId)
    } else {
      socket.emit('clientConnect', randomUserId)
    }
    if (canNotification) {
      canNotification = false
      socket.on('notification', data => {
        if (data.message.title) {
          console.log('canNotification', canNotification)
          canNotification = false
          const { title, content }  = data.message
          debounce(() => sendNotification(title, content), 1000)()
        }
        setTimeout(() => {
          canNotification = true
        }, 10000)
      })
      socket.on('message', message => {
        console.log('收到独播信息', message)
      })
    }
    

    document.addEventListener('visibilitychange',function(){
      var isHidden = document.hidden;
      if(isHidden){
        document.title = '404!!!页面丢失(￣▽￣)"';
        console.log('2112')
      } else {
        document.title = '嘤嘤嘤，你回来了啊(ಥ _ ಥ)';
          setTimeout(()=>{
            document.title = '首页 | 华农秀秀'
          },3000)
        debounce(clineOnline, 1000)()
      }
    });
    window.addEventListener('beforeunload', () => {
      console.log('beforeunload')
      // debounce(clineClose, 1000)()
      clineClose()
    })
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