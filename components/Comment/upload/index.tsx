import styles from './index.module.scss';
import { FileImageOutlined } from '@ant-design/icons'
import { Upload, Button } from 'antd'
import { useState } from 'react'
interface IProps {
  // eslint-disable-next-line no-unused-vars
  returnUploadUrl: (url: any) => void
}
const CommentUpload = (props: IProps) => {
  const { returnUploadUrl } = props
  const [isUploadImg, setIsUploadImg] = useState(false)
  const handleUpload = (url: any) => {
    returnUploadUrl(url)
  }
  const uploadProps = {
    name: 'file',
    action: '/api/common/upload',
    onChange(info: any) {
      if (info.file.status === 'uploading') {
        setIsUploadImg(true)
      }
      if (info.file.status === 'done') {
        setIsUploadImg(false)
        const uplaodUrl = info.file.response.data.url
        handleUpload(uplaodUrl)
      }
    },
    showUploadList: false // 设置不展示上传后的文件列表，直接自定义
  };

  return (
    <div className={styles.container}>
      <Button loading={isUploadImg} className={styles.button}>
        <Upload {...uploadProps}>
          <FileImageOutlined twoToneColor="#eb2f96"/>
          <span className={styles.text}>图片</span>
        </Upload>
      </Button>
    </div>
  )
};

export default CommentUpload;
