import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Article } from 'db/entity/index';
import redis from 'lib/redis'
import { EXCEPTION_ARTICLE } from 'pages/api/config/codes';

export default withIronSessionApiRoute(get, ironOptions);

async function get(req: NextApiRequest, res: NextApiResponse) {
  const db = await prepareConnection()
  const articleRepo = db.getRepository(Article);
  const { searchKey } = req?.query || {};
  const result = await redis.hgetall('h_article_search')
  let regexpList = []
  for (let item in result) {
    var re;
    try {
      re = new RegExp(searchKey as string, 'i')
    } catch (err) {
      res.status(200).json({ ...EXCEPTION_ARTICLE.SEATCH_FAILED });
    }
    if (re?.test(result[item].toLowerCase())) {
      regexpList.push(item)
    }
  }
  let articleList = [] as any
  if (regexpList.length) {
    articleList = await articleRepo.createQueryBuilder("article")
    .where(
      "article.id IN (" + regexpList + ")"
    )
    .getMany()
  }
  
  res?.status(200).json({
    code: 0,
    msg: '',
    data: {
      articles: articleList,
      count: articleList.length
    },
  });
}
