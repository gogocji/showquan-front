import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import redis from 'lib/redis'
import { User, Follow } from 'db/entity/index';
import { prepareConnection } from 'db/index';

export default withIronSessionApiRoute(del, ironOptions);

async function del(req: NextApiRequest, res: NextApiResponse) {
  const db = await prepareConnection();
  const followRepo = db.getRepository(Follow);

  const { user_id, byUser_id } = req.body
  console.log(user_id, byUser_id)
  const result = await redis.hdel(`h_user_follow:${byUser_id}`, user_id)
  const follow = await followRepo.findOne({
    where:{
      user: user_id,
      byUser: byUser_id
    },
    relations: ['user']
  })
  console.log('follow', follow)
  const resFollow = await followRepo.remove(follow);
  const fromUserFollow = await followRepo.findOne({
    where:{
      user: byUser_id,
      byUser: user_id
    },
    relations: ['user']
  })
  if (fromUserFollow) {
    fromUserFollow.hasLike = 0
    await followRepo.save(fromUserFollow);
  }
  console.log('取消关注成功', resFollow)
  res?.status(200).json({
    code: 0,
    msg: '取消关注成功'
  });
}
