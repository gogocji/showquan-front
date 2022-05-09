import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Form, Input, Button, message } from 'antd';
import request from 'service/fetch';
import styles from './index.module.scss';
import UpLoadImg from 'components/UpLoadImg'
import { useState } from 'react';
import { useStore } from 'store/index'
import { useRouter } from 'next/router'
const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

const tailLayout = {
  wrapperCol: { offset: 4 },
};

const UserProfile = () => {
  const [form] = Form.useForm();
  const [userImgUrl, setUserImgUrl] = useState('');
  const store = useStore()
  const { push } = useRouter()
  useEffect(() => {
    request.get('/api/user/detail').then((res: any) => {
      if (res?.code === 0) {
        setUserImgUrl(res?.data?.userInfo?.avatar)
        form.setFieldsValue(res?.data?.userInfo);
      }
    });
  }, [form]);

  const handleSubmit = (values: any) => {
    request.post('/api/user/update', { ...values, userImgUrl }).then((res: any) => {
      if (res?.code === 0) {
        message.success('修改成功');
        console.log('更改用户信息', res)
        res.data.userId = res?.data?.id
        store.user.setUserInfo(res?.data)
        push('/')
      } else {
        message.error(res?.msg || '修改失败');
      }
    });
  };

  const handleUploadHeadImg = (imgUrl: string) => {
    console.log('上传的用户头像', imgUrl)
    setUserImgUrl(imgUrl)
  }

  return (
    <div className="content-layout">
      <div className={styles.userProfile}>
        <h2>个人资料</h2>
        <div className={styles.userAvatar}>
          <span className={styles.avatarText}>用户头像：</span>
          <UpLoadImg uploadHeadImg={handleUploadHeadImg} />
        </div>
        <div>
          <Form
            {...layout}
            form={form}
            className={styles.form}
            onFinish={handleSubmit}
          >
            <Form.Item label="用户名" name="nickname">
              <Input placeholder="请输入用户名" />
            </Form.Item>
            <Form.Item label="职位" name="job">
              <Input placeholder="请输入职位" />
            </Form.Item>
            <Form.Item label="个人介绍" name="introduce">
              <Input.TextArea placeholder="请输入个人介绍" />
            </Form.Item>
            <Form.Item label="个人介绍" name="skill">
              <Input.TextArea placeholder="请输入个人技术栈" />
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Button type="primary" htmlType="submit">
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default observer(UserProfile);
