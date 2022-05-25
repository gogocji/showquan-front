import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { observer } from 'mobx-react-lite';
import { ChangeEvent, useEffect, useState } from 'react';
import { Input, Button, message, Select } from 'antd';
import { useRouter } from 'next/router';
import { useStore } from 'store/index';
import request from 'service/fetch';
import styles from './index.module.scss';
import UpLoadImg from 'components/UpLoadImg'
import Editor from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';

const NewEditor = () => {
  const store = useStore();
  const { push } = useRouter();
  const { userId } = store.user.userInfo;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagIds, setTagIds] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [description, setDescription] = useState('');
  const [headImgUrl, setHeadImgUrl] = useState('');
  const [contentWarningNum, setContentWarningNum] = useState(0)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)

  useEffect(() => {
    request.get('/api/tag/get').then((res: any) => {
      if (res?.code === 0) {
        setAllTags(res?.data?.allTags || [])
      }
    })
  }, []);

  var tempContent = ''
  const keywordRed = (keyword: any) =>  {
    if (keyword && keyword !== '') {
      let str = tempContent ? tempContent : content
      str = str.split(keyword).join("<span style='color:white;background-color: red;'>" + keyword + "</span>")
      setContent(str)
      tempContent = str
    }
  }

  const handlePublish = () => {
    if (!title) {
      message.warning('请输入文章标题');
      return ;
    }
    setIsSubmitLoading(true)
    request.post('/api/article/publish', {
      title,
      content,
      tagIds,
      description,
      headImg: headImgUrl
    }).then((res: any) => {
      if (res?.code === 0) {
        userId ? push(`/user/${userId}`) : push('/');
        message.success('发布成功');
      } else if (res?.code === 2006) {
        // 内容敏感
        console.log('resresres', res)
        message.error('内容敏感！请修改');
        const failContent = res.failContent
        setContentWarningNum(failContent.length)
        failContent.map((item : any) => keywordRed(item))
        setContent(tempContent)
      } else {
        message.error(res?.msg || '发布失败');
      }
      setIsSubmitLoading(false)
    })
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event?.target?.value);
  };

  const handleContentChange = (content: any) => {
    setContent(content);
  };

  const updateMdContent = (imgContent: string) => {
    const historyInnerHTMLd = document.getElementById('md-editor-rt-textarea')?.innerHTML
    let mdContent = historyInnerHTMLd
    mdContent += imgContent
    setContent(mdContent as string)
  }
  const handleSelectTag = (value: []) => {
    setTagIds(value);
  }

  const handleDescChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDescription(event?.target?.value)
  }

  const handleUploadImg = async (files : File[]) => {
    let imgContent = ''
    const res = await Promise.all(
      Array.from(files).map((file : File) => {
        return new Promise((rev, rej) => {
          const form = new FormData();
          form.append('file', file)
          const reader = new FileReader();
          if (file) {
            reader.readAsDataURL(file);
          }
          reader.onload = (readerEvent : any) => {
            form.append("image", readerEvent.target.result);
            request.post('/api/common/upload', form)
            .then((res : any) => {
              if (res?.code === 0 ) {
                const { url } = res.data
                rev(`![](${url})`)
              }
            })
            .catch((error: any) => rej(error));
          };
        });
      })
    );
    res.map((url) => {
      imgContent += url
    })
    updateMdContent(imgContent)
  }

  const handleUploadHeadImg = (imgUrl: string) => {
    setHeadImgUrl(imgUrl)
  }

  return (
    <div className={styles.container}>
      <div className={styles.operation}>
        <Input
          className={styles.title}
          placeholder="请输入文章标题"
          value={title}
          onChange={handleTitleChange}
        />
        <Select
          className={styles.tag}
          mode="multiple"
          allowClear
          placeholder="请选择标签"
          onChange={handleSelectTag}
        >{allTags?.map((tag: any) => (
          <Select.Option key={tag?.id} value={tag?.id}>{tag?.title}</Select.Option>
        ))}</Select>
        <Button
          loading={isSubmitLoading}
          className={styles.button}
          type="primary"
          onClick={handlePublish}
        >
          发布
        </Button>
      </div>
      <div className={styles.desc}>
        <Input
          placeholder="请输入文章描述"
          value={description}
          onChange={handleDescChange}
        />
      </div>
      <div className={styles.upLoadImg}>
        <UpLoadImg uploadHeadImg={handleUploadHeadImg} />
      </div>
      {
        contentWarningNum && (
          <div className={styles.contentWarnings}>
            还有 {contentWarningNum} 处敏感词待修改，方可发布文章
          </div>
        )
      }
      <Editor onUploadImg={handleUploadImg} modelValue={content} onChange={handleContentChange} />
      {/* <MDEditor value={content} height={1080} onChange={handleContentChange} /> */}
    </div>
  );
};

(NewEditor as any).layout = null;

export default observer(NewEditor);
