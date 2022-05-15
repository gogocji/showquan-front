# 博客社区-Next.js开发记录

## 一、next.js使用mobx

最近在完成大三的一个课程期末设计，独立完成做了一个博客社区，主要技术栈是：

前端：next.js + mobx + ts + antd;

后台管理系统：vue3.0 + pinia + ts + elementUI

后端：next.js + ts + 阿里云oss存储 + redis

开发的时候遇到了很多坑，后面会通过文章的方式总结自己在开发过程中踩到的坑以及一些小经验。



- 下载依赖（安装两个依赖）

```npm
yarn add mobx mobx-react-lite
```

- 建立store文件夹以及基本的store代码

![image-20220513161747110](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220513161747110.png)

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



**next.js使用redis**

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



## 四、next.js使用web-vital及其原理和各个方法的源码分析

### 4.1、web-vitals的介绍

> web-vital是google发起的一个网站性能标准

官方文档：https://github.com/GoogleChrome/web-vitals

![image-20220510233901553](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220510233901553.png)



**Core Web Vitals**

> Core Web Vitals是Web Vitals的一个子集，适用于所有的网页

主要是关注： **加载速度、可交互性、视觉稳定性**

分别代表：**LCP、FID、CLS**

- LCP（Largest Contentful Paint）：衡量加载性能，主要是为了更好的用户体验，一般LCP在2.5秒以内
- FID（First Input Delay）：主要是衡量可交互性的，FID最好一般在100毫秒以内
- CLS（Cumulative Layout Shift）：衡量视觉稳定性，CLS最好小于0.1（0表示的就是完全稳定，1表示的就是最不稳定）



以上三个就构成了Core Web Vitals的核心指标





### 4.2、web-vital CLS应用&原理&源码分析

#### 应用与统计

0、CLS用来干啥子

> 下面通过一个示例来演示一下，CLS是用来干啥的

<img src="C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220513095912444.png" alt="image-20220513095912444" style="zoom:50%;" />

上面是设计师给我们的UI设计图，作为前端工程师的我们要进行高精度的还原。

搜索框、轮播图、tab切换、瀑布流的商品展示

但是当我们做好的程序，给到测试同学进行测试的时候，他发现：

<img src="C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220513101312060.png" alt="image-20220513101312060" style="zoom:67%;" />



一开始展示了这个页面，过了大概1s才慢慢的展示出了轮播图

**诸位作为优秀的前端工程师**，一下子就定位到了问题，原来后台管理系统上传的图片精度太大了，整个图片的太大了，上传的时候没有在beforeUpload的时候做图片大小的判断并拦截上传。而前端展示的时候由于没有定好tabbar的高度占位置，要等我图片加载好了之后，才会显示整个tabbar轮播图的位置。这个过程中原本轮播图本来被商品列表占领的，但是图片加载好了之后，突然就弹出一个tabbar，**用户看了直摇头，什么LJ界面，吓得我狗皮膏药都掉了**



所以定位到了问题，我们给tabbar轮播图一开始就定义好size用来占位，并限制后台管理系统的图片上传大小。提高整个的用户体验。



在这个问题中，我们发现，如果我们没有给tabbar轮播图提前设置大小占位，而是等到图片加载好了之后才显示，给用户看到的就是一个 **页面布局变化很大，眼镜都吓掉了**，



**回到我们的CLS（Cumulative Layout Shift）叫做累计布局偏移**

官方说法：

> 页面整个生命周期中每次元素产生的非预期布局偏移得分的总和，每次都可以把用户可视的元素在两次渲染帧中的起始地位进行比对，如果不同的话，就会产生LS（Layout Shift）

用户进入小程序/网站，页面布局如果发生了改变（比如一个DOM突然从高度为0变成高度为100，一个DOM从top为0突然下移变成top为100），就叫做布局偏移

- 每一次布局偏移都会根据 这个偏移的大小和情况来打一个分（偏移太多，用户体验太差，分数就搞点，说明你体验很差）
- 这个计分是持续在整个页面的生命周期（各位优秀的前端工程师，肯定知道生命周期hh），当小程序退出、网站退出，或者小程序、网站切到后台的时候就意味着页面生命周期结束了，所以CLS统计的结果一般都是在生命周期结束的时候上报



1、调用的方式

- 使用web 提供的API
- 使用web-vitals这个第三方js库

