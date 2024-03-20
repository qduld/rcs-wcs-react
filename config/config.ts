// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
const { REACT_APP_ENV } = process.env;
export default defineConfig({
  history: { type: 'hash' },
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  locale: {
    // default zh-CN
    default: 'zh-CN',
    // default true, when it is true, will use `navigator.language` overwrite default
    antd: true,
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes: [
    {
      path: '/user',
      component: '../layouts/UserLayout',
      routes: [
        {
          name: 'login',
          path: '/user/login',
          component: './user/login',
        },
      ],
    },
    {
      path: '/',
      component: '../layouts/SecurityLayout',
      routes: [
        {
          path: '/',
          component: '../layouts/BasicLayout',
          authority: ['admin', 'user'],
          routes: [
            {
              path: '/',
              redirect: '/home',
            },
            // {
            //   path: '/admin',
            //   name: 'admin',
            //   icon: 'crown',
            //   component: './Admin',
            //   authority: ['admin'],
            //   routes: [
            //     {
            //       path: '/admin/sub-page',
            //       name: 'sub-page',
            //       icon: 'smile',
            //       component: './Welcome',
            //       authority: ['admin'],
            //     },
            //   ],
            // },
            {
              name: 'home',
              icon: 'home',
              path: '/home',
              component: './Home',
            },
            {
              name: 'device-monitor',
              icon: 'tags',
              path: '/devicemonitor',
              component: './DeviceMonitor',
            },
            {
              name: 'map-monitor',
              icon: 'nodeIndex',
              path: '/mapmonitor',
              component: './MapMonitor',
            },
            {
              name: 'config-info',
              icon: 'table',
              path: '/configInfo',
              component: './ConfigInfo',
            },
            {
              path: '/deviceMgt',
              icon: 'tool',
              name: 'device-mgt',
              routes: [
                {
                  name: 'agv-mgt',
                  path: '/deviceMgt/agvmgt',
                  component: './DeviceMgt/AgvMgt',
                },
                {
                  name: 'rcs-mgt',
                  path: '/deviceMgt/rcs',
                  component: './DeviceMgt/RcsMgt',
                },
                {
                  name: 'chargepile-mgt',
                  path: '/deviceMgt/chargepilemgt',
                  component: './DeviceMgt/ChargepileMgt',
                },
                {
                  name: 'supple-mgt',
                  path: '/deviceMgt/supple',
                  component: './DeviceMgt/SupplementaryMgt',
                },
                {
                  name: 'voice-mgt',
                  path: '/deviceMgt/voicemgt',
                  component: './DeviceMgt/VoiceMgt',
                }
              ]
            },
            {
              name: 'charge-mgt',
              icon: 'api',
              path: '/chargemgt',
              component: './ChargeMgt',
            },
            {
              name: 'data-statistics',
              icon: 'table',
              path: '/datastatistics',
              routes: [
                {
                  name: 'machinefailure-rate',
                  path: '/datastatistics/machinefailurerate',
                  component: './dataStatistics/machineFailureRate',
                },
                {
                  name: 'utilization-rate',
                  path: '/datastatistics/utilizationrate',
                  component: './dataStatistics/utilizationRate',
                }
              ]
            },
            {
              name: 'abnormal-info',
              icon: 'fire',
              path: '/abnormalinfo',
              component: './abnormalinfo',
            },
            {
              name: 'user-mgt',
              icon: 'user',
              path: '/usermgt',
              component: './user-mgt',
            },
            // {
            //   name: 'agv.agv-mgt',
            //   icon: 'table',
            //   path: '/agvmgt',
            //   component: './AgvMgt',
            // },
            // {
            //   name: 'rcs.rcs-mgt',
            //   icon: 'table',
            //   path: '/rcs',
            //   component: './RcsMgt',
            // },
            // {
            //   name: 'chargepile.chargepile-mgt',
            //   icon: 'table',
            //   path: '/chargepilemgt',
            //   component: './ChargepileMgt',
            // },
            // {
            //   name: 'supple.supple-mgt',
            //   icon: 'table',
            //   path: '/supple',
            //   component: './SupplementaryMgt',
            // },
            // {
            //   name: 'voice.voice-mgt',
            //   icon: 'table',
            //   path: '/voicemgt',
            //   component: './VoiceMgt',
            // },
            {
              component: './404',
            },
          ],
        },
        {
          component: './404',
        },
      ],
    },
    {
      component: './404',
    },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // ...darkTheme,
    'primary-color': defaultSettings.primaryColor,
  },
  // @ts-ignore
  title: false,
  ignoreMomentLocale: true,
  //暂时失效
  define: {
    REACT_APP_ENV: 'env'    
  },
  chainWebpack(memo, args){

    memo.module
      .rule('svg')
      .exclude.add(/ionicons/).end();

    memo.module
      .rule('svgr')
      .test(/.svg$/)
      .include.add(/ionicons/).end() // include 指定需要直接 svgr 的情况
      .use('react-svg-loader')
      .loader(require.resolve('react-svg-loader'));
      
    // config.module.rule('svg')
    //   .test(/\.svg$/)
    //   .use("babel-loader")
    //   .loader('babel-loader')
    // config.module.rule('svg')
    //   .test(/\.svg$/)
    //   .use("react-svg-loader")
    //   .loader('react-svg-loader')
  },

  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
});
