# 博客社区-Next.js开发记录

## 一、next.js使用mobx

- 下载依赖（安装两个依赖）

```npm
yarn add mobx mobx-react-lite
```

- 建立store文件夹以及基本的store代码

![image-20220512160744721](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512160744721.png)

index.ts是把这个store暴露给外部使用store的

rootStore.ts作为所有用户定义的store状态的根节点

**userStore.ts:**

```TS
export type IUserInfo = {
  userId?: number;
  nickname?: string;
  avatar?: string;
  id?: number;
  introduce?: string;
  job?: string;
  skill?: string;
};

export interface IUserStore {
  userInfo: IUserInfo;
  // eslint-disable-next-line no-unused-vars
  setUserInfo: (value: IUserInfo) => void;
}

const userStore = (): IUserStore => {
  return {
    userInfo: {},
    setUserInfo: function (value) {
      this.userInfo = value;
    },
  };
};

export default userStore;
```

**rootStore.ts：**

```TS
import userStore, { IUserStore } from './userStore';

export interface IStore {
  user: IUserStore;
}

export default function createStore(initialValue: any): () => IStore {
  return () => {
    return {
      user: { ...userStore(), ...initialValue?.user }, // 这里的...initialValue会对userStore的一些默认key进行覆盖更新
    };
  };
}
```

**index.tsx**

```tsx
import React, { createContext, useContext, ReactElement } from 'react';
import { useLocalObservable, enableStaticRendering } from 'mobx-react-lite';
import createStore, { IStore } from './rootStore';

interface IProps {
  initialValue: Record<any, any>;
  children: ReactElement
}

enableStaticRendering(!process.browser);

const StoreContext = createContext({});

export const StoreProvider = ({ initialValue, children }: IProps) => {
  const store: IStore = useLocalObservable(createStore(initialValue));
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};

export const useStore = () => {
  const store: IStore = useContext(StoreContext) as IStore;
  if (!store) {
    throw new Error('数据不存在');
  }
  return store;
};
```

- pages/_app.tsx引入

```TSX
import 'styles/globals.css'
import type { AppProps } from 'next/app'
import { StoreProvider } from 'store/index'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StoreProvider initialValue={{ user: {} }}>
      <Component {...pageProps} />
    </StoreProvider>
  )
}
```

- 外部使用

引入useStore 

```ts
import { useStore } from 'store/index'

const Login = () => {
	const store = useStore()
	// 获取user Store里面的信息
	console.log(store.user.userInfo)
	// 设置user Store里面的信息
	store.user.setUserInfo({
		userId: '1',
		nickname: '666'
	})
}
```



ps：假如我们还要定义其他Store的话，比如定义一个common全局要用到的一些属性：

- 新建一个commonStore.ts

```ts
export type ICommonInfo = {
  isShowDrawer?: boolean,
  defstyle?: boolean,
  showDrawer?: boolean
};

export interface ICommonStore {
  commonInfo: ICommonInfo;
  // eslint-disable-next-line no-unused-vars
  setCommonInfo: (value: ICommonInfo) => void;
}

const commonStore = (): ICommonStore => {
  return {
    commonInfo: {},
    setCommonInfo: function (value) {
      this.commonInfo = value;
    },
  };
};

export default commonStore;
```

- 在rootStore.ts引入新建的这个commonStore

```TS
import userStore, { IUserStore } from './userStore';
import commonStore, { ICommonStore } from './commonStore';

export interface IStore {
  user: IUserStore;
  common: ICommonStore
}

export default function createStore(initialValue: any): () => IStore {
  return () => {
    return {
      user: { ...userStore(), ...initialValue?.user }, // 这里的...initialValue会对userStore的一些默认key进行覆盖更新
      common: { ...commonStore(), ...initialValue?.common }
    };
  };
}
```





## 二、next.js使用redis以及实现统计访问量，点赞、作者排行榜等功能

> 前言：因为我们点赞了之后，对数据库进行操作，但是当我们要实现各个文章内容的点赞排行榜，或者是掘金这种作者排行榜，我们不可能对数据库全表进行搜索然后再进行排序，所以我们可以直接使用redis

### 0、next.js使用redis

之前在网上查了挺久都没有看到next.js使用redis的一些教程，然后看到了next.js源码里面有一个example示例代码，就开始对使用redis一发不可收拾了。。。

