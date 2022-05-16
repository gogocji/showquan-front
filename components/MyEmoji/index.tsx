import styles from './index.module.scss';
import { emojiList } from 'config/emoji';
import { useState } from 'react'
import { SmileOutlined } from '@ant-design/icons'

interface IProps {
  handleEmoji: (item) => void
}
const MyEmoji = (props : IProps) => {
  const { handleEmoji } = props
  const [isShow, setIsShow] = useState(false)
  const handleOk = (item: any) => {
    console.log('item', item)
    setIsShow(!isShow)
    handleEmoji(item)
  }
  const changeLayer = () => {
    setIsShow(!isShow)
  }
  return (
    <div className={styles.container}>
      <div className={styles.textContainer} onClick={changeLayer}>
        <SmileOutlined twoToneColor="#eb2f96"/>
        <span className={styles.text}>表情</span>
      </div>
        {
          isShow && <div className={styles.emojiContainer}>
            {
            emojiList.map(item => (
              <span key={item.id} onClick={() => handleOk(item.emoji)}>{item.emoji}</span>
            ))
            }
          </div>
        }
    </div>
  )
};

export default MyEmoji;
