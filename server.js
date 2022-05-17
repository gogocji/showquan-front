// const { createServer } = require('http');
// const next = require('next');
// const ws = require('nodejs-websocket')

// const wsPort = 3003
// const dev = process.env.NODE_ENV !== 'production';
// const hostname = 'localhost';
// const port = 4000;

// const app = next({ dev, hostname, port });
// // const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   createServer(async (req, res) => {
//     try {
//       const server = ws.createServer(connect => {
//         console.log('进入ws server')
//         connect.on('text', (data) => {
//           console.log('说了啥', data)
//         })
//         connect.on('close', ()=>{
//           console.log('ws 退出')
//         })
//         connect.on('error', ()=> {
//           console.log('错误处理')
//         })
//       })
//       server.listen(wsPort, () => {
//         console.log('监听了'+wsPort)
//       })
//     console.log('server', server)
//     } catch (err) {
//       console.log('error', req.url, err);
//       res.statusCode = 500;
//       res.end('internal server error');
//     }
//   }).listen(port, (err) => {
//     if (err) throw err;
//     console.log(`Server is running at：http://${hostname}:${port}`);
//   });
// });

// medium的代码
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
  socket.on('clientClose', async (userId) => {
    console.log('用户退出了')
    const result = await redis.srem('s_online_user' , userId)
    console.log('result', result)
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
})
console.log('2322')
nextApp.prepare().then(() => {

  app.get('*', (req, res) => {
    return nextHandler(req, res)
  })
  app.post('*', (req, res) => {
    return nextHandler(req, res)
  })
  console.log('111')

  server.listen(socketPort, err => {
    if (err) throw err
    console.log(`socket io ready on http://localhost:${port}`)
  })
})

// const { createServer } = require('http');
// const { parse } = require('url');
// const next = require('next');

// const dev = process.env.NODE_ENV !== 'production';
// const hostname = 'localhost';
// const port = 4000;

// const app = next({ dev, hostname, port });
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   createServer(async (req, res) => {
//     try {
//       const parsedUrl = parse(req.url, true);
//       const { pathname, query } = parsedUrl;

//       console.log(2222);
//       console.log(pathname);
//       console.log(query);

//       if (pathname === '/tag') {
//         await app.render(req, res, '/user/2', query);
//       } else {
//         await handle(req, res, parsedUrl);
//       }
//     } catch (err) {
//       console.log('error', req.url, err);
//       res.statusCode = 500;
//       res.end('internal server error');
//     }
//   }).listen(port, (err) => {
//     if (err) throw err;
//     console.log(`Server is running at：http://${hostname}:${port}`);
//   });
// });
