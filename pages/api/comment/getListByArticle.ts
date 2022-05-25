import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { prepareConnection } from 'db/index';
import { Comment } from 'db/entity/index';
import { IComment } from 'pages/api';

export default withIronSessionApiRoute(get, ironOptions);

const compare = function (obj1: any, obj2: any) {
  var val1 = new Date(obj1.create_time);
  var val2 = new Date(obj2.create_time);
  if (val1 < val2) {
      return -1;
  } 
  else if (val1 > val2) {
      return 1;
  } 
  else {
      return 0;
  }            
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { articleId } = req?.body || {};
  const db = await prepareConnection()
  const comment = await db.getRepository(Comment).find({
    where: {
      article: articleId
    },
    relations: ['user', 'toUser', 'pComment', 'rComment']
  })
  // 改变评论数据结构
  const newCommentList = comment.map((item : any) => {
    return {
      ...item,
      children : [] as IComment[]
    }
  })
  comment.map((item: any) => {
    if (item.rComment !== null) {
      for (let i = 0; i < newCommentList.length; i++) {
        if (newCommentList[i].id === item.rComment?.id) {
          newCommentList[i].children.push(item)
        }
      }
    }
  })
  newCommentList.sort(compare).reverse()
  res?.status(200).json({
    code: 0,
    msg: '',
    data: {
      commentList: newCommentList || [],
    } 
  });
} 