**每一个Core Web Vitals都可以通过JS提供的Web API来进行测试**

使用 **web-vitals** 这个第三方js库

```js
import {getCLS, getFID, getLCP} from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify(metric);
  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`.
  (navigator.sendBeacon && navigator.sendBeacon('/analytics', body)) ||
      fetch('/analytics', {body, method: 'POST', keepalive: true});
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getLCP(sendToAnalytics);
```



2、返回结果&返回结果时机

今天我们讨论的只要是CLS（Cumulative Layout Shift）累计布局偏移，当getCLS（）函数执行了时候返回结果是这样的：

![image-20220513091952420](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220513091952420.png)

后面的userInfo是我又添加的内容（因为我想查到每个用户对应的性能，后面还会添加获取用户的手机类型、型号等等）



**这个结果返回的时机：**假如是一个web应用的话，是当我们把网页最小化到电脑后台、切换浏览器的tab把网页hidden、这个时候CLS就会返回结果了，如果是小程序等应用的话，就是手机锁屏或者是用户回到了桌面（小程序被切到后台）时触发



**为什么结果是在应用被切到后台的时候触发？**

因为CLS（累计布局偏移），是根据用户在使用该应用的时候（除掉应用被挂在后台的时候），该应用布局的偏移量



#### 原理

**1、浏览器提供的API**

> 肯定不可能从零搭，我们要检测浏览器里面的某个网页的性能，肯定是需要浏览器提供的一些API来监听网页的改变。

比如我们要统计CLS的话，我们人眼可以看到页面布局的变化，但是浏览器怎么监听这个网页的布局变化呢？

好问题！！

浏览器提供了：Layout Instability API [Layout Instability API - Web APIs | MDN (mozilla.org)](https://developer.mozilla.org/en-US/docs/Web/API/Layout_Instability_API)

<img src="C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220513102735900.png" alt="image-20220513102735900" style="zoom:70%;" />

翻译一下就是：

**Layout Instability API**（布局 不稳定性 API）：提供了模板（interface）用来添加和报告Layout shift（布局 偏移）

- 一个布局偏移的发生是在 两帧（two frames）之间在用户可以看到的地方 页面中的某个元素（element）改变了起始位置。（如图）<img src="C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220513103334795.png" alt="image-20220513103334795" style="zoom:80%;" />
- 这些改变了布局的元素就被称为是 不稳定的（unstable）元素，他们会增加CLS的得分，这些得分就表示了 **应用显示稳定性是好还是坏**
- **Layout Instability API**（布局 不稳定性 API）提供了方法去测量和报告这些 **布局偏移**

```JS
new PerformanceObserver((list) => {
  console.log(list.getEntries());
}).observe({type: 'layout-shift', buffered: true});
```

这段代码可以这样理解，我们new了一个女朋友，不是不是，new了一个PerformanceObserver（行为 观察者）：这个观察者厉害了，可以观察网页、用户在浏览器里的行为，包括用户点击事件、输入事件、还有网页布局的偏移。

并且我们通过这个观察者的observer方法可以告诉它，**我要观察浏览器的哪个行为**，哦好，传入了一个option对象

```jsx
{
	type: 'layout-shift',
	buffered: true
}
```

然后这个观察者，每次观察到浏览器的布局偏移（layout shift）的时候就会执行 在new PerformanceObserver的时候传递回调函数了

```ts
(list) => {
  console.log(list.getEntries());
}
```

我们解释一下option对象中的buffered： true的含义

参考：https://web.dev/debug-layout-shifts/ 这篇文章很不错

文章中这样解释：

![image-20220513105020790](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220513105020790.png)

就是初始化一个buffer缓冲区，用来保存每一次layout shift的信息（比如布局偏移的是哪个元素，偏移的情况是怎么样的，是上下移动还是左右移动，还是大小变化），其实就是用来规划一个buffer区来保存我们记录的“埋点”（entry）

就是一开始就查一下有没有初始化，如果没有的话就初始化一下，避免没东西记录存储我们的埋点数据

entry 其实可以被翻译为：条目、登记（**我觉得**）



这个Layout instability api返回的信息是这样的，下面就是一些报告的内容（entry）

下面对象中每一个字段的意思可以看这个教程[LayoutShift - 根据页面上元素的移动来监测网页的稳定性 - 蜜蜂教程 (mifengjc.com)](https://www.mifengjc.com/api/LayoutShift.html)

```JSX
duration: 0
entryType: "layout-shift"
hadRecentInput: false
lastInputTime: 0
name: ""
sources: (3) [LayoutShiftAttribution, LayoutShiftAttribution, LayoutShiftAttribution]
startTime: 11317.934999999125
value: 0.17508567530168798
```

LayoutShiftAttribution表示的是 每一次布局偏移的更详细的信息，比如

````JSON
// ...
  "sources": [
    {
      "node": "div#banner",
      "previousRect": {
        "x": 311,
        "y": 76,
        "width": 4,
        "height": 18,
        "top": 76,
        "right": 315,
        "bottom": 94,
        "left": 311
      },
      "currentRect": {
        "x": 311,
        "y": 246,
        "width": 4,
        "height": 18,
        "top": 246,
        "right": 315,
        "bottom": 264,
        "left": 311
      }
    }
  ]
````

表达的意思就是，一个 <div id='banner'> 一开始的大小、位置信息，可以看到previous和current变化的就是top属性的value，从76变成了246，所以就可以知道这一次的偏移是一个DOM元素从上往下偏移了



**有了浏览器的API支持，我们就可以监听布局偏移，并且获取布局偏移的相关信息了**



**计分原理**

```JSX
duration: 0
entryType: "layout-shift"
hadRecentInput: false
lastInputTime: 0
name: ""
sources: (3) [LayoutShiftAttribution, LayoutShiftAttribution, LayoutShiftAttribution]
startTime: 11317.934999999125
value: 0.17508567530168798
```

我们可以看到Layout Shift返回了一个value值，那么这个value值是怎么计算出来的呢？因为这个value值越接近1就表示布局偏移越来越大，用户体验越来越差，value=0表示没有布局偏移，也就是用户体验最好。



**LS的得分算法**（计算的细节可以参考这篇大佬翻译的文章，里面有几个demo图片很好的解释了计算得分的方法：[关于前端:前端性能指标Cumulative-Layout-Shift - 乐趣区 (lequ7.com)](https://lequ7.com/guan-yu-qian-duan-qian-duan-xing-neng-zhi-biao-cumulativelayoutshift.html)）

- 得分：**影响小数与 间隔小数的乘积**
- 影响小数：不稳固元素在之前渲染帧中的可视区域 和 以后帧可视区域的并集。这个并集占整个页面的百分比，影响小数就是这个百分比变成小数的值
- 间隔小数：不稳固元素在渲染帧中挪动的最大间隔（可能是横向可能是竖向）谁大就取谁，也是取这个挪动间隔距离占 宽/高的百分比，并转换成小数



有了上面的了解之后，我们来分析一下web-vital的获取CLS性能的getCLS方法就很清晰了

源码链接：https://github.com/GoogleChrome/web-vitals/blob/main/src/getCLS.ts



#### 源码分析

**1、LayoutShift与session**

分区原理、计分原理

- 源码中，我们给observe第一个参数是'layout-shift'就是让PerformanceObserver这个行为观察者 **观察LayoutShift布局偏移**，并且传递了一个entryHandler的回调函数，也就是说，每一次监测到布局偏移了，就会把记录下来的这个布局便宜entry传递给entryHandler这个回调函数进行处理

```TS
const po = observe('layout-shift', entryHandler as PerformanceEntryHandler);
```

- 检测到布局偏移执行的回调函数entryHandler:

```TS
  let sessionValue = 0;

  let sessionEntries: PerformanceEntry[] = [];

  // layout shift每次变化的时候，都会把这个登记（entry）传递给这个回调函数
  const entryHandler = (entry: LayoutShift) => {
    // 500ms内如果用户输入的内容就不准了
    // 通过session分区处理
    if (!entry.hadRecentInput) {
      const firstSessionEntry = sessionEntries[0];
      const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

      if (sessionValue &&
          entry.startTime - lastSessionEntry.startTime < 1000 &&
          entry.startTime - firstSessionEntry.startTime < 5000) {
        sessionValue += entry.value;
        sessionEntries.push(entry);
      } else {
        sessionValue = entry.value;
        sessionEntries = [entry];
      }
        
      // 策略:取最大值,所以每次面对一个新的session都要比对并更新metric的值
      if (sessionValue > metric.value) {
        metric.value = sessionValue;
        // 这个其实就是一个attribution的感觉
        metric.entries = sessionEntries;
        // 
        report();
      }
    }
  };
