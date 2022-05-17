// 参考medium的代码
const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server, {cors:true})
const next = require('next')
const Redis = require('ioredis')
const redis = new Redis(6379)

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const nextApp = next({ dev, hostname, port })
const nextHandler = nextApp.getRequestHandler()

let socketPort = 3000

io.on('connect', socket => {
  console.log('socket.id', socket.id)
  socket.on('clientClose', async (userId) => {
    console.log('用户退出了')
    await redis.srem('s_online_user' , userId)
  })
  socket.on('clientOnline', async (userId) => {
    console.log('用户上线了')
    if (userId) {
      await redis.sadd('s_online_user' , userId)
    }
  })
  socket.on('notification', data => {
    socket.broadcast.emit('notification', {
      message: data
    })
  })
  socket.on('disconnect', async (data) => {
    console.log('用户关闭了', socket.id)
    const userId = await redis.hget('user_socketUserId', socket.id)
    await redis.srem('s_online_user' , userId)
  })
  socket.on('clientConnect', async (userId) => {
    console.log('222', userId)
    // 存在redis的 key value数据结构中
    await redis.hset('user_socketId', userId, socket.id)
    await redis.hset('user_socketUserId', socket.id, userId)
  })
  socket.on('message', async (message) => {
    const { userId, content, fromUserId } = message
    console.log('message', message)
    // 获取这个用户在redis中的socketId
    const socketId = await redis.hget('user_socketId', userId)
    console.log('socketId', socketId)
    // 判断这个socketId是否正在连接
    if (io.sockets.sockets.get(socketId) != undefined) {
      // 正在连接，给用户发这个信息
      console.log('该用户连接中')
      io.sockets.connected[socketId].emit('message', content);
    } else {
      console.log('该用户离线中')
      // 离线状态，把这个信息写入到redis的hashMap里面
      // TODO 这个content后面可以放fromUser的详细信息和内容的信息信息用JSON.stringify就行
      await redis.hset('h_user_message:' + userId, new Date().getTime() + ':' + fromUserId, content)
    }
  })
})

nextApp.prepare().then(() => {

  app.get('*', (req, res) => {
    return nextHandler(req, res)
  })
  app.post('*', (req, res) => {
    return nextHandler(req, res)
  })

  server.listen(socketPort, err => {
    if (err) throw err
    console.log(`socket io ready on http://localhost:${port}`)
  })
})