https://github.com/vercel/next.js/tree/canary/examples/with-redis

在文件夹的lib目录下新建一个redis.ts文件夹

![image-20220512162919419](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512162919419.png)

- 安装依赖

```JS
yarn add ioredis
```

- 新建redis.ts:

```TS
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export default redis
```



如何使用：以一个案例（统计本网站的总访问量和每日访问量） 在pages/api/addView.ts （作为增加网站阅览量的接口）

需求：用户今日网站首页的时候就记录一次访问量，但是一个用户一天内访问了多次本网站还是算作只是访问了一次。

![image-20220512181330041](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512181330041.png)

上面是我用echart折线图实现的一个7天访问量的统计

![image-20220512165339513](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512165339513.png)

以及一个总访问量 和 今日访问量（可以看到该网站的总访问量是6，今日访问量是2）

ps：样式有点丑，还没优化UI，各位好兄弟们凑合看（bushi）

所以我就要记录 **用户总访问量 和 每日用户访问量**

redis设计：

- 通过set结构（就是不允许重复的数组）
- 每日的用户访问量，通过一个叫做 **s_view_day:id **:20220512作为这个结构的名字，value就是user_id
  - s_view_day:id 后面拼接的:20220512是拼接了一个来表示今天的用户量结构
- 总用户量访问，通过一个叫做**s_view_all:id**命名结构，value是user_id:20220512
  - 这个刚好相反，value是user_id: 再加一个时间戳，因为今天的用户，在明天访问的话，如果还要加入总用户量这个set结构的话，就必须不同，所以value就不能只是user_id



20220512这样的时间戳要如何生成

在utils工具类里面定义一下

```TS
export const getTimeYYYYMMDD = () => {
  let nowDate = new Date()
  let year = nowDate.getFullYear()
  let month = nowDate.getMonth() + 1
  let day = nowDate.getDate()
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (day >= 0 && day <= 9) {
    day = "0" + day;
  }
  console.log(year + '' + month + '' + day)
  return year + '' + month + '' + day
}
```

实现源码（pages/api/addView.ts ）

```TS
import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { EXCEPTION_COMMON } from 'pages/api/config/codes';

import redis from 'lib/redis'
import { getTimeYYYYMMDD } from 'utils'

export default withIronSessionApiRoute(addView, ironOptions);

// 用户阅览网站 增加网站阅览量
async function addView(req: NextApiRequest, res: NextApiResponse) {
  const { user_id } = req.body
  const timestamp = getTimeYYYYMMDD()
  const result1 = await redis.sadd('s_view_all:id', user_id + ':' + timestamp)
  const result2 = await redis.sadd('s_view_day:id:' + timestamp, user_id)
  if (result2) {
    res.status(200).json({ code: 0, msg: '记录成功' });
  } else {
    res.status(200).json({ ...EXCEPTION_COMMON.ADDVIEW_FAILED });
  }
}
```

上面的redis.sadd这些操作最好还是看一下redis操作的一些函数：

附上菜鸟教程的链接：https://www.runoob.com/redis/redis-sets.html



```JS
import { EXCEPTION_COMMON } from 'pages/api/config/codes';
```

这个是我定义的返回的异常信息

```TS
export const EXCEPTION_COMMON = {
  ADDVIEW_FAILED: {
    code: 6001,
    msg: '增加访问量失败',
  },
};
```

就可以看到了

![image-20220512183539895](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512183539895.png)

![image-20220512183551623](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512183551623.png)

上面这个是redis的可视化界面，redis destop manager

百度网盘链接：https://pan.baidu.com/s/15xVRpCT8mkP2uT8PoBHT3g



如果我们要实现获取这些 用户浏览量信息（最近七天的增长量、总用户浏览量、今日新增等）

1、获取该网站总用户浏览量 & 今日新增

![image-20220512165339513](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512165339513.png)

```TS
import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import redis from 'lib/redis'
import { getTimeYYYYMMDD } from 'utils'

export default withIronSessionApiRoute(getIp, ironOptions);

async function getIp(req: NextApiRequest, res: NextApiResponse) {
  const timestamp = getTimeYYYYMMDD()
  // 获取今日新增用户
  const dayViewNum = await redis.scard('s_view_day:id:' + timestamp)
  const allViewNum = await redis.scard('s_view_all:id')
  console.log(dayViewNum, allViewNum)
  res?.status(200).json({
    code: 0,
    msg: '获取全站阅览总量&每日新增阅览量成功',
    data: {
      dayViewNum,
      allViewNum
    }
  });
}
```

