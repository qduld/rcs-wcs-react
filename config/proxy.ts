/**
 * 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 */
const rcsPortName = '8080';
const wcsPortName = '9999';
const wsPortName = wcsPortName;

// const globalHostName = '127.0.0.1'; // local
// const globalHostName = '192.168.5.241'; //丽
// const globalHostName='192.168.5.130'; // 苗
// const globalHostName='192.168.5.143'; // 飞
const globalHostName = '192.168.5.142'; //庄俊强


// const wcsHostName = 'http://127.0.0.1:9777/wiss'; // local
// const rcsHostName = 'http://localhost:'+rcsPortName; //rcs local
// const wcsHostName = 'http://127.0.0.1:8000'; // local fiddler

const rcsHostName = 'http://' + globalHostName + ':' + rcsPortName;
const wcsHostName = 'http://' + globalHostName + ':' + wcsPortName;
// const wcsHostName = 'http://192.168.5.130:9000'; // 苗2

const wsHost = globalHostName + ':' + wsPortName;
// const wsHost='127.0.0.1:9777'

export { wsHost };
export default {
  dev: {
    '/api/': {
      target: 'https://preview.pro.ant.design',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
    '/v1/arena': {
      target: rcsHostName + '/v1/arena',
      changeOrigin: true,
      pathRewrite: {
        '^/v1/arena': '',
      },
    },
    '/wcs/systemController': {
      target: wcsHostName + '/wcs/systemController',
      changeOrigin: true,
      pathRewrite: {
        '^/wcs/systemController': '',
      },
    },
    '/wcs/deviceManage': {
      target: wcsHostName + '/wcs/deviceManage',
      changeOrigin: true,
      pathRewrite: {
        '^/wcs/deviceManage': '',
      },
    },
    '/wcs/deviceMonitor': {
      target: wcsHostName + '/wcs/deviceMonitor',
      changeOrigin: true,
      pathRewrite: {
        '^/wcs/deviceMonitor': '',
      },
    },
    '/wcs/userManage': {
      target: wcsHostName + '/wcs/userManage',
      changeOrigin: true,
      pathRewrite: {
        '^/wcs/userManage': '',
      },
    },
    '/auth/accredit': {
      target: wcsHostName + '/auth/accredit',
      changeOrigin: true,
      pathRewrite: {
        '^/auth/accredit': '',
      },
    },

  },
  test: {
    '/api/': {
      target: 'https://preview.pro.ant.design',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
