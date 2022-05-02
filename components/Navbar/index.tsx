import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './index.module.scss';
import { navs } from './config';
import type { NextPage } from 'next'
import { Button, Avatar, Dropdown, Menu, message, Row, Col, Drawer } from 'antd'
import { MenuUnfoldOutlined, DownOutlined, UpOutlined } from '@ant-design/icons'
import { useState } from 'react'
import Login from 'components/Login/index'
import { useStore } from 'store/index';
import { LoginOutlined, HomeOutlined } from '@ant-design/icons'
import request from 'service/fetch'
import { observer } from "mobx-react-lite"

const Navbar: NextPage = () => {
  const store = useStore()
  const { userId, avatar } = store.user.userInfo
  const { pathname, push } = useRouter();
  const [ isShowLogin, setIsShowLogin ] = useState(false);
  const [ isMenuOpen, setIsMenuOpen ] = useState(false)
  const [ isDrawerOpen, setIsDrawerOpen ] = useState(false)
  const handleGotoEditorPage = () => {
    if (userId) {
      push('editor/new')
    } else {
      message.warning('请先登录')
    }
  };

  const handleLogin = () => {
    setIsShowLogin(true);
  };

  const handleClose = () => {
    setIsDrawerOpen(false);
  }

  const handleGotoPersonalPage = () => {
    push(`/user/${userId}`);
  }

  const handleLogout = () => {
    request.post('/api/user/logout').then((res: any) =>{
      if (res?.code === 0) {
        store.user.setUserInfo({})
      }
    })
  }

  const showDrawer = () => {
    setIsDrawerOpen(true)
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
  
  return (
    <div className={styles.header}>
      <Row align='middle' justify="space-between" typeof='flex'>
        <Col xs={4} sm={4} md={0} lg={0} xl={0}>
          <MenuUnfoldOutlined style={{color: 'white'}} className={styles.smallMenu} type="menu-unfold" onClick={showDrawer}/>
          <Drawer
            placement="left"
            closable={true}
            onClose={() => setIsDrawerOpen(false)}
            visible={isDrawerOpen}
          >
            陈大杰
          </Drawer>
        </Col>
        <Col xs={16} sm={16} md={0} lg={0} xl={0}>
          <span className={styles.logo}>华农秀秀</span>
        </Col>
        <Col xs={0} sm={0} md={5} lg={5} xl={5}>
          <span className={styles.logo}>华农秀秀</span>
          <span className={styles.headerTxt}>热爱生活</span>
        </Col>
        <Col className={styles.memuDiv} xs={4} sm={3} md={4} lg={4} xl={4}>
          <Menu mode='horizontal'
            style={{backgroundColor: 'rgb(40, 54, 70)'}}
            overflowedIndicator={isMenuOpen ?<UpOutlined style={{color: 'white'}} />:<DownOutlined style={{color: 'white'}} />}
            onOpenChange={()=>setIsMenuOpen(!isMenuOpen)}
            >
            <section className={styles.linkArea}>
              {navs?.map((nav) => (
                <Menu.Item key={nav.label}>
                  <HomeOutlined  className={pathname === nav.value ? styles.active : styles.icon}/>
                  <Link key={nav.label} href={nav.value}>
                    <a className={pathname === nav.value ? styles.active : ''}>
                      {nav.label}
                    </a>
                  </Link>
                </Menu.Item>
              ))}
            </section>
          </Menu>
        </Col>
      <Col xs={0} sm={8} md={9} lg={8} xl={5}>
        <section className={styles.operationArea}>
          <div className={styles.writeText} onClick={handleGotoEditorPage}>写文章</div>
            {
              userId ? (
                <>
                    <Dropdown overlay={renderDropDownMenu()} placement="bottomLeft">
                      <Avatar src={avatar} size={32} />
                    </Dropdown>
                </>
              ) : (
                <Button type="primary" onClick={handleLogin}>登录</Button>
              )
            }
        </section>
        <Login isShow={isShowLogin} onClose={handleClose}/>
      </Col>
      </Row>
    </div>
  );
};

export default observer(Navbar);

