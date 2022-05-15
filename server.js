const { createServer } = require('http');
const next = require('next');
const ws = require('nodejs-websocket')

const wsPort = 3003
const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 4000;

const app = next({ dev, hostname, port });
// const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const server = ws.createServer(connect => {
        console.log('进入ws server')
        connect.on('text', (data) => {
          console.log('说了啥', data)
        })
        connect.on('close', ()=>{
          console.log('ws 退出')
        })
        connect.on('error', ()=> {
          console.log('错误处理')
        })
      })
      server.listen(wsPort, () => {
        console.log('监听了'+wsPort)
      })
    console.log('server', server)
    } catch (err) {
      console.log('error', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`Server is running at：http://${hostname}:${port}`);
  });
});