```

看到这个代码可能会有点懵逼，先看一下下面这篇大佬的文章就很清晰了（[(34条消息) 前端监控 SDK 的一些技术要点原理分析_仙凌阁的博客-CSDN博客](https://blog.csdn.net/qq_39221436/article/details/120729116)）

<img src="C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220513113928494.png" alt="image-20220513113928494" style="zoom:67%;" />

要看懂session分区的一个概念。也就是把多个layout shift都划为同一个session会话来进行统计（是否会被划分为同一个session会话区就是通过 这个layout shift发生的时间来进行判断的）

摘录文章中大佬的话：

> 一个或多个快速连续发生的单次布局偏移，每次偏移相隔的时间少于 1 秒，且整个窗口的最大持续时长为 5 秒。

就是一个session窗口可以有多个layout shift发生后回调的entry信息，但是要满足当前这个layout shift发生的时机和上一个layout shift发生的时机小于一秒，并且 每个session的时间跨度只有五秒，如果当前这个layout shift发生的时机和上一个LS发生的时机小于一秒了，但是当前session已经超过5秒了，那么当前这个LS就会被划分到下一个新的session中。



正是通过下面这段代码来进行了时间判断 分session会话区的：

```TS
	  const firstSessionEntry = sessionEntries[0];
      const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

      if (sessionValue &&
          entry.startTime - lastSessionEntry.startTime < 1000 &&
          entry.startTime - firstSessionEntry.startTime < 5000) {
        sessionValue += entry.value;
        sessionEntries.push(entry);
      } else {
        sessionValue = entry.value;
        sessionEntries = [entry];
      }
