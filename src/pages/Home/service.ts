// import request from 'umi-request';
import request from '@/utils/request';
// import * as socketIO from 'sockjs-client';
import {wsHost} from '@/../config/proxy.ts'


let socket:string | WebSocket = '';

export async function getAllArea(){                 // 获取避让缓冲区坐标
  return request('/wcs/systemController/getAllArea');
}

export async function getAllAgvStatus(params: any) {
  return request('/wcs/deviceMonitor/getAllAgvStatus');
}

export async function getAllAgvList(params: any) {
  return request('/wcs/deviceMonitor/getAllAgvList');
}

export async function getAllAbnormalList(params: any) {
  return request('/wcs/deviceMonitor/getAllAbnormalList');
}

export async function getAgvByAgvId(params: any) {
  return request('/wcs/deviceManage/getAgvByAgvId' + (params ? '?agvId=' + params : ''));
}

export async function createWebsocket(action: any, port: string, path: string, uniqueKey?: string) {
  // if (socket === '') {
      try {
        // let wsUrl = "ws://localhost:" + wsPort + '/' + path + (uniqueKey?'/'+uniqueKey+'':'')
        let wsUrl = "ws://" + wsHost + '/' + path + (uniqueKey?'/'+uniqueKey+'':'')

        // let wsUrl = "ws:192.168.5.239:9999/exception"
        // let wsUrl = "ws:" + wsHost+ '/' + path + (uniqueKey?'/'+uniqueKey+'':'')
        // let activePort=path==='exception'?'9997':'9998';
        // let wsUrl = "ws:" + '127.0.0.1:'+activePort+ '/' + path + (uniqueKey?'/'+uniqueKey+'':'')
        // let wsUrl = "ws:192.168.5.112:9999"+ '/' + path + '/' + (uniqueKey?''+uniqueKey+'':'')
          socket = new WebSocket(wsUrl);
          // socket = new WebSocket("ws:192.168.5.140:9999/exception/"+type);
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
    socket.onclose = msg => {
      console.log('ws 连接关闭了', msg);
      action({
        state: 'success',
        cb: 'close',
        payload: msg
      });
      setTimeout(() => {           //断线重连
        createWebsocket(action, port, path, uniqueKey ? new Date().getTime() + "" : "")
      }, 5000)
    }
  }
}
