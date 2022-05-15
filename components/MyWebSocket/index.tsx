// import { useEffect, useRef } from 'react';
// import styles from './index.module.scss';
// import io from 'socket.io-client'
// import { SocketSetver } from 'utils/socket'

const MyWebSocket = () => {
  // const ws = useRef(null) as any

  // useEffect(() => {
    // ws.current = new WebSocket("ws://localhost:3002/")
    // ws.current.onopen = () => console.log("ws opened");
    // ws.current.onclose = () => console.log("ws closed");
    // ws.current.onmessage = e => {
    //   console.log('eeeeee', e)
    // }
    // ws.current.addEventListener('tmp', data => {
    //   console.log('ws data', data)
    // })
    // return () => {
    //     ws.current.close();
    // };


    // SocketSetver.on('connect', () => {
    //   console.log('Connected');

    //   SocketSetver.emit('events', { test: 'test' });
    // });
    // SocketSetver.on('events', (data) => {
    //   console.log('event', data);
    // });
    // SocketSetver.on('exception', (data) => {
    //   try {
    //     console.log('exception', JSON.parse(data));
    //   } catch (error) {
    //     console.log('exception', error);
    //   }
    // });
    // SocketSetver.on('disconnect', () => {
    //   console.log('Disconnected');
    // });
    // return () => {
    //   console.log('卸载了');
    // };
  // })
  return (
    <></>
  )
};

export default MyWebSocket;