```

- firstSessionEntry就是用来判断当前这个session的时间跨度是否大于5s了

- lastSessionEntry就是用来判断距离上一个LS的时间跨度是否小于1s
- sessionEntries就是一个用来存储一个session会话中发生的所有Layout Shift后记录的entry

那么首先第一个问题是，为什么要定义这个session，为什么会有1s和5s这个概念呢？

**（这个会话窗口的特点是chrome团队经过实验和研究得到的特征结果）**



那么又带来了一个问题，用户在进入应用的一个生命周期内，肯定会存在多个session会话，每个session会话会有一个评分，但是最后getCLS函数只会给我们呢返回以value，这个value又是怎么样计算出来的呢？

还是这篇大佬的文章点明了原理[(34条消息) 前端监控 SDK 的一些技术要点原理分析_仙凌阁的博客-CSDN博客](https://blog.csdn.net/qq_39221436/article/details/120729116)

![image-20220513114947057](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220513114947057.png)

目前统计所有session中最大的value是最能反应用户那边CLS性能的。因为大部分的CLS 布局偏移都是发生在了应用加载的时候，在用户后面使用的时候其实整体的布局偏移并不多。所以每次回调entryHandler的时候都把拿到的session的value值计算出来只会进行大小比较，每次都更新metric中的value



**2、onHidden**

```TS
const po = observe('layout-shift', entryHandler as PerformanceEntryHandler);
onHidden(() => {
      // takeRecords() 方法返回当前存储在性能观察器中的 性能条目  列表
      po.takeRecords().map(entryHandler as PerformanceEntryHandler);
      // 如果页面hidden了,那么就没有监控的必要了,获取之前已经获取到的监控数据然后立即返回结果
      // 不然监控可能会一直存在用页面中
      // 经过尝试可以看到,只有页面关闭了才会上报CLS和LCP的数据,因为在用户进入应用的时候我们并不知道应该什么时候进行触发CLS的回调,
      // 因为用户的一些操作都可能导致页面的相关DOM的重新渲染
      report(true);
    });
