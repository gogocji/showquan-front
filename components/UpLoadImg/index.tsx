import styles from './index.module.scss';
import { Upload, message } from 'antd';
import { LoadingOutlined, PlusOutlined, CloseCircleFilled } from '@ant-design/icons';
import { useState, ChangeEvent } from 'react'

interface IProps {
  uploadHeadImg?: (imgUrl: string) => void 
}
const UploadImg = (props: IProps) => {
  const { uploadHeadImg } = props
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const handleChange = (info : any) => {
    if (info.file.status === 'uploading') {
      setLoading(true)
      return
    }
    if (info.file.status === 'done') {
      // getBase64(info.file.originFileObj, (imageUrl : any) =>
      //   {
      //     console.log('imageUrl', imageUrl)
      //     setImageUrl(imageUrl)
      //     setLoading(false)
      //   }
      // );
      const ossUrl = info.file?.response?.data?.url
      setImageUrl(ossUrl)
      setLoading(false)
      uploadHeadImg(ossUrl)
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

  const handleImgDel = (e: ChangeEvent<HTMLInputElement>) => {
    setImageUrl('')
    uploadHeadImg('')
    e.stopPropagation()
  }
  return (
    <Upload
      action="/api/common/upload" 
      name="file"
      accept='image/*'
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      beforeUpload={beforeUpload}
      onChange={handleChange}
    >
      {
        imageUrl ?
          (
            <div className={styles.imgContainer}>
              <img src={imageUrl} alt="avatar" style={{ width: '100%' }} />
              <CloseCircleFilled onClick={handleImgDel} className={styles.del} />
            </div>
          )
          
        : uploadButton()}
    </Upload>
  );
};

export default UploadImg;
