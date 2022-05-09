import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import dynamic from 'next/dynamic';
import { observer } from 'mobx-react-lite';
import { ChangeEvent, useEffect, useState, useRef } from 'react';
import { Input, Button, message, Select } from 'antd';
import { useRouter } from 'next/router';
import { useStore } from 'store/index';
import request from 'service/fetch';
import styles from './index.module.scss';
import UpLoadImg from 'components/UpLoadImg'
import Editor from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

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
  const myMdEditor = useRef(null);

  useEffect(() => {
    request.get('/api/tag/get').then((res: any) => {
      if (res?.code === 0) {
        setAllTags(res?.data?.allTags || [])
      }
    })
  }, []);

  const handlePublish = () => {
    if (!title) {
      message.warning('请输入文章标题');
      return ;
    }
    request.post('/api/article/publish', {
      title,
      content,
      tagIds,
      headImg: headImgUrl
    }).then((res: any) => {
      if (res?.code === 0) {
        userId ? push(`/user/${userId}`) : push('/');
        message.success('发布成功');
      } else {
        message.error(res?.msg || '发布失败');
      }
    })
  };

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event?.target?.value);
  };

  const handleContentChange = (content: any) => {
    setContent(content);
  };

  const updateMdContent = (imgContent) => {
    const historyInnerHTMLd = document.getElementById('md-editor-rt-textarea')?.innerHTML
    let mdContent = historyInnerHTMLd
    mdContent += imgContent
    setContent(mdContent)
  }
  const handleSelectTag = (value: []) => {
    setTagIds(value);
  }

  const handleDescChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDescription(event?.target?.value)
  }

  const handleUploadImg = async (files : File[]) => {
    let imgContent = ''
    // const res = await Promise.all(
    //   Array.from(files).map((file : File) => {
    //     return new Promise((rev, rej) => {
    //       const form = new FormData();
    //       form.append('file', file)
    //       const reader = new FileReader();
    //       if (file) {
    //         reader.readAsDataURL(file);
    //       }
    //       reader.onload = (readerEvent) => {
    //         form.append("image", readerEvent.target.result);
    //         request.post('/api/common/upload', form)
    //         .then((res) => {
    //           if (res?.code === 0 ) {
    //             const { url } = res.data
    //             imgContent += `![](${url})`
    //           }
    //         })
    //       };
    //     });
    //   })
    // );
    const form = new FormData();
    let file = files[0]
    var historyContent = content
    form.append('file', file)
    const reader = new FileReader();
    if (file) {
      reader.readAsDataURL(file);
    }
    reader.onload = (readerEvent) => {
      form.append("image", readerEvent.target.result);
      request.post('/api/common/upload', form)
      .then((res) => {
        if (res?.code === 0 ) {
          const { url } = res.data
          imgContent += `![](${url})`
          updateMdContent(imgContent)
        }
      })
    };
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
      <Editor ref={myMdEditor} onUploadImg={handleUploadImg} modelValue={content} onChange={handleContentChange} />
      {/* <MDEditor value={content} height={1080} onChange={handleContentChange} /> */}
    </div>
  );
};

(NewEditor as any).layout = null;

export default observer(NewEditor);
