import styles from './index.module.scss';
import { FileImageOutlined } from '@ant-design/icons'
import { Upload } from 'antd'
  
interface IProps {
  returnUploadUrl: (url) => void
}
const CommentUpload = (props: IProps) => {
  const { returnUploadUrl } = props
  const handleUpload = (url: any) => {
    returnUploadUrl(url)
  }
  const uploadProps = {
    name: 'file',
    action: '/api/common/upload',
    onChange(info: any) {
      if (info.file.status === 'done') {
        const uplaodUrl = info.file.response.data.url
        handleUpload(uplaodUrl)
      }
    },
    showUploadList: false // 设置不展示上传后的文件列表，直接自定义
  };

  return (
    <div className={styles.container}>
      <Upload {...uploadProps}>
        <FileImageOutlined twoToneColor="#eb2f96"/>
        <span className={styles.text}>图片</span>
      </Upload>
    </div>
  )
};

export default CommentUpload;
