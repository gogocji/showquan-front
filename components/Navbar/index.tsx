import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './index.module.scss';
import { navs } from './config';
import type { NextPage } from 'next'
import { Button, Avatar, Dropdown, Menu, message, Row, Col, notification } from 'antd'
import { MenuUnfoldOutlined, DownOutlined, UpOutlined, NotificationFilled } from '@ant-design/icons'
import { useEffect, useRef, useState } from 'react'
import PopLogin from 'components/PopLogin/index'
import { useStore } from 'store/index';
import { LoginOutlined, HomeOutlined } from '@ant-design/icons'
import request from 'service/fetch'
import { observer } from "mobx-react-lite"
import * as ANTD_ICONS from '@ant-design/icons';

const Navbar: NextPage = () => {
  const store = useStore()
  const { defstyle } = store.common.commonInfo
  const { userId, avatar } = store.user.userInfo
  const { pathname, push } = useRouter();
  const [ isShowLogin, setIsShowLogin ] = useState(false);
  const [ isMenuOpen, setIsMenuOpen ] = useState(false)
  // const timer = useRef(null) as any
  const handleGotoEditorPage = () => {
    if (userId) {
      push('/editor/new')
    } else {
      message.warning('请先登录')
    }
  };

  const handleGotoHome = () => {
      push('/')
  }

  const handleLogin = () => {
    setIsShowLogin(true);
  };

  const handleClose = () => {
    setIsShowLogin(false);
  }

  const handleGotoPersonalPage = () => {
    push(`/user/${userId}`);
  }

  const handleLogout = () => {
    request.post('/api/user/logout').then((res: any) =>{
      if (res?.code === 0) {
        store.user.setUserInfo({})
        localStorage.removeItem('userInfo')
        push('/')
      }
    })
  }

  const showDrawer = () => {
    store.common.setCommonInfo({ isShowDrawer: true})
  }

  const renderDropDownMenu = () => {
    return (
      <Menu>
        <Menu.Item onClick={handleGotoPersonalPage}>
          <HomeOutlined/>
          &nbsp; 个人主页
        </Menu.Item>
        <Menu.Item onClick={handleLogout}>
          <LoginOutlined/>
          &nbsp; 退出系统
        </Menu.Item>
      </Menu>
    )
  }
  var scrollheight = 0
  const handleCloseNotification = () => {
    store.common.setCommonInfo({hasCloseNotification: true})
  }
  useEffect(() => {
    window.onscroll= function(){
      //变量t是滚动条滚动时，距离顶部的距离
      var t = document.documentElement.scrollTop||document.body.scrollTop;
      var scrollup = document.getElementById('scrolldisplay');
      //当滚动到距离顶部200px时，返回顶部的锚点显示
      
      if(t>=200 && scrollup){
        if(t-scrollheight<0){
          scrollup.style.marginTop = '0'
          scrollheight = t
        }
        else{
          scrollup.style.marginTop='-3.2rem'
          scrollheight = t 
        }
      }else{          //恢复正常
        if (scrollup?.style) {
          scrollup.style.marginTop='0'
        }
        scrollheight = t
      }
    }
    // if (!timer.value) {
    //   timer.value = setInterval(() => {
    //     request.get('/api/common/notification/getSystemNotification', {
    //       is_start: 1
    //     }).then((res) => {
    //       if (res?.code === 0) {
    //         console.log('res', res.data)
    //         if (!store.common.commonInfo.hasCloseNotification) {
    //           res.data.map((item: any) => {
    //             notification['error']({
    //               message: item.title,
    //               description: item.content,
    //               onClose: handleCloseNotification
    //             });
    //           })
    //         }
    //       }
    //     })
    //   }, 15000)
    // }
  }, [])

  const handleToMessage = () => {
    push('/message')
  }

  return (
    <div id='scrolldisplay' className={styles.header} style={defstyle ? {backgroundColor: 'rgb(40, 54, 70)'} : {}}>
      <Row align='middle' justify="space-between" typeof='flex'>
        <Col xs={4} sm={4} md={0} lg={0} xl={0}>
          <MenuUnfoldOutlined style={{color: 'white'}} className={styles.smallMenu} type="menu-unfold" onClick={showDrawer}/>
        </Col>
        {/* <Col xs={16} sm={16} md={0} lg={0} xl={0}>
          <span className={styles.logo}>华农秀秀</span>
        </Col> */}
        <Col onClick={handleGotoHome} xs={16} sm={15} md={5} lg={5} xl={5}>
          <span className={styles.logo}>华农秀秀</span>
          <span className={styles.headerTxt}>热爱生活</span>
        </Col>
        <Col xs={3} sm={3} md={0} lg={0} xl={0}>
          {
            userId ? null : <Button type='primary' onClick={handleLogin} className={styles.loginBtn}>登录</Button>
          }
        </Col>
        <Col className={styles.memuDiv} xs={1} sm={2} md={4} lg={4} xl={4}>
          <Menu mode='horizontal'
            style={defstyle ? {backgroundColor: 'rgb(40, 54, 70)'} : {backgroundColor: 'rgb(85, 181, 154)'}}
            overflowedIndicator={isMenuOpen ?<UpOutlined style={{color: 'white'}} />:<DownOutlined style={{color: 'white'}} />}
            onOpenChange={()=>setIsMenuOpen(!isMenuOpen)}
            >
            <section className={styles.linkArea}>
              {navs?.map((nav) => (
                <Menu.Item key={nav.label}>
                  <div style={{'display': 'flex'}}>
                    <div className={pathname === nav.value ? styles.active : styles.icon}>{(ANTD_ICONS as any)[nav?.icon]?.render()}</div>
                    {/* <HomeOutlined  className={pathname === nav.value ? styles.active : styles.icon}/> */}
                    <Link key={nav.label} href={nav.value}>
                      <a className={pathname === nav.value ? styles.active : ''}>
                        {nav.label}
                      </a>
                    </Link>
                  </div>
                </Menu.Item>
              ))}
            </section>
          </Menu>
        </Col>
        <Col xs={0} sm={0} md={10} lg={8} xl={7}>
          <section className={styles.operationArea}>
            <div className={styles.notification} onClick={handleToMessage}>
              <NotificationFilled style={{color: 'white'}} />
              <div className={styles.tips}></div>
            </div>
              {
                userId ? (
                  <>
                      <div className={styles.writeText} onClick={handleGotoEditorPage}>写文章</div>
                      <Dropdown overlay={renderDropDownMenu()} placement="bottomLeft">
                        <Avatar src={avatar} size={32} />
                      </Dropdown>
                  </>
                ) : <div className={styles.notLoginText}>👇 登录一下把~</div>
              }
          </section>
        </Col>
        <PopLogin isShow={isShowLogin} onClose={handleClose}/>
      </Row>
    </div>
  );
};

export default observer(Navbar);