```

然后我们还可以看到这段代码。

首先看看在onHidden中我们做了什么？

```TS
export const onHidden = (cb: OnHiddenCallback, once?: boolean) => {
  const onHiddenOrPageHide = (event: Event) => {
    if (event.type === 'pagehide' || document.visibilityState === 'hidden') {
      cb(event);
      // 只触发一次,所以第一次就把监听器取消掉
      if (once) {
        removeEventListener('visibilitychange', onHiddenOrPageHide, true);
        removeEventListener('pagehide', onHiddenOrPageHide, true);
      }
    }
  }
  addEventListener('visibilitychange', onHiddenOrPageHide, true);
  // Some browsers have buggy implementations of visibilitychange,
  // so we use pagehide in addition, just to be safe.
  addEventListener('pagehide', onHiddenOrPageHide, true);
};
```



**visibilitychange**

这个其实就是我们类似于 tab切换、应用切到手机后台、手机锁屏的时候，我们的document就会显示为一种hidden的状态。

不同的浏览器又pagehide和visibilitychange两种监听方式，所以我们都做监听，这样就可以每次用户把网页/app切到后台的时候触发cb(event)

可以看到这个cb就是我们给onHidden传入的回调函数

```TS
	  po.takeRecords().map(entryHandler as PerformanceEntryHandler);
      report(true);
```

执行回调函数 通过po.takeRecord方式，就可以从：

```ts
new PerformanceObserver((list) => {
  console.log(list.getEntries());
}).observe({type: 'layout-shift', buffered: true});
```

我们在PerformanceObserver里面定义的buffer区，里面存储了entry记录，takeRecords就是把所有的entry记录都拿出来，然后执行entryHandler函数，只会我们report(true)的意思

可以看看源码:

```TS
const bindReporter = (
  callback: ReportHandler,
  metric: Metric,
  reportAllChanges?: boolean,
) => {
  // 相当于是一个闭包，可以一直访问这个prevValue的值（这个值初始化是undefined）
  let prevValue: number;
  return (forceReport?: boolean) => {
    if (metric.value >= 0) {
      if (forceReport || reportAllChanges) {
        // 最后用到的时间
        metric.delta = metric.value - (prevValue || 0);

        // Report the metric if there's a non-zero delta or if no previous
        // value exists (which can happen in the case of the document becoming
        // hidden when the metric value is 0).
        // See: https://github.com/GoogleChrome/web-vitals/issues/14
        if (metric.delta || prevValue === undefined) {
          prevValue = metric.value;
          callback(metric);
        }
      }
    }
  }
}

report = bindReporter(onReportWrapped, metric, reportAllChanges);

```

这个bindReporter会返回一个函数，这个函数接收一个 **forceReport** 参数，如果我们传递forceReport = true的话，那么就立即执行函数，返回刚刚

```ts
po.takeRecords().map(entryHandler as PerformanceEntryHandler);
```

记录的metric给用户那边，也就是返回getCLS的结果了

**所以这就是，用户把页面切到后台的时候，CLS返回结果的原因了**



**4、onBFCacheRestore**

还有一个源码比较难理解：

```TS
// 如果是BFC返回的话就要重新进行计算了
    onBFCacheRestore(() => {
      sessionValue = 0;
      fcpValue = -1;
      metric = initMetric('CLS', 0);
      // bindReporter指的是绑定 
      // 但是似乎没有添加bfc:true的标记,那么这个数据不会影响吗?
      report = bindReporter(onReportWrapped, metric, reportAllChanges);
    });
```

首先要理解一下，**什么叫做BFC**

BFC（back forward cache）：浏览器往返缓存

> 就是用户使用浏览器进行 前进 后退 的时候，页面的转换速度很快，因为做了页面的缓存，这个缓存不仅保存了页面数据，还保存了DOM和JS的状态，实际上是将整个页面都保存在了内存各种。通过BFC返回的页面，不会触发onload事件，但是会执行pageShow事件（onload是页面第一次加载的时候触发的，pageshow是每次加载页面都会触发）

正是因为BFC不会执行onload的方法，而我们都是在页面onload的时候挂载web-vital的监听函数，但是如果页面是BFC缓存下来的，下次进入这个页面的时候就不会执行onload，那么就不会挂载web-vital监听函数，就监听不了。



**所以为此，我们要为BFC的页面做一个额外的操作**

来看看onBFCacheRestore函数内部都做了什么：

```TS
export const onBFCacheRestore = (cb: onBFCacheRestoreCallback) => {
  addEventListener('pageshow', (event) => {
    // 这个persisted字段表示的意思是这个页面是从bfc返回的
    if (event.persisted) {
      cb(event);
    }
  }, true);
};
```

我们监听pageshow，如果发现这个页面是bfc返回的，就执行cb回调（也就是我们的web-vital监听函数）——  初始化相关内容、开启report监听回调。



#### 小建议——减低CLS得分的方法

- 给image、video提前预设好占位空间，不要等这些大文件请求加载好了再进行渲染
- 不要随意的已有的内容上，通过document访问的方式给已有内容插入内容
- 把触发布局变化的属性（width、height盒子大小。right left top等定位位置）改成transform或者translate的方式





## 五、next.js开发的坑

### useState异步问题

自己封装一个（tab切换的时候，item更新不及时）

深拷贝



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

![image-20220512204923938](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512204923938.png)



老规矩子，上需求，下面是我做的博客以及实现的评论功能：

![image-20220512204257219](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512204257219.png)



![image-20220512204935008](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512204935008.png)

可以发布评论。也可以在其他人评论下进行评论，**并且可以显示对谁的哪条评论进行评论**

先上数据库设计：

```TS
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Article } from './article'
import { User } from './user'

