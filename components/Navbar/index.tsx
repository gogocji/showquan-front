import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from './index.module.scss';
import { navs } from './config';
import type { NextPage } from 'next'
import { Button, Avatar, Dropdown, Menu } from 'antd'
import { useState } from 'react'
import Login from 'components/Login/index'
import { useStore } from 'store/index';
import { LoginOutlined, HomeOutlined } from '@ant-design/icons'
import request from 'service/fetch'
import { observer } from "mobx-react-lite"

const Navbar: NextPage = () => {
  const store = useStore()
  const { userId, avatar } = store.user.userInfo
  const { pathname } = useRouter();
  const [ isShowLogin, setIsShowLogin ] = useState(false);

  const handleGotoEditorPage = () => {

  };

  const handleLogin = () => {
    setIsShowLogin(true);
  };

  const handleClose = () => {
    setIsShowLogin(false);
  }

  const handleGotoPersonalPage = () => {

  }

  const handleLogout = () => {
    request.post('/api/user/logout').then((res: any) =>{
      if (res?.code === 0) {
        store.user.setUserInfo({})
      }
    })
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
    <div className={styles.navbar}>
    <section className={styles.logoArea}>华农秀秀</section>
      <section className={styles.linkArea}>
        {navs?.map((nav) => (
          <Link key={nav.label} href={nav.value}>
            <a className={pathname === nav.value ? styles.active : ''}>
              {nav.label}
            </a>
          </Link>
        ))}
      </section>
      <section className={styles.operationArea}>
        <Button onClick={handleGotoEditorPage}>写文章</Button>
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
    </div>
  );
};

export default observer(Navbar);