2、获取过去一周内每一天的用户浏览量的数据变化

![image-20220512181325834](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512181325834.png)

首先我们得先获取一下 20220506、20220507、20220508、20220509、20220510、20220511 、20220512

```TS
export const getWeekYYYYMMDD = () => {
  let days = [];
  var nowDate = new Date();
  for(let i=0; i<=24*6;i+=24){		//今天加上前6天
    let dateItem=new Date(nowDate.getTime() - i * 60 * 60 * 1000);	//使用当天时间戳减去以前的时间毫秒（小时*分*秒*毫秒）
    let year = dateItem.getFullYear();	//获取年份
    let month = dateItem.getMonth() + 1;	//获取月份js月份从0开始，需要+1
    let day= dateItem.getDate();	//获取日期
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (day >= 0 && day <= 9) {
      day = "0" + day;
    }
    let valueItem= year + '' + month + '' + day;	//组合
    days.push(valueItem);	//添加至数组
  }
  console.log('最近七天日期：',days);

  return days;		
}
```

因为要获取7天的，所以我们要查七张表，我太菜了，只想到了这种Promise.all的方式

```TS
import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import redis from 'lib/redis'
import { getWeekYYYYMMDD } from 'utils'

export default withIronSessionApiRoute(getIp, ironOptions);

async function getIp(req: NextApiRequest, res: NextApiResponse) {
  const weekTimeList = getWeekYYYYMMDD()
  // 获取今日新增动态
  const result = await Promise.all(
    weekTimeList.map(day => {
      return new Promise((rev, rej) => {
        redis.scard('s_view_day:id:' + day).then((dayViewNum) => {
            rev(dayViewNum)
        })
      })
    })
  )
  res?.status(200).json({
    code: 0,
    msg: '获取七日全站阅览量',
    data: {
      result: result.reverse(),
      weekDate: weekTimeList
    }
  });
}
```

