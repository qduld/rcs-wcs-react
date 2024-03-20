
interface colorDefineObj{
    idx:string,
    color:string,
    name:string,
    colorOut:string,
    pattern:string,
    tips:string
}

interface tabsObj{
    title:string,
    name:string,
    content:string,
    isActive:string
}

export interface MapState{
    codeMapData:Array<object>,             //码点地图数据
    gridMapData:object,             //格点地图数据
    portsListData:Array<object>,           //工位点列表数据
    drawMapParamsArr:Array<object>,
    pointLocateFlag:boolean,      //点位定位
    pathPointList:Array<object>,           //路径点位列表
    createPointFlag:boolean,     //创建点位列表
    createPathFlag:boolean,       //创建线路列表
    setPathInputFlag:boolean,
    reqLoadFlag:boolean,
    drawMapParams:{ 
        startPosX:number,            //起点X
        startPosY:number,            //起点Y
        startWide:number,            //起点码宽
        space:number,
        canvasWidth:number,          //画布宽
        canvasHeight:number,         //画布高
        gridPointWidth:number,       //格点宽度
        gridPointHeight:number,      //格点高度
        scaleProp:number,            //缩放比例
        mapWidth: number,
        mapHeight: number,
        colorDefine:Array<colorDefineObj>
    },
    drawMapParamsCache:{
        startPosX: number,
        startPosY: number,
        space: number,
        startWide: number,   
        canvasWidth: number,
        canvasHeight: number,
        gridPointWidth: number,
        gridPointHeight: number,
        scaleProp: number,
        mapWidth: number,
        mapHeight: number
    },
    currentFloor:number,      //当前楼层
    curFloorPorts:Array<any>,    //当前楼层工位
    curFloorGrids:Array<any>,    //当前楼层格点
    curPortsListArr:Array<any>,
    curLocPoint:any,
    regionsPointArr:Array<any>,           //区域对象
    regionsPortArr:Array<any>,
    editableTabs:Array<tabsObj>,
    gridDataArr:Array<any>,             //格点数据数组
    activeTab:any,             //活跃标签
    loading:true,
    formLabelWidth: string,
    maxPortId:number,
    portShowType:string,
    actionList:Array<object>,
    pathList:object,            //线路列表
    agvList:object,             //Agv列表
    agvTimeOut:number,           //小车定时器
    currentAgv:string,          //当前Agv
    currentAgvObj:string,       //当前追踪Agv对象
    monitorAgvList:Array<any>,      //模拟Agv列表
    allDDL:Array<object>,
    allCodePortType:Array<object>,  
    trackFlag:boolean,
    rightCollapse:boolean      //侧边栏显隐
}

export const MapStateInit={
    codeMapData:[],             //码点地图数据
    gridMapData:{},             //格点地图数据
    portsListData:[],           //工位点列表数据
    drawMapParamsArr:[],
    pointLocateFlag:false,      //点位定位
    pathPointList:[],           //路径点位列表
    createPointFlag:false,     //创建点位列表
    createPathFlag:false,       //创建线路列表
    setPathInputFlag:false,
    reqLoadFlag:false,
    drawMapParams:{ 
        startPosX:100,            //起点X
        startPosY:100,            //起点Y
        startWide:40,            //起点码宽
        space:80,
        canvasWidth:0,          //画布宽
        canvasHeight:0,         //画布高
        gridPointWidth:0,       //格点宽度
        gridPointHeight:0,      //格点高度
        scaleProp:1,            //缩放比例
        mapWidth: 0,
        mapHeight: 0,
        colorDefine:[
            {idx:"0",color:"#3abae9",name:'idle',colorOut:"rgba(58,186,233,0.3)",pattern:"blank",tips:'空闲'},
            {idx:"1",color:"#e96b3a",name:'busy',colorOut:"rgba(233,107,58,0.3)",pattern:"blank",tips:'忙碌'},       
            {idx:"2",color:"#3ae9ad",name:'charging',colorOut:"rgba(58,233,173,0.3)",pattern:"blank",tips:'充电'},
            {idx:"3",color:"#DC191D",name:'malfunction',colorOut:"rgba(220,25,29,0.3)",pattern:"blank",tips:'故障'},
            {idx:"4",color:"#E0C718",name:'anticollision',colorOut:"rgba(224,199,24,0.3)",pattern:"blank",tips:'防碰撞'},
        ]
    },
    drawMapParamsCache:{
        startPosX: 0,
        startPosY: 0,
        space: 0,
        startWide: 0,   
        canvasWidth: 0,
        canvasHeight: 0,
        gridPointWidth: 0,
        gridPointHeight: 0,
        scaleProp: 0,
        mapWidth:0,
        mapHeight:0
    },
    currentFloor:0,      //当前楼层
    curFloorPorts:[],    //当前楼层工位
    curFloorGrids:[],    //当前楼层格点
    curPortsListArr:[],
    curLocPoint:null,
    regionsPointArr:<Array<any>>[],           //区域对象
    regionsPortArr:[],
    editableTabs:<Array<tabsObj>>[],
    gridDataArr:[],             //格点数据数组
    activeTab:'0',             //活跃标签
    loading:true,
    formLabelWidth: '120px',
    maxPortId:0,
    portShowType:'',
    actionList:[],
    pathList:{},            //线路列表
    bufferAreaList:[],      //缓冲区列表
    agvList:{},             //Agv列表
    agvTimeOut:0,           //小车定时器
    currentAgv:'',          //当前Agv
    currentAgvObj:'',       //当前追踪Agv对象
    monitorAgvList:[],      //模拟Agv列表
    allDDL:[],              //ddl列表
    allCodePortType:[],     //码点对应的站点类型  
    trackFlag:false,
    rightCollapse:false      //侧边栏显隐
}


export interface StateType {
    dmCodeList?:Array<object>,
    gridPointList?:Array<object>,
    portTypeList?:Array<object>,
    ddlList?:Array<object>,
    updateAction?:Function
}
