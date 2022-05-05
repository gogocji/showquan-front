import styles from './index.module.scss';
import { Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from 'react'
import moment from 'moment';
import CryptoJS from 'crypto-js';
import Base64 from 'base-64';

const UploadImg = () => {
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const todayKey = moment().format('YYYYMMDD');
  const host = "http://gogocj-blog.oss-accelerate.aliyuncs.com";
  const accessKeyId = "LTAI4G1uDx13XfG7juuihyVG";
  const accessSecret = "PZkwIp20kNFqldgnM5MqTBbnkAbOws";
  const policyText = {
    "expiration": "2028-01-01T12:00:00.000Z", // 设置该Policy的失效时间，
    "conditions": [
      ["content-length-range", 0, 1048576000] // 设置上传文件的大小限制
    ]
  };
  const policyBase64 = Base64.encode(JSON.stringify(policyText))
  const bytes = CryptoJS.HmacSHA1(policyBase64, accessSecret);
  const signature = bytes.toString(CryptoJS.enc.Base64); 

  const getBase64 = (img: any, callback: any) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
  }
  const handleChange = (info : any) => {
    if (info.file.status === 'uploading') {
      setLoading(true)
      return
    }
    console.log('info.fileList[0].originFileObj', info.fileList[0])
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj, (imageUrl : any) =>
        {
          console.log('imageUrl', imageUrl)
          setImageUrl(imageUrl)
          setLoading(false)
        }
      );
    }
  }
  const uploadButton = () => {
    return (
      <div>
        {loading ? <LoadingOutlined /> : <PlusOutlined />}
        <div style={{ marginTop: 8 }}>上传图片</div>
      </div>
    )
  }
  const beforeUpload = (file : any) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
  }
  return (
    <Upload
      name="avatar"
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      action={host}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      data={{
        signature,
        key: todayKey + "/123",
        policy: policyBase64,
        OSSAccessKeyId: accessKeyId,
        success_action_status: 200
      }}
    >
      {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton()}
    </Upload>
  );
};

export default UploadImg;