把数据和 weekDate 传递给前端，主要是为了让前端的折线图的x轴可以展示日期。就不用前端又进行操作了（前端拿到20220512这样的数据，进行一个slice(4）的操作就可以拿到后面的0512了



同理，我们再来实现另外两个需求

![image-20220512182241398](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512182241398.png)

分别是 文章排行榜 和 作者排行榜

- 文章排行榜：通过文章的点赞量和文章的阅览量来判定这个文章的排行榜，点赞和阅览的权重我用的是 3 7开，因为浏览量会比点赞数量更大一点，容易拉开差距，不然大部分的文章会同名hh（想起了LOL的五五开，狗头）
- 作者排行榜：通过作者发布的文章数量和作者文章阅览量和点赞量来进行划分（这个比较复杂）



下面实现一个简易的排行榜（通过redis自带的一个有序数组来实现）

- 文章排行榜：仅通过点赞数量来进行排名
- 作者排行榜：通过用户发布的文章数量来定



首先：提前了解一下redis的有序数组[Redis 有序集合(sorted set) | 菜鸟教程 (runoob.com)](https://www.runoob.com/redis/redis-sorted-sets.html)

![image-20220512183940647](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512183940647.png)

![image-20220512184236125](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512184236125.png)

value是这个文章的相关信息，并且还有一个score分数，这个score就是这个有序数组 **有序** 的关键。我们可以直接调用一个api来获取到这个有序数组里面每一个字段的score排名



首先，实现文章排行榜。

每次用户点赞文章的时候，我们就要在redis里面给这个文章article的score进行加一

```ts
await redis.zincrby('z_article_like', 1, JSON.stringify(articleData))
```

articleData就是上面图片的article_id和article_title的组合对象，这样保存文章信息是为了我们到时候直接取出来这个value就可以直接展示了



获取排行榜

```TS
import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';

import redis from 'lib/redis'

export default withIronSessionApiRoute(getRank, ironOptions);

// 文章点赞排序（前k名）
async function getRank(req: NextApiRequest, res: NextApiResponse) {
  const { k } = req.body
  const result = await redis.zrange('z_article_like', 0, k, 'WITHSCORES')
  if (result) {
    res?.status(200).json({
      code: 0,
      msg: `获取点赞前${k}成功`,
      data: result
    });
  }
}
```



同理，用户排行榜，实现方式：

在每次用户调用的发布文章接口里面，进行如下操作：

```TS
await redis.zincrby('z_user_hot', 1, user_id)
```

获取用户排行榜数据（前五名）：

```TS
const userHotList = await redis.zrange('z_user_hot', 0, 5, 'WITHSCORES')
```

### 



## 三、next.js使用TypeORM操作数据库记录

### 1、查询

通过redis内容都放在一起然后更快的查询进行正则匹配

### 2、在一个id数组内查询

### 3、模糊匹配

### 4、分页功能



## 四、next.js使用web-vital及其原理和源码分析



## 五、next.js开发的坑

### useState异步问题

自己封装一个（tab切换的时候，item更新不及时）



## 六、next.js使用antd upload组件并实现后端接口

老规矩，我们先看看要开发什么，我们的需求是什么：

![image-20220512192327041](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512192327041.png)

我们要实现添加 文章的头图，也就是下面这个图片的文章头图

![image-20220512192721559](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512192721559.png)

首先实现一下通过ant-design的upload组件来实现图片的上传

我封装了一个uploadImg组件

```TSX
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
```

使用这个组件：

```JSX
<UpLoadImg uploadHeadImg={handleUploadHeadImg} />
```

传递一个函数作为回调函数，接收阿里云oss返回的url



下面就是我们next.js的后端代码： pages/api/common/upload

在阿里云注册OSS服务就不写啦，百度一大堆教程，**下面的代码里面有几个要大家自己填的，分别是注册oss服务之后 1、所在地域 2、accessKeyId 3、accessKeySecret 4、bucket名**

```TS
import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { IncomingForm } from 'formidable'
import OSS from 'ali-oss'
import path from 'path'

const client = new OSS({
  // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: '【阿里云oss服务的所在地域】',
  accessKeyId: '【你的accessKeyId】',
  accessKeySecret: '【你的accessKeySecret】',
  bucket: '【你的bucket】',
});

export const config = {
  api: {
    bodyParser: false,
  }
};

export default withIronSessionApiRoute(upload, ironOptions);

async function upload(req: NextApiRequest, res: NextApiResponse) {
  // parse form with a Promise wrapper
  const data = await new Promise((resolve, reject) => {
    const form = new IncomingForm()
    
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      resolve({ fields, files })
    })
  })
  
  // 为了更好的目录结构，通过/的方式来给阿里云oss存储有一个比较好的目录结构
  const nowDate = new Date()
  const year = nowDate.getFullYear()
  const month = nowDate.getMonth()
  const day = nowDate.getDay()
  const nameFront = year + '/' + month + '/' + day + '/'
  const nameBack =  new Date().getTime() + '_';
    
  const resultUrl = await put(nameFront + nameBack + data.files.file.originalFilename, data?.files?.file?.filepath)
  res?.status(200)?.json({
    code: 0,
    msg: '',
    data: {
      url: resultUrl
    }
  });
}

async function put (fileName, filePath) {
  try {
    // 填写OSS文件完整路径和本地文件的完整路径。OSS文件完整路径中不能包含Bucket名称。
    // 如果本地文件的完整路径中未指定本地路径，则默认从示例程序所属项目对应本地路径中上传文件。
    const result = await client.put(fileName, path.normalize(filePath));
    if (result?.res?.status == 200) {
      return result.url
    }
  } catch (e) {
    console.log(e);
  }
}
```

坑：

1、上面代码的config一定要写。不然读取不到antd upload组件上传的图片文件的

```JS
export const config = {
  api: {
    bodyParser: false,
  }
};
```

2、![image-20220512194616974](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512194616974.png)

```TS
 // 为了更好的目录结构
  const nowDate = new Date()
  const year = nowDate.getFullYear()
  const month = nowDate.getMonth()
  const day = nowDate.getDay()
  const nameFront = year + '/' + month + '/' + day + '/'
  const nameBack =  new Date().getTime() + '_';
```

就是通过拼接年月日的方式来把我们的图片有一个更好的管理





## 七、next.js使用md编辑器发布文章以及md编辑器的图片上传到阿里云oss

老规矩，继续上需求：

要使用md编辑器来发布文章，并且还要实现md编辑器上上传图片 ，以及md格式文章的一个目录展示

Md编辑器的点击上传图片，点击上传本地图片之后就添加到阿里云的oss里面并返回一个线上的可访问图片了

![image-20220512195851469](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512195851469.png)



![image-20220512192957466](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512192957466.png)



![image-20220512195931982](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512195931982.png)

以及文章目录

![image-20220512200147565](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512200147565.png)

其实就是解析md格式里面的## 符号，就是标题了，那么现在开干！



- 首先先引入md编辑器

安装依赖

```js
yarn add md-editor-rt
```

```js
import Editor from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
```



- 使用

```TSX
const NewEditor = () => {
	const [content, setContent] = useState('');

    const handleContentChange = (content: any) => {
      setContent(content);
    };
    
	return (
    	<Editor modelValue={content} onChange={handleContentChange} />
    )
}
```

上面就是一个基本的使用方法

现在我们要实现，点击md编辑器的上传图片到oss里面，然后在输入的地方就自动的添加这个图片上传之后得到的url



Editor组件给我们暴露了一个onUploadImg参数

```TSX
<Editor onUploadImg={handleUploadImg} modelValue={content} onChange={handleContentChange} />
```

因为是支持多图片上传的，所以最终代码如下

```TSX
const NewEditor = () => {
	const [content, setContent] = useState('');

    const handleContentChange = (content: any) => {
      	setContent(content);
    };
    const updateMdContent = (imgContent) => {
        const historyInnerHTMLd = document.getElementById('md-editor-rt-textarea')?.innerHTML
        let mdContent = historyInnerHTMLd
        mdContent += imgContent
        setContent(mdContent)
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
              reader.onload = (readerEvent) => {
                form.append("image", readerEvent.target.result);
                request.post('/api/common/upload', form)
                .then((res) => {
                  if (res?.code === 0 ) {
                    const { url } = res.data
                    rev(`![](${url})`)
                  }
                })
                .catch((error) => rej(error));
              };
            });
          })
        );
        res.map((url) => {
          imgContent += url
        })
        updateMdContent(imgContent)
    }
    
	return (
    	<Editor onUploadImg={handleUploadImg} modelValue={content} onChange={handleContentChange} />
    )
}
```

代码解释：

```TS
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
              reader.onload = (readerEvent) => {
                form.append("image", readerEvent.target.result);
                request.post('/api/common/upload', form)
                .then((res) => {
                  if (res?.code === 0 ) {
                    const { url } = res.data
                    rev(`![](${url})`)
                  }
                })
                .catch((error) => rej(error));
              };
            });
          })
        );
        res.map((url) => {
          imgContent += url
        })
        updateMdContent(imgContent)
    }
```

这个函数：因为md编辑器是支持多文件上传的，但是我们传图片的话只能是一张一张的上传，所以就定义了一个new Promise的方式来异步的进行图片上传

拿到的url，还要拼接![](${url})，因为这样md才可以把这个url识别为一个要展示的图片

之后我们拿到了这些上传图片的链接之后，我们要拼接到md编辑器里面的时候



获取到md以及输入的内容，然后进行拼接就行（其实这里有一个问题就是只能拼接，不能插入，这个我还在解决）

```TSX
 const updateMdContent = (imgContent) => {
        const historyInnerHTMLd = document.getElementById('md-editor-rt-textarea')?.innerHTML
        let mdContent = historyInnerHTMLd
        mdContent += imgContent
        setContent(mdContent)
    }
```

我通过document.getElementById('md-editor-rt-textarea')?.innerHTML 这种方式拿到用户在md输入的内容（我发现直接通过content是拿不到的，因为存在一个异步的问题）所以我就直接通过id的方式拿到了

![image-20220512201428270](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512201428270.png)



效果：这样我们就实现了多张图片的上传了

![image-20220512201516222](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512201516222.png)



**展望：**

- 可以实现图片的中间插入，而不是直接后面拼接
- 实现监测到本地url链接的时候就自动的上传（因为大部分用户都是直接赋值typora等本地md编辑器来发布，会发现又要一张一张图片进行上传，就比较麻烦）







## 八、next.js实现多级评论以及数据库设计



## 九、next.js实现github第三方登录



## 十、next.js 开发接口记录

### 1、请求搜狐接口获取用户IP地址

### 2、分页实现



## 十一、next.js-实现一个乞丐版的SSR框架



## 十二、md格式的文章页面展示（代码高亮等）以及文章目录展示





## 其他

### 1、如何在md里面写jsx