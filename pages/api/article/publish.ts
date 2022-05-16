import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { ISession } from 'pages/api/index';
import { prepareConnection } from 'db/index';
import { User, Article, Tag } from 'db/entity/index';
import { EXCEPTION_ARTICLE } from 'pages/api/config/codes';
import redis from 'lib/redis'
import { getTimeYYYYMMDD } from 'utils'
import request from 'service/fetch';

export default withIronSessionApiRoute(publish, ironOptions);

async function publish(req: NextApiRequest, res: NextApiResponse) {
  const session: ISession = req.session;
  const { title = '', content = '', tagIds = [], description = '', headImg = '' } = req.body;
  const sexResult = await request.post('http://hn216.api.yesapi.cn/api/App/Common_BannerWord/Check', {
    app_key: '76439D57AFB52CE4B964D1CD94339917',
    content
  })
  if (sexResult.data.err_code !== 0) {
    res.status(200).json({ failContent:  sexResult.data.sensitiveWord, ...EXCEPTION_ARTICLE.CONTENT_FAILED });
  }
  console.log('sexResult', sexResult)
  const db = await prepareConnection();
  const userRepo = db.getRepository(User);
  const articleRepo = db.getRepository(Article);
  const tagRepo = db.getRepository(Tag);

  const user = await userRepo.findOne({
    id: session.userId,
  });

  const tags = await tagRepo.find({
    where: tagIds?.map((tagId: number) => ({ id: tagId })),
  });

  const article = new Article();
  article.title = title;
  article.content = content;
  article.create_time = new Date();
  article.update_time = new Date();
  article.state = 0;
  article.views = 0;
  article.comment_count = 0;
  article.like_count = 0;
  article.description = description;
  article.headImg = headImg;

  if (user) {
    article.user = user;
  }

  // 为了假如redis进行搜索
  var tagListString = ''
  if (tags) {
    const newTags = tags?.map((tag) => {
      tagListString += tag
      tag.article_count = tag?.article_count + 1;
      return tag;
    });
    article.tags = newTags;
  }
  
  const resArticle = await articleRepo.save(article);

  // 把全部需要匹配的内容全部都拼接并存在redis里面
  const itemAllInfo = title + content + description + user?.nickname + tagListString
  await redis.hset('h_article_search', resArticle.id, JSON.stringify(itemAllInfo))
  await redis.zincrby('z_user_hot', 1, user?.id + '')
  // redis添加新用户
  const timestamp = getTimeYYYYMMDD()
  await redis.sadd('s_article_all:id', resArticle.id + ':' + timestamp)
  await redis.sadd('s_article_day:id:' + timestamp, resArticle.id)
  if (resArticle) {
    res.status(200).json({ data: resArticle, code: 0, msg: '发布成功' });
  } else {
    res.status(200).json({ ...EXCEPTION_ARTICLE.PUBLISH_FAILED });
  }
}
