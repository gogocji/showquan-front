import { useEffect } from 'react'
import io from 'socket.io-client'
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
var socket : any

const test = () => {
  const { push } = useRouter(); 
  useEffect(() => {
    fetch('/api/socketio').finally(() => {
      socket = io()

      socket.on('connect', () => {
        console.log('connect')
        socket.emit('hello')
      })

      socket.on('hello', data => {
        console.log('hello', data)
      })

      socket.on('a user connected', () => {
        console.log('a user connected')
      })

      socket.on('disconnect', () => {
        console.log('disconnect')
      })
    })
  }, []) // Added [] as useEffect filter so it will be executed only once, when component is mounted
  const toHome = () => {
    socket.emit('bye')

    push('/')

  }
  return(
    <div>
    <h1 onClick={toHome}>Socket.io</h1>
    <h1 onClick={toHome}>Socket.io</h1>
    <h1 onClick={toHome}>Socket.io</h1>
    <h1 onClick={toHome}>Socket.io</h1>
    <h1 onClick={toHome}>Socket.io</h1>
    <h1 onClick={toHome}>Socket.io</h1>
    <h1 onClick={toHome}>Socket.io</h1>
    <h1 onClick={toHome}>Socket.io</h1>
    <h1 onClick={toHome}>Socket.io</h1>
    <h1 onClick={toHome}>Socket.io</h1>
    <h1 onClick={toHome}>Socket.io</h1>
    <h1 onClick={toHome}>Socket.io</h1>

    </div>
  )
}


export default observer(test)