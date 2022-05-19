import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import redis from 'lib/redis'
import { User, Follow } from 'db/entity/index';
import { prepareConnection } from 'db/index';

export default withIronSessionApiRoute(publish, ironOptions);

async function publish(req: NextApiRequest, res: NextApiResponse) {
  const db = await prepareConnection();
  const followRepo = db.getRepository(Follow);
  const { user, byUser_id } = req.body
  const result = await redis.hset(`h_user_follow:${byUser_id}`, user?.id, JSON.stringify(user))
  const userResult = await db.getRepository(User).findOne({
    id: user.id,
  });
  const byUserResult = await db.getRepository(User).findOne({
    id: byUser_id
  });
  if (userResult && byUserResult) {
    const follow = new Follow()
    const hasLikeObj = await followRepo.findOne({
      where:{
        user: byUser_id,
        byUser: user?.id
      },
      relations: ['user']
    })
    follow.hasLike = 0
    if (hasLikeObj) {
      follow.hasLike = 1
      hasLikeObj.hasLike = 1
      await db.getRepository(Follow).save(hasLikeObj);
    }
    follow.user = userResult
    follow.byUser = byUserResult
    follow.create_time = new Date()
    follow.update_time = new Date()
    const resFollow = await db.getRepository(Follow).save(follow);
    console.log('resFollow', resFollow)

    // 给set结构添加follow这个type
    await redis.sadd('s_user_messageType:' + user?.id, 'follow')
    // 给list结构添加comment.id
    await redis.lpush('l_user_followMessage:' + user?.id, resFollow.id)
    
    res?.status(200).json({
      code: 0,
      msg: '关注成功',
      data: resFollow
    });
  }
}