@Entity({name: 'comments'})
export class Comment extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Column()
  content!: string;

  @Column()
  create_time!: Date;

  @Column()
  update_time!: Date;

  @ManyToOne(() => User)
  @JoinColumn({name: 'user_id'})
  user!: User;

  @ManyToOne(() => Article)
  @JoinColumn({name: 'article_id'})
  article!: Article;

  @ManyToOne(() => User)
  @JoinColumn({name: 'toUser_id'})
  toUser!: User;

  @ManyToOne(() => Comment)
  @JoinColumn({name: 'pid'})
  pComment!: Comment;

  @ManyToOne(() => Comment)
  @JoinColumn({name: 'rid'})
  rComment!: Comment;

  @Column()
  is_delete!: number;

  @Column()
  like_count!: number;
}
```

可以看到，我定义了一个pComment和一个rComment

- pComment表示的是这个子评论是对哪个评论进行评论的
- rComment表示的是最终的根评论是哪个



**所有是有两个点击发送评论的按钮**

![image-20220512205017228](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220512205017228.png)

首先，我们处理一下第一个点击发表评论

```TS
 request
    .post('/api/comment/publish', {
      articleId: article?.id,
      content: inputVal,
      toUser_id: '',
      pid: '',
      rid: ''
    })
```

因为是发布的是一个根评论，所以就不需要toUser_id（表示这个子评论是回复哪个评论的），pid和rid

之后我们对第二个提交按钮进行处理：

```ts
 const findCommentRoot = (comment : any) => {
    if(comment?.rComment !== null) {
      comment = comment?.rComment
    }
    return comment.id
  }	
const handleSubmitComment = () => {
	// 找到最终的父评论
	const rid = findCommentRoot(comment)
    request
    .post('/api/comment/publish', {
      articleId: article?.id,
      content: inputComment,
      toUser_id: comment?.user?.id,
      pid: comment.id,
      rid: rid
    })
}
```

不需要递归的招rComment，只需要判断一次就可以拿到rComment了



组件：直接使用antd提供的Comment组件，是默认支持二级评论样式的（但是似乎就不支持三级或更多级的评论了）



## 九、next.js实现github第三方登录



## 十、next.js 开发接口记录

### 1、请求搜狐接口获取用户IP地址

直接在前端请求会有cors跨域问题

返回的是一个给var变量赋值的表达式



### 2、分页实现

sql语句



## 十一、next.js-实现一个乞丐版的SSR框架



## 十二、md格式的文章页面展示（代码高亮等）以及文章目录展示



## 十三、next.js部署到阿里云服务器上

MySQL is not running, but lock file (/var/lock/subsys/mysql[FAILED]



宝塔面板如果登录只会还是跳转到登录页面的话，烤鱼尝试通过输入bt，然后输入15

![image-20220514111856294](C:\Users\gogocj\AppData\Roaming\Typora\typora-user-images\image-20220514111856294.png)

清除一下垃圾就行



mysql连接不了的话：https://blog.csdn.net/qq_40898875/article/details/113174200 进去配置一下mysql的config配置文件





## 十四、后端给前端推送公告功能

websocket或者用SSE

但是websocket还可以统计当前的在线人数，我也想实现这个功能

next.js的生态好像还不是很好，但是nest.js是由一个比较好的生态了，所以我们可以使用nest.js来接收后台管理系统的消息推送，然后再把信息推送到前端





## 其他

### 1、如何在md里面写jsx