// import request from 'umi-request';
import request from '@/utils/request';
import { wsHost } from '@/../config/proxy.ts'

let host = window.location.hostname;
let socket: string | WebSocket = '';

export async function getAgvPathList(params: any) {            //开始模拟
  return request('/wcs/deviceMonitor/getAgvPathList' + (params ? '?agvId=' + params : ''))
}

export async function getSupplementaryDeviceStatus() {            //
  return request('/wcs/deviceMonitor/getSupplementaryDeviceStatus');
}


export async function createWebsocket(action: any, port: string, path: string, uniqueKey?: string) {
  // if (socket === '') {
  try {
    let wsUrl = "ws:" + wsHost + '/' + path + (uniqueKey ? '/' + uniqueKey + '' : '')
    socket = new WebSocket(wsUrl);
  } catch (err) {
    action({
      state: 'fail',
      cb: 'close',
      payload: err
    });
  }
  // }
  if (socket instanceof WebSocket) {
    socket.onopen = msg => {
      console.log('连接上 ws 服务端了', msg);
      action({
        state: 'success',
        cb: 'open',
        payload: msg
      });
    }
    socket.onmessage = msg => {
      console.log('接收服务端发过来的消息: %o', msg);
      action({
        state: 'success',
        cb: 'message',
        payload: msg
      });
    }
    socket.onclose = (msg) => {
      action({
        state: 'success',
        cb: 'close',
        payload: msg
      });
      setTimeout(() => {           //断线重连
        createWebsocket(action, port, path, uniqueKey)
      }, 5000)
    }
  }
}