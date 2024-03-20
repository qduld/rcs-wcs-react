/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import request , { extend } from 'umi-request';
import { notification } from 'antd';
import { isAntDesignProOrDev } from './utils'; 

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};

/**
 * 异常处理程序
 */
const errorHandler = (error: { response: Response }): Response => {
  const { response } = error;
  if (response && response.status) {
    const errorText = codeMessage[response.status] || response.statusText;
    const { status, url } = response;

    notification.error({
      message: `请求错误 ${status}: ${url}`,
      description: errorText,
    });
  } else if (!response) {
    notification.error({
      description: '您的网络发生异常，无法连接服务器',
      message: '网络异常',
    });
  }
  return response;
};

/**
 * 配置request请求时的默认参数
 */
const extRequest = extend({
  errorHandler, // 默认错误处理
  // credentials: 'include', // 默认请求是否带上cookie
});

extRequest.interceptors.request.use(
  (url, options:any) => {
      let devFlag = isAntDesignProOrDev();
      let hostIp = window.location.hostname;
      let rcsIp = hostIp;
      let wcsIp = hostIp;
      let lesIp = hostIp;
      //Rcs 没有设置返回请求头暂时不支持
      // config.headers.common["Cache-Control"] = "no-cache,no-store,must-revalidate" 
      if(options.data&&options.data.id){
        options.data.id=options.data.id-0
        console.log('intercepteroptions',options.data)
      }
      if(!devFlag){
          if(url.indexOf('/v1')!=-1){
              if(url.indexOf('arena')!=-1){
                  url = 'http://'+rcsIp+':8080'+ url
              }
              if(url.indexOf('dispatcher')!=-1){
                  url = 'http://'+rcsIp+':8081'+ url
              }
              options.headers["Access-Control-Allow-Origin"] = "*"
              options.headers["Content-Type"] = "application/x-www-form-urlencoded"
          }else{
              options.useCache = false;
              options.headers["Cache-Control"]="no-cache,no-store,must-revalidate";

              options.headers["Access-Control-Allow-Origin"] = "*"
              // options.headers["Content-Type"] = "application/x-www-form-urlencoded"
              if(url.indexOf('agv/task')!=-1){
                  url = 'http://'+wcsIp+':9999'+ url
              }
              if(url.indexOf('api')!=-1){
                  url = 'http://'+wcsIp+':9999'+ url
              }
              if(url.indexOf('lcs')!=-1){
                  url = 'http://'+wcsIp+':9999'+ url
              }
              if(url.indexOf('les')!=-1){
                  url = 'http://'+lesIp+':9999'+ url
              }
              if(url.indexOf('wcs')!=-1){
                url = 'http://'+wcsIp+':9999'+ url
              }
          }
      }
      
      return {
        url: `${url}`,
        options: { ...options }
      };
  },
  { global: true }
);


// extRequest.use(async (ctx, next) => {
//   await next();

//   const { res } = ctx;
//   const { success = false } = res; // 假设返回结果为 : { success: false, errorCode: 'B001' }
//   if (!success) {
//     // 对异常情况做对应处理
//   }
// });

extRequest.interceptors.response.use(response => {
  
  return response;
});

export default extRequest;
