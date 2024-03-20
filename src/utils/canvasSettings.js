// drawing settings
import * as PIXI from 'pixi.js';
import {
  AdjustmentFilter
} from '@pixi/filter-adjustment';

const theme = {
  dark: {
    /*深色*/
    bgColor: 0xF0F2F5, //画布背景颜色
    cccColor: 0x001529, // 码值点颜色
    lColor: 0x001529, //普通线路
    pColor: 0xf8e807, // 路径颜色
    phColor: 0x00ffff, // 路径高亮颜色
    ctS: '#ff0000', //初始化码值颜色 字串格式
    ctColor: 0xff0000, //码值颜色 16进制数
    cthColor: 0x00ff00, //码值高亮颜色
    atColor: '#0000ff', // 小车编码颜色
    basColor: [0xcc000c, 0.3], // 缓冲区框选选框颜色
    babgColor: [0xf0f2f5, 0.01], // 缓冲区背景颜色
  },
  light: {
    /*浅色*/
    bgColor: 0xF0F2F5, //画布背景颜色
    cccColor: 0xF0F2F5, // 码值点颜色
    lColor: 0x001529, //普通线路
    pColor: 0xf8e807, // 路径颜色
    phColor: 0x00ff00, // 路径高亮颜色
    ctS: '#ff0000', //初始化码值颜色 字串格式
    ctColor: 0xff0000, //码值颜色 16进制数
    cthColor: 0x1890FF, //码值高亮颜色
    atColor: '#000000', // 小车编码颜色
    basColor: [0xeeaaee, 0.3], // 缓冲区框选选框颜色
    babgColor: [0xcccccc, 0.01], // 缓冲区背景颜色
  }
};
let activeTheme = 'light';
// function rgbaFilter(red=1,green=1,blue=1,alpha=1){
//     return [new AdjustmentFilter({ 
//         red,//max 5
//         green,//max 5
//         blue,//max 5
//         alpha,//max 1
//         gamma:1,//max 5
//         brightness:1,//max 5
//         contrast:1,//max 5
//         saturation:1,//max 5
//     })]
// }
// const fakeClassAgvFilters={
//     free:rgbaFilter(2.5,2.5,2.5),
//     running:rgbaFilter(1,5,0),
//     charging:rgbaFilter(1,5,0.5),
//     breakdown:rgbaFilter(5,0,0),
// }
const agvState = {
  // free:'/img/car44.png',
  free: '/img/car-空闲.png',
  running: '/img/car-运行.png',
  breakdown: '/img/car-故障.png',
  charging: '/img/car-充电.png',
}
export const stateDC = {
  0: 'agv0', //free
  1: 'agv1', //running
  2: 'agv2', //breakdown
  3: 'agv3', //charging
};

const canvasSettings = {
  backgroundColor: theme[activeTheme]['bgColor'], //画布背景颜色
  codeCircleColor: theme[activeTheme]['cccColor'], // 码值点颜色
  lineColor: theme[activeTheme]['lColor'], //普通线路
  pathColor: theme[activeTheme]['pColor'], // 路径颜色
  pathHighlightColor: theme[activeTheme]['phColor'], // 路径颜色
  codeTextStyle: theme[activeTheme]['ctS'], //初始化码值颜色 字串格式
  codeTextColor: theme[activeTheme]['ctColor'], //码值颜色 16进制数
  codeTextHighlightColor: theme[activeTheme]['cthColor'], //码值高亮颜色
  codeCircleAlpha: 0.01, // 码值点不透明度 
  agvZoomEndScale: 10,
  codeZoomEndScale: 0.05,
  // agvImg:'/img/car.png', //小车图片
  agvStateImg: agvState, //状态 小车图片
  agvTextColor: theme[activeTheme]['atColor'], // 小车编码颜色
  agvScaleItem: 20, // 小车比例系数
  agvScaleAxias: { // 小车双轴比例
    x: 1,
    y: 0.8,
  },
  agvTextScale: 0.08, //车牌文字比例
  // agvFilters:fakeClassAgvFilters,
  specialViewAimScale: 50, // 特写比例大小
  bufferAreaSquareColor: theme[activeTheme]['basColor'], // 缓冲区框选选框颜色
  bufferAreaBackgroundColor: theme[activeTheme]['babgColor'], // 缓冲区背景颜色
  drawCircle: (wide) => {
    let circle = new PIXI.Graphics();
    circle.lineStyle(0); // draw a circle, set the lineStyle to zero so the circle doesn't have an outline
    circle.beginFill(canvasSettings.codeCircleColor, canvasSettings.codeCircleAlpha);
    circle.drawCircle(0, 0, wide / 2);
    circle.endFill();
    return circle;
  },
  fakePathList: [{
    "agvId": "agv3",
    paths:[4071,4423,4044,4043,4042,4041,4301,2679,4072,4109,4022,4021,4068,4106,4006,4003,4002,4001,4091,4114,5070,4116,4120,4119,4118,4097,5067,5068,4027,5069,4030,3134,3139,3138,4562,4563,4514,4566]
    // "paths": ["4071", "4423", "4044", "4043", "4042", "4041", "4301", "2679", "4072", "4109", "4022", "4021", "4068", "4106", "4006", "4003", "4002", "4001", "4091", "4114", "5070", "4116", "4120", "4119", "4118", "4097", "5067", "5068", "4027", "5069", "4030", "3134", "3139", "3138", "4562", "4563", "4514", "4566"]
  }, 
  {
    "agvId": "agv1",
    "paths": [3138,3137]
  }, 
  {
    "agvId": "agv2",
    "paths": [2679,2627,2631]
  }
]
}
export const fakeBufferAreaList = {
  0: {
    list: [
    //     {
    //     name: '1-1',
    //     coord: [
    //       [854, 190],
    //       [1094, 612]
    //     ],
    //   }
      // ,
      // {
      //     name:'1-2',
      //     coord:[[310,210],[110,200]],
      // }
    ]
  },
  1: {
    list: [
      // {
      //     name:'2-2',coord:[[110,110],[200,200]]}
    ]
  },
  2: {
    list: [
      // {
      //     name:'3-3',coord:[[210,20],[250,60]]}
    ]
  },
  3: {
    list: [
      // {
      //     name:'ads',coord:[[500,10],[530,100]]}
    ]
  },
}
export const toolStatusColorList = {
  busy: '#1890ff',
  lazy: '#333333'
}
export const textStyle = {
  fontFamily: 'Arial',
  fill: canvasSettings.codeTextStyle, // 码值 颜色
  stroke: canvasSettings.codeTextStyle,
  fontWeight: 'bold'
}
export default canvasSettings
