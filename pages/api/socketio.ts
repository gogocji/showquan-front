import { NextApiRequest, NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';
import { ironOptions } from 'config/index';
import { Server } from 'socket.io'
import { AnyRecord } from 'dns';

export default withIronSessionApiRoute(get, ironOptions);
export const config = {
  api: {
    bodyParser: false
  }
}

async function get(req: NextApiRequest, res: any) {
  if (!res.socket.server.io) {
    console.log('*First use, starting socket.io')

    const io = new Server(res.socket.server)

    io.on('connection', socket => {
      socket.broadcast.emit('a user connected')
      socket.on('hello', msg => {
        socket.emit('hello', 'world!')
      })
      socket.on('bye', msg => {
        socket.emit('hello', '下线!')
      })
    })

    

    res.socket.server.io = io
  } else {
    console.log('socket.io already running')
  }
  res.end()
}
