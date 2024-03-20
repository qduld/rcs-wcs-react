import React , { useState ,useEffect , useRef , forwardRef , useImperativeHandle } from 'react';
import styles from './style.less';
import * as PIXI from 'pixi.js';

import { Viewport } from 'pixi-viewport';
import { connect , Dispatch } from 'umi';
import { ConnectState } from '@/models/connect';
import usePrevious from '@/utils/customeEffect';
import { StateType } from '@/components/MapPartComponents/data.d';
import canvasSets,{stateDC,textStyle,fakeBufferAreaList} from '@/utils/canvasSettings';
import {getOffsetNews} from '@/utils/usefulFunction'
const FBI=fakeBufferAreaList;

interface MapCanvasProps {
    gridDataArr: Array<Object>;    //格点数据数组
    codeMapList: Array<Object>;
    drawMapParams: {
        startPosX: number,
        startPosY: number,
        space: number,
        startWide: number,   
        canvasWidth: number,
        canvasHeight: number,
        gridPointWidth: number,
        gridPointHeight: number,
        scaleProp: number
    },
    currentFloor:number,
    dispatch:Dispatch,
    collapsed:Boolean,
    rightCollapse:Boolean,
    pathList:Array<object>,
    bufferAreaList:Array<object>,

    allAgvList:string,
    currentAgv:string,
    handleCurrentAgv:(agvId:string)=>void,
    handleBufferListChange:(v:any)=>any,
    currentAgvObj:string,
    codesPortType:Array<object>,
    trackFlag:boolean,
    listStatus:Array<object>,
    loadRegion:(currentTab:string)=>void,
    handleCollapse:()=>void,
}

// React.FC<MapCanvasProps> = (props) => {      
    // forwardRef((props:MapCanvasProps,ref) => {         
const MapCanvas = forwardRef((props:MapCanvasProps,ref) => { 
    const { 
        gridDataArr, codeMapList , drawMapParams , currentFloor , collapsed , rightCollapse , codesPortType ,
         pathList , allAgvList , currentAgv , currentAgvObj , trackFlag , listStatus , handleCurrentAgv , loadRegion ,
        handleCollapse , bufferAreaList , handleBufferListChange 
    } = props;     

    let pixiBody= useRef();     
    let pixiApp= useRef();
    let initView = useRef();
    // let codeTextGroup = useRef();

    let bgContainer = useRef();
    let codeTextContainer = useRef();              //文字容器
    let pathContainer = useRef();                  //线路容器
    let agvContainer = useRef();
    let bufferContainer=useRef();                   // 缓冲区容器

    let bufferBg=useRef()

    // let pathGroup = useRef();
    let codePicTemp = useRef();
    // let [graphicsTemp,setGraphicsTemp] = useState({});
    // let [textTemp,setTextTemp] = useState({});
    let gridDataArrCache = useRef();
    let curPoint = useRef();
    let transformCache = useRef();

    let agvSprite = useRef();
    let agvTexture = useRef();

    let trackFlagCache = useRef<Boolean>();
    
    let rightCollapseFlag = useRef<Boolean>();
    let portTypeFilter = useRef<String>();
    // let pathListCache = useRef([]);
    let centerScale = useRef<String | Number>(100);
    let hideAgv = useRef<Boolean>(true);
    let hideAgvPathList = useRef<Array<string>>([]);
    let agvListArr = useRef<Object>({});

    let bufferAreaListArr=useRef<Array<any>>([]) //缓存区列表
    let hideBufferAreaListArr=useRef<Array<any>>([]) // 缓存区隐藏列表
    // data
    let [agvActiveScale,setAgvActiveScale]=useState<Number>(-1)
    let [mapRoomScale,setMapRoomScale]=useState<any>(null)
        
    let [prevAgvState,setPrevAgvState]=useState<any>(-1) // 任务连续性判断

    let [textResourcesCache,setTextResourcesCache]=useState<any>(null);
    // 
    useImperativeHandle(ref, () => ({
        initApp:initApp,
        handleReset:handleReset,
        handleZoom:handleZoom,
        handleCodeShow:handleCodeShow,
        handlePathShow:handlePathShow,
        handleAgvSize:handleAgvSize,
        handleCodeSize:handleCodeSize,
        handleLocation:handleLocation,
        handlePortType:handlePortType,
        handleCenterScale:handleCenterScale,
        handleBuffferAreaShow:handleBuffferAreaShow,
        pixiRef:pixiBody
      }));

    let previousAgv:(string | any) = usePrevious(currentAgvObj);
    let previousFloor:(number | any) = usePrevious(currentFloor);
    let previousPortType:(string | any) = usePrevious(portTypeFilter);

    // mounted
    useEffect(() => {
        initApp();
    }, []);


    // watch
    useEffect(() => {
        collapsedChange()
    }, [collapsed]);

    useEffect(() => {
        let parentDom = document.querySelector('#mapBox')
        if(parentDom){
            pixiApp.current.resize(parentDom.clientWidth,parentDom.clientHeight)
        }
            
        rightCollapseFlag.current = rightCollapse
    }, [rightCollapse]);

    useEffect(()=>{
        if(pixiApp.current.stage.children.length>0){
            if(previousFloor!=currentFloor){
                return;
            }
            pixiApp.current.stage.children[currentFloor] = initViewPort(currentFloor)
            updateCurrentFloor()
            initPathBefore()
        }
    },[drawMapParams])

    useEffect(()=>{
        if(pathList && pathList.length>0 && initView.current){
            initPathBefore()
        }
    },[pathList])

    useEffect(()=>{
        updateCurrentFloor()
    },[allAgvList,agvTexture.current])

    useEffect(()=>{           //当不追踪时就重置地图缩放
        trackFlagCache.current = trackFlag
        if(!trackFlag && currentAgv){
            handleCurrentAgv('')
            handleReset()
        }
    },[trackFlag])

    useEffect(() => {
        if(gridDataArr.length>0){
            codePicTemp.current = drawCircle(drawMapParams.startWide);
            gridDataArrCache.current = gridDataArr;
            sceneSwitch();
        }
    }, [gridDataArr]);

    useEffect(() => {
        let currentStage = pixiApp.current.stage.children[currentFloor]
        if(currentStage){
            bgContainer.current = currentStage.children[0]
            pathContainer.current = currentStage.children[1]
            codeTextContainer.current = currentStage.children[2]
            agvContainer.current = currentStage.children[3]
            bufferContainer.current = currentStage.children[4]
            updateCurrentFloor()
            initPathBefore()
            filterCodeByPortType(portTypeFilter.current)
        }
    }, [currentFloor]);

    // methods
    const initApp = () => { // 初始化pixi应用绑定元素,初始化纹理
        

        window.oncontextmenu=function(e){
            e.preventDefault();
        }
        let parentDom = document.querySelector('#pixiBody')
        // console.log('parentDom',parentDom.clientWidth,parentDom.clientHeight)
        if(parentDom){
            // parentDom.addEventListener('resize',function(e){
            //     initApp()
            // })
            let initViewOrg = { 
              antialias: true,
              backgroundColor:canvasSets.backgroundColor,//背景色
              resizeTo:parentDom,
              width:parentDom.clientWidth,
              height:parentDom.clientHeight
            }
            if(!pixiApp.current){
                pixiApp.current = new PIXI.Application(initViewOrg);
            }else if( 
                pixiApp.current.view.width!==parentDom.clientWidth || 
                pixiApp.current.view.height!==parentDom.clientHeight 
            ){
                pixiApp.current = new PIXI.Application(initViewOrg);
            }
            
            parentDom.appendChild(pixiApp.current.view);

            bufferContainer.current=new PIXI.Container();
            bufferContainer.current.visible=false;
            bufferContainer.current.width=parentDom.clientWidth
            bufferContainer.current.height=parentDom.clientHeight
            drawBufferBg()

            agvContainer.current = new PIXI.Container();
            agvContainer.current.visible = false;

            // pixiApp.current.renderer = appRenderer.current

            pixiApp.current.loader.add('agv0', canvasSets.agvStateImg['free'])
            .add('agv1', canvasSets.agvStateImg['running'])
            .add('agv2', canvasSets.agvStateImg['breakdown'])
            .add('agv3', canvasSets.agvStateImg['charging']);

            let stateImgName=stateDC[0];
            pixiApp.current.loader.load((loader:any, resources:any) => {
                if(!textResourcesCache){
                    setTextResourcesCache(resources)
                }
                drawAgv(resources[stateImgName].texture);
                agvTexture.current = resources[stateImgName].texture
            });
            
        }
    };


    const collapsedChange = ()=>{        //全局collapsed修改
        let { handleCollapse } = props
            let parentDom = document.querySelector('#mapBox')
            if(parentDom){
                changeMapClientWidth()
                handleCollapse()  
            }
    }

    const changeMapClientWidth=()=>{                 //改变地图宽度
        let mapNode = document.getElementById('pixiBody')
        let sideNode = document.getElementById('sideBar')
        let { collapsed,rightCollapse } = props
        if(mapNode){
            if(rightCollapse){
                if(collapsed){
                    mapNode.style.width =  ( document.body.clientWidth - 80 ) +'px'
                }else{
                    mapNode.style.width = ( document.body.clientWidth - 256 ) +'px'
                }
            }else{
                if(collapsed){
                    mapNode.style.width = ( document.body.clientWidth - 80 - sideNode.clientWidth ) +'px'
                }else{
                    mapNode.style.width = ( document.body.clientWidth - 256 - sideNode.clientWidth ) +'px'
                }
            }
            mapNode.childNodes.forEach((item:any)=>{
                item.style.width = mapNode.clientWidth+"px"
                item.style.height = mapNode.clientHeight+"px"
            })
        }
    }

    const initPathBefore = ()=>{
        //每次清理线路容器
        let sceneList = pixiApp.current.stage.children
        let parentContainer = sceneList[currentFloor]
        let pathCon = sceneList[currentFloor].children[1]
        parentContainer.removeChild(pathCon)
        pathContainer.current = new PIXI.Container()
        parentContainer.addChild(pathContainer.current)
        pathContainer.current.zIndex = 2;
        for(let agvId in agvListArr.current) {
            spliceIdleAgv(agvId)
        }  
        props.pathList.forEach((item:any)=>{
            initPath(item)
        })
        parentContainer.updateTransform();
    } 
    const drawBufferRect=(
        x1=0,y1=0,x2=1,y2=1,
        color=[0xffffff,0.01],
        graObj
    )=>{
        if(graObj){
            graObj.clear()
        }else{
            graObj=new PIXI.Graphics()
        }
        let sx=x1<=x2?x1:x2;
        let sy=y1<=y2?y1:y2;
        let rw=Math.abs(x2-x1);
        let rh=Math.abs(y2-y1);
        // console.log(sx,sy,rw,rh)
        graObj.beginFill(...color);
        graObj.drawRect(sx,sy,rw,rh);
        graObj.endFill();
        // graObj.interactive=true;

        return graObj
    };
    const drawBuffer=(m)=>{
        if(bufferContainer.current instanceof PIXI.Container){
            let buffer=new PIXI.Graphics();
            let conNew=new PIXI.Container()
            // buffer.beginFill(...canvasSets.bufferAreaSquareColor);
            drawBufferRect(
                ...m.coord[0],...m.coord[1],
                canvasSets.bufferAreaSquareColor,
                buffer
            )
            buffer.vitalName='buffer-cell'
            conNew.addChild(buffer)
            // buffer.drawRect(...m.coord[0],...m.coord[1]);
            // buffer.endFill()
            // console.log('buffer x y',buffer)
        // let textTemp = new PIXI.Text('',textStyle)
        // textTemp.style.fill = canvasSets.agvTextColor;
        // textTemp.text = m.name;
        // textTemp.anchor.set(0.5,0.5);
        // textTemp.x=Math.min(m.coord[0][0],m.coord[1][0]) ;
        // textTemp.y=Math.min(m.coord[0][1],m.coord[1][1]) ;
        // textTemp.vitalName='buffer-text'
        // conNew.addChild(textTemp)
        

            bufferContainer.current.addChild(conNew)
        }
    }
    const drawBuffers=()=>{
        let {dispatch}=props
        let bcc=bufferContainer.current;
        
        if(bcc.children.length>1){
            for(let son =0;son<bcc.children.length;son++){
                if(!bcc.children[son].vitalName||bcc.children[son].vitalName!=='buffer-bg'){
                    bcc.removeChildAt(son)
                    son--
                }else
                if(bcc.children[son].vitalName==='buffer-bg'){
                    bcc.removeChildAt(son)
                    son--
                }
            }
        }
        // dispatch({
        //     type:'homeAndMonitor/fetchAllArea',
        //     callback:(res:any)=>{
        //         console.log('homeAndMonitor/fetchAllArea',res)
        //     }

        // })
        FBI[currentFloor]['list'].forEach(drawBuffer)

    }
    const drawBufferBg = ()=>{
        let pb=document.getElementById('pixiBody');
        let bcc=bufferContainer.current;
        if(!pb||!bcc){return};
        let bgIndex=bcc.children.findIndex(m=>{
            return m.vitalName==='buffer-bg'
        })
        if(bgIndex!==-1){
            bcc.removeChildAt(bgIndex);
        }
        // let activeSize={w:pb.clientWidth,h:pb.clientHeight};
        // bcc.width=activeSize.w;
        // bcc.height=activeSize.h;

        let containerNew=new PIXI.Container()
        containerNew.vitalName='buffer-bg';
        let currentBg=new PIXI.Graphics();
        bufferBg.current=drawBufferRect(0,0,bcc._width,bcc._height,canvasSets['bufferAreaBackgroundColor'],currentBg);
        containerNew.addChild(bufferBg.current)
        bcc.addChild(containerNew)

    }
    // const initBufferArea=()=>{
        // console.log('bufferstart')
    //     let bp=document.getElementById('pixiBody')
    //     bufferContainer.current.visible=true;
    //     let bufferSelector=new PIXI.Graphics()
    //     drawBufferBg()
        // let relativeOffset=[0,0];
        // relativeOffset[0]=bufferContainer.current.x;
        // relativeOffset[1]=bufferContainer.current.y;
        // let singleOffset=[0,0]
        // singleOffset[0]=bp.children[0].offsetLeft;
        // singleOffset[1]=bp.children[0].offsetTop;
        // let globalOffset=[singleOffset[0]+relativeOffset[0],singleOffset[1]+relativeOffset[1]];

    //     let scmm=false
    //     console.log('relativeOffset,singleOffset,globalOffset',relativeOffset,singleOffset,globalOffset)
        // bufferContainer.current.on('rightdown',function(md){
        //     console.log('rightdown')
 
        //     let {data:{originalEvent:{clientX,clientY}}}=md;
        //     let startInCon=[clientX-globalOffset[0],clientY-globalOffset[1]];
        //     let processInCon=[...startInCon];
        //     let achieveInCon=[0,0];
        //     console.log('startInCon',startInCon);
        //     scmm=true;

            // this.on('mousemove',scMouseMove).on('rightup',scMouseUp);

            // function scMouseMove (mm){
            //     if(scmm){
            //         let {data:{originalEvent:{movementX,movementY}}}=mm;
            //         processInCon[0]+=movementX;
            //         processInCon[1]+=movementY;
            //         achieveInCon=[...processInCon];
            //         console.log('processInCon',processInCon);
            //         let argArr=[...startInCon,...achieveInCon,[0xff0000,0.3],bufferSelector]
            //         drawBufferRect(...argArr);
            //         console.log('mm',mm);
            //     }else{
            //         this.off('mousemove',scMouseMove);
            //     }
            // }

            // function scMouseUp(mu){
            //     console.log('rightup',mu);
            //     // mu.data.originalEvent.preventDefault()
            //     scmm=false;
            //     console.log('startInCon',startInCon,'achieveInCon',achieveInCon);
            //     this.off('mousemove',scMouseMove);
            // }
        // })
        // let sceneList = pixiApp.current.stage.children
        // let parentContainer = sceneList[currentFloor]
        // let bufferCon = sceneList[currentFloor].children[4]
        // parentContainer.removeChild(bufferCon)
        // bufferCon.current = new PIXI.Container()
        // parentContainer.addChild(bufferCon.current)
        // pathContainer.current.zIndex = 5;
        
        // props.bufferAreaList.forEach((item:any)=>{

        // })
    // }
    const updateCurrentFloor=()=>{             //如果在当前楼层就绘制小车,存在空闲小车就清除对应线路位置
        agvListArr.current = JSON.parse(allAgvList)
        bufferContainer.current.visible=true;
        drawBufferBg();
        onBufferShow()
        if(allAgvList!=='{}' && agvTexture.current){
            agvContainer.current.visible = true
            agvContainer.current.children = []
            for(let agvId in agvListArr.current) {
                if(agvListArr.current[agvId].position.region === 'region'+currentFloor){
                    drawAgv(agvTexture.current,agvListArr.current[agvId],agvListArr.current[agvId].agv_state)
                    updateAgv(agvListArr.current[agvId],agvContainer.current.children.length-1,agvId)
                    // handleAgvSize(canvasSets.agvZoomEndScale);
                    // handleCodeSize(canvasSets.codeZoomEndScale);
                }
                spliceIdleAgv(agvId)
            }   
        }
    }

    const spliceIdleAgv=(agvId:any)=>{       //剔除空闲Agv
        let { dispatch } = props
            let listCache = listStatus.find((item:any)=>{return item.agvId == agvId})
            if(listCache){
                if(!listCache.missionId || !listCache.missionName || listCache.missionName == "空闲"){
                    let pathIdx = pathList.findIndex((agvItem:any)=>{
                        return agvItem.agvId == agvId
                    })
                    if(pathIdx!=-1){
                        pathList.splice(pathIdx,1)
                        dispatch({ type: 'homeAndMonitor/updatePathList',payload:pathList})
                    }
                }
            }
            // if(agvListArr.current[agvId].agv_state==0){ 
            //     let pathIdx = pathList.findIndex((agvItem:any)=>{
            //         return agvItem.agvId == agvId
            //     })
            //     if(pathIdx!=-1){
            //         pathList.splice(pathIdx,1)
            //         dispatch({ type: 'homeAndMonitor/updatePathList',payload:pathList})
            //     }
            // }
    }

    const sceneSwitch = ()=>{
        let sceneList = pixiApp.current.stage.children
        if(sceneList.length>0){
            sceneList.forEach((item:any)=>{
                item.visible = false
            })
            if( sceneList[currentFloor] ){
                // if(sceneList[currentFloor].children.length>0){
                //     sceneList[currentFloor].setTransform(0,0,1,1)
                //     sceneList[currentFloor].visible = true
                //     initView.current = sceneList[currentFloor]
                // }else{
                    sceneList[currentFloor] = initViewPort(currentFloor)
                // }
            }else{
                if(gridDataArrCache.current){
                    for(let i=0;i<currentFloor;i++){
                        if(!sceneList[i]){
                            pixiApp.current.stage.addChild(new Viewport())
                        }
                    }
                    sceneList[currentFloor] = initViewPort()
                }
            }
        }else{
            if(gridDataArrCache.current){
                sceneList[currentFloor] = initViewPort()
            }
        }      
    }

    const initViewPort = (index?:number)=>{
        let { drawMapParams } = props
        // setGraphicsTemp(new PIXI.Graphics());
        let domWrapper = document.querySelector('#pixiBody')
        initView.current = new Viewport({
            screenWidth: domWrapper.clientWidth,
            screenHeight: domWrapper.clientHeight,
            // worldWidth: 1000,
            // worldHeight: 1000,
            divWheel:domWrapper,
            interaction: pixiApp.current.renderer.plugins.interaction
        })
        
        // if(replaceFlag && pixiApp.current.stage.children[index]){
        //     pixiApp.current.stage.removeChildAt(index,1)
        // }

        if(index || index==0){
            pixiApp.current.stage.removeChildAt(index)
            pixiApp.current.stage.addChildAt(initView.current,index)
        }else{
            pixiApp.current.stage.addChild(initView.current)
        }
        pixiApp.current.stage.sortableChildren = true;       //舞台支持排序
        initView.current
            .drag({mouseButtons:'left'})
            .pinch()
            .wheel()
            // .decelerate()

        // codeTextGroup.current = new PIXI.display.Group(2, true);
        // pathGroup.current = new PIXI.display.Group(1, true);

        // pixiApp.current.stage.addChild(new PIXI.display.Layer(codeTextGroup.current));
        // pixiApp.current.stage.addChild(new PIXI.display.Layer(pathGroup.current));

        bgContainer.current = new PIXI.Container();
        codeTextContainer.current = new PIXI.Container();
        // mapBackContainer.current = new PIXI.ParticleContainer();
        agvContainer.current = new PIXI.Container();
        pathContainer.current = new PIXI.Container();
        bufferContainer.current=new PIXI.Container();

        initView.current.sortableChildren = true;       //舞台支持排序
        bgContainer.current.zIndex = 1;
        pathContainer.current.zIndex = 2;
        codeTextContainer.current.zIndex = 3;
        agvContainer.current.zIndex = 4;
        agvContainer.current.visible = false
        bufferContainer.current.zIndex=5 ;
        bufferContainer.current.visible=false;
        bufferContainer.current.width=domWrapper.clientWidth;
        bufferContainer.current.height=domWrapper.clientHeight;
        
        initView.current.addListener('zoomed-end',function(viewport:any){
            console.log('viewport',viewport)
            transformCache.current = viewport.transform
            // handleAgvSize(canvasSets.agvZoomEndScale);
            // handleCodeSize(canvasSets.codeZoomEndScale);
        })


        initGrid( // 绘制地图
            gridDataArrCache.current,
            drawMapParams.startPosX,
            drawMapParams.startPosY,
            drawMapParams.startWide,
            drawMapParams.space,bgContainer.current
        ); 
        initView.current.addChild(bgContainer.current);
        initView.current.addChild(pathContainer.current);
        initView.current.addChild(codeTextContainer.current);
        initView.current.addChild(agvContainer.current);
        initView.current.addChild(bufferContainer.current);
        // console.log('initView current',initView,'bufferContainer.current',bufferContainer.current)
        return initView.current
    }

    const initGrid = (gridArr:any,startX:any,startY:any,wide:any,space:any,currentView:any) =>{         //绘制码点
        for(let i=0;i<gridArr.length;i++){
            for(let j=0;j<gridArr[i].length;j++){
                if(gridArr[i][j].position_flag!='-'){
                        if(gridArr[i][j].position_flag!='#' && gridArr[i][j]._isCode){
                            drawCode(startX+(j-1/2)*space,startY+(i+1/2)*space,wide,gridArr[i][j],currentView)
                            drawCodeText(startX+(j-1/2)*space,startY+(i+1/2)*space,wide,gridArr[i][j],codeTextContainer.current)
                        }
                        
                        if(gridArr[i][j+1] && gridArr[i][j+1].position_flag!='-' && gridArr[i][j+1].position_flag!='#' && gridArr[i][j].position_flag!='#'){        
                            drawLine( [startX+(j-3/4)*space,startY+(i+1/2)*space,
                                                startX+(j+3/4)*space,startY+(i+1/2)*space],canvasSets.lineColor,currentView); 
                        }
                        if(gridArr[i+1] && gridArr[i+1][j] && gridArr[i+1][j].position_flag!='-' && gridArr[i+1][j].position_flag!='#' && gridArr[i][j].position_flag!='#'){
                            drawLine( [startX+(j-1/2)*space,startY+(i+1/2)*space,
                                                startX+(j-1/2)*space,startY+(i+3/2)*space],canvasSets.lineColor,currentView); 
                        }
                }
            }
        }
    }

    const initPath = (pathData:any)=>{ //绘制路径
        let codeList = codeTextContainer.current.children
        let pathList = pathData.paths
        let pathPartList = []
        if(pathList && pathList.length>0){
            for(let i=0;i+1<pathList.length;i++){
                let code1 = codeList.findIndex((item:any)=>{return item._text == pathList[i]})
                let code2 = codeList.findIndex((item:any)=>{return item._text == pathList[i+1]})
                if(code1!=-1 && code2!=-1){
                    pathPartList.push(drawLine( 
                        [
                            codeList[code1].position.x,codeList[code1].position.y,
                            codeList[code2].position.x,codeList[code2].position.y
                        ] ,
                        canvasSets.pathHighlightColor
                    )) //路线颜色
                }
            }
        }
        let containerPath = new PIXI.Container(); 
        if(hideAgvPathList.current.indexOf(pathData.agvId)!=-1){
            containerPath.visible = false
        }
        containerPath.name = pathData.agvId
        if(pathPartList.length>0){
            containerPath.addChild(...pathPartList)
        }
        pathContainer.current.addChild(containerPath)
    }

    const updateAgv = (agvInfo:any,agvIndex:number,agvId:string)=>{
        let spriteCache = agvContainer.current.children[agvIndex].children[0];
        let textCache = agvContainer.current.children[agvIndex].children[1];
        let xC = drawMapParams.startPosX+(agvInfo.position.num_x-1/2)*drawMapParams.space ;
        let yC = drawMapParams.startPosY+(drawMapParams.gridPointHeight - agvInfo.position.num_y - 1/2)*drawMapParams.space;
        // let rC = Math.PI/180 * agvInfo.agv_curr_abs_deg;
        let angle = 0 
        let rC = 0
        if(agvInfo.agv_type){
            angle = agvInfo.agv_curr_abs_deg;
            rC = Math.PI/180 * (angle-90);
        }else{
            angle = agvInfo.position.yaw;
            rC = Math.PI/180 * (-angle);
        }
 
        let objectAssign = {x:xC,y:yC};
        Object.assign(spriteCache,objectAssign);
        Object.assign(textCache,objectAssign);
        spriteCache.rotation = rC
        spriteCache.name = agvId;
        // spriteCache.scale.x=canvasSets.agvZoomEndScale / spriteCache.width
        // spriteCache.scale.y=canvasSets.agvZoomEndScale / spriteCache.width
        agvStateFilter(agvInfo,spriteCache,agvId,agvIndex)
        textCache.text = agvId.replace(/[^0-9]/ig,"");
    }

    const agvStateFilter = (agvInfo:any,sprite:any,agvId:any,agvIndex:any)=>{
        
        let dad=agvContainer.current.children[agvIndex]
        let newContainer=new PIXI.Container()
        if(!dad.children||!dad.children.length){
            return []
        }
        let oldOne = dad.children[0];
        let textCache = dad.children[1];
        let { dispatch } = props
        let state = agvInfo.agv_state
        dispatch({ 
            type: 'homeAndMonitor/getAgvByAgvId',
            payload:agvId,
            callback: (agvData:any) => {
                // console.log('state',state,'agvData',agvData,'agvInfo',agvInfo)
                if(agvData.missionId||pathList[agvId]){
                    if(codeIsChargePile(agvInfo.code).length>0){
                        if(agvData && agvData.missionType == "port_charge"){
                            let chargeAgvCache= new PIXI.Sprite(textResourcesCache[stateDC[3]].texture)
                            setNewAgv(chargeAgvCache,oldOne)
                            newContainer.addChild(chargeAgvCache)
                            newContainer.addChild(textCache)
                            agvContainer.current.removeChildAt(agvIndex)
                            agvContainer.current.addChildAt(newContainer,agvIndex)
                        }
                        return [];
                    }
                    if(agvInfo.agv_state===0){
                        let chargeAgvCache= new PIXI.Sprite(textResourcesCache[stateDC[1]].texture)
                        setNewAgv(chargeAgvCache,oldOne)
                        newContainer.addChild(chargeAgvCache)
                        newContainer.addChild(textCache)
                        agvContainer.current.removeChildAt(agvIndex)
                        agvContainer.current.addChildAt(newContainer,agvIndex)
                        return;
                    }
                    let chargeAgvCache= new PIXI.Sprite(textResourcesCache[stateDC[state]].texture)
                    setNewAgv(chargeAgvCache,oldOne)
                    newContainer.addChild(chargeAgvCache)
                    newContainer.addChild(textCache)
                    agvContainer.current.removeChildAt(agvIndex)
                    agvContainer.current.addChildAt(newContainer,agvIndex)
                    return;
                }
                if(agvInfo.agv_state===0&&pathList[agvId]&&pathList[agvId].length){
                    let currentPath=pathList[agvId]
                    let len=currentPath.length;
                    let finalPosition=currentPath[len-1]
                    if(finalPosition.code_num!==agvInfo.code){
                        let continuingAgvCache= new PIXI.Sprite(textResourcesCache[stateDC[1]].texture)
                        setNewAgv(continuingAgvCache,oldOne)
                        newContainer.addChild(continuingAgvCache)
                        newContainer.addChild(textCache)
                        agvContainer.current.removeChildAt(agvIndex)
                        agvContainer.current.addChildAt(newContainer,agvIndex)
                        return;
                    }
                }
                let chargeAgvCache= new PIXI.Sprite(textResourcesCache[stateDC[state]].texture)
                setNewAgv(chargeAgvCache,oldOne)
                newContainer.addChild(chargeAgvCache)
                newContainer.addChild(textCache)
                agvContainer.current.removeChildAt(agvIndex)
                agvContainer.current.addChildAt(newContainer,agvIndex)
            }
        });

    }

    const codeIsChargePile=(code:any)=>{
        return codesPortType.filter((item:any)=>{
            return item.code==code && 
                item.portType=="port_charge"
        })
    }
    const {drawCircle} = canvasSets;
    const agvClickEvent = (event:any)=>{
        hideAgvPath(event.target.name)
    }

    const setNewAgv=(newAgvSprite:any,oldOne:any)=>{
        newAgvSprite.anchor.set(0.5,0.5);
        newAgvSprite.x = oldOne.x;
        newAgvSprite.y = oldOne.y;
        newAgvSprite.scale.x = oldOne.scale.x
        newAgvSprite.scale.y = oldOne.scale.y
        newAgvSprite.name = oldOne.name;
        newAgvSprite.visible = oldOne.visible;
        newAgvSprite.rotation = oldOne.rotation;
        newAgvSprite.buttonMode = oldOne.buttonMode;
        newAgvSprite.interactive = oldOne.interactive;
        newAgvSprite.on('mousedown', (event:any)=>{agvClickEvent(event)})
    }
    const drawAgv = (texture:any,name?:string,agv_status?:any)=>{//绘制小车


        let containerNew = new PIXI.Container(); 
        agvSprite.current = new PIXI.Sprite(texture);
       
        agvSprite.current.anchor.set(0.5,0.5);
        agvSprite.current.x = 0;
        agvSprite.current.y = 0;
        
        // let scale = 32/agvSprite.current.width
        let scale =canvasSets.agvScaleItem /agvSprite.current.width
        // agvSprite.current.width = agvSprite.current.width*10
        // agvSprite.current.height = agvSprite.current.height*10
        agvSprite.current.scale.x = scale * canvasSets.agvScaleAxias.x;
        agvSprite.current.scale.y = scale * canvasSets.agvScaleAxias.y;
        agvSprite.current.name = name?name:'agv';
        // agvSprite.current.pivot.set(agvSprite.current.width/2, agvSprite.current.height/2);
        agvSprite.current.visible = true;
        agvSprite.current.rotation = 0;

        let textTemp = new PIXI.Text('',textStyle)
        textTemp.style.fontSize = agvSprite.current.width*10;
        textTemp.style.fill = canvasSets.agvTextColor;
        textTemp.text = '';
        textTemp.anchor.set(0.5,0.5);
        textTemp.scale.x = canvasSets.agvTextScale;
        textTemp.scale.y = canvasSets.agvTextScale;
        // textTemp.pivot.y = -textTemp.style.fontSize;       //没太搞懂
        // textTemp.pivot.y = textTemp.style.fontSize
        // textTemp.position.set(0,textTemp.style.fontSize/50);

        agvSprite.current.buttonMode = true;
        agvSprite.current.interactive = true;

        agvSprite.current.on('mousedown', (event:any)=>{agvClickEvent(event)})

        containerNew.addChild(agvSprite.current)
        containerNew.addChild(textTemp)
        agvContainer.current.addChild(containerNew)
        if(agvActiveScale!==-1){
            runHandleAgvSize(agvActiveScale)
        }
    }



    const hideAgvPath = (agvName:string)=>{
        let agvIdx = hideAgvPathList.current.findIndex((item:any)=>{return item === agvName})
        if(agvIdx===-1){
            hideAgvPathList.current.push(agvName)
            let hidePathItem = pixiApp.current.stage.children[currentFloor].children[1].children.find((item:any)=>{
                return item.name == agvName
            })
            if(hidePathItem){
                hidePathItem.visible = false
            }
        }else{
            hideAgvPathList.current.splice(agvIdx,1)
            let hidePathItem = pixiApp.current.stage.children[currentFloor].children[1].children.find((item:any)=>{
                return item.name == agvName
            })
            if(hidePathItem){
                hidePathItem.visible = true
            }
        }
    }

    const drawCode = (left:any,top:any,wide:any,dataCache:any,currentView:any)=>{
        // const { dispatch,getActionByCode } = props
        let graphicsTemp = new PIXI.Graphics(codePicTemp.current.geometry);
        graphicsTemp.position.set(left,top);  
        
        graphicsTemp.interactive  = true;
        graphicsTemp.buttonMode = true;
        graphicsTemp._data_cache = dataCache;
        // graphicsTemp.on('pointerdown', (event:any) => {
        //     if(rightCollapseFlag.current){
        //         handleCollapse();
        //     }
        //     // if(transformCache.current){
        //     //     backTransform();
        //     // }
        //     resetTextColor()
        //     if(curPoint.current){
        //         changeTextColor(curPoint.current._data_cache.code_num,'old');
        //     }
        //     if(event&&event.currentTarget){
        //         curPoint.current = event.currentTarget;
        //         changeTextColor(curPoint.current._data_cache.code_num,'new');
        //     }
        //     zoomCenter();
        //     getActionByCode([])
        //     if(dispatch&&event&&event.target&&event.target._data_cache){ 
        //         dispatch({
        //             type: 'mapAndCanvas/fetchActionByCode',
        //             payload: event.target._data_cache.code_num,
        //             callback: (codeData:any) => {
        //                 if(codeData && codeData.length>0){
        //                     getActionByCode(codeData)
        //                 }
        //             }
        //         })
        //     }
        // })
        currentView.addChild(graphicsTemp);
    }

    const backTransform = ()=>{
        let curTransform = transformCache.current
        let center = {x:curTransform.position.x,y:curTransform.position.y}
        initView.current.scale.x *= 1/curTransform.scale.x
        initView.current.scale.y *= 1/curTransform.scale.y
        initView.current.emit('zoomed', { viewport: initView.current, type: 'wheel' })
        initView.current.moveCenter(center)
        initView.current.emit('moved', { viewport: initView.current, type: 'wheel' })
    }

    const changeTextColor = (code:any,type:any)=>{
        let codeList = initView.current.children[2].children
        if(code){
            let curCode = codeList.find((item:any)=>{return item._text == code })
            if(curCode){
                if(type=='old'){//定位码值重绘颜色 非定位码值
                    curCode.style.fill = canvasSets.codeTextColor
                    curCode.style.stroke = canvasSets.codeTextColor
                }else{ // 定位码值重绘颜色 定位码值颜色
                    curCode.style.fill = canvasSets.codeTextHighlightColor
                    curCode.style.stroke = canvasSets.codeTextHighlightColor
                }
            }
        }
    }

    const zoomCenter = (target?:any)=>{
        let center = {x:'',y:''}
        if(target){
            center = {x:target.position.x,y:target.position.y}
        }else{
            center = {x:curPoint.current.position.x,y:curPoint.current.position.y}
        }
        let scaleX = Number(centerScale.current)/drawMapParams.gridPointWidth
        let scaleY = Number(centerScale.current)/drawMapParams.gridPointHeight
        let average = ((scaleX+scaleY)/2).toFixed(2)
        initView.current.scale.x = average
        initView.current.scale.y = average
        initView.current.emit('zoomed', { viewport: initView.current, type: 'wheel' })
        initView.current.moveCenter(center)
        initView.current.emit('moved', { viewport: initView.current, type: 'wheel' })
        transformCache.current = initView.current.transform
    }

    const drawCodeText = (left,top,wide,dataCache,currentView)=>{
        let textTemp = new PIXI.Text('',textStyle)
        textTemp.style.fontSize = wide*10;
        textTemp.text = dataCache.code_num;
        textTemp.anchor.set(0.5,0.5);
        textTemp.scale.x = 0.1;
        textTemp.scale.y = 0.1;
        textTemp.position.set(left, top);
        currentView.addChild(textTemp);

        // textTemp.current.text = dataCache.code_num;
        // textTemp.current.anchor.set(0.5,0.5);
        // textTemp.current.scale.x = 0.1;
        // textTemp.current.scale.y = 0.1;
        // textTemp.current.position.set(left, top);
        // currentView.addChild(textTemp.current);
    }

    const drawLine = (coords:any,color:any,currentView?:any) : (void | Object) => {
        let graphicsTemp = new PIXI.Graphics();
        graphicsTemp.beginFill(color);
        graphicsTemp.lineStyle(2, color, 6);
        graphicsTemp.moveTo(coords[0], coords[1]);
        graphicsTemp.lineTo(coords[2], coords[3]);
        graphicsTemp.closePath();
        graphicsTemp.endFill();
        
        if(currentView){
            currentView.addChild(graphicsTemp);
        }else{
            return graphicsTemp
        }
    }


    // used in maptools
    const handleReset = ()=>{
        pixiApp.current.stage.children[currentFloor].setTransform(0,0,1,1)
    }
    // used in maptools
    const handleZoom = (type:string)=>{
        let currentTransform =  initView.current.transform
        let center = initView.current.center
        if(type==='in'){
            currentTransform.scale.x *= 1.2
            currentTransform.scale.y *= 1.2
        }else if(type==='out'){
            currentTransform.scale.x /= 1.2
            currentTransform.scale.y /= 1.2
        };
        initView.current.emit('zoomed', { viewport: initView.current, type: 'wheel' })
        initView.current.moveCenter(center)
        initView.current.emit('moved', { viewport: initView.current, type: 'wheel' })
    }

    // used in maptools
    const handleCodeShow = ()=>{
        pixiApp.current.stage.children[currentFloor].children[2].visible=!pixiApp.current.stage.children[currentFloor].children[2].visible
    }

    // used in maptools
    const handlePathShow = ()=>{
        let hideArr = [] as Array<string>
        if(agvListArr.current){
            hideArr = Object.keys(agvListArr.current)
        }
        if(!hideAgv.current){
            hideAgvPathList.current = []
            pixiApp.current.stage.children[currentFloor].children[1].children.forEach((item:any)=>{
                item.visible = true
            })
        }else{
            hideAgvPathList.current = hideArr
        }
        hideAgv.current = !hideAgv.current
        pixiApp.current.stage.children[currentFloor].children[1].visible=hideAgv.current
    }
    
    const onBufferShow=()=>{
        let bp=document.getElementById('pixiBody')

        let relativeOffset=[0,0];
        relativeOffset[0]=bufferContainer.current.x;
        relativeOffset[1]=bufferContainer.current.y;
        // console.log('相对补偿',relativeOffset)
        let singleOffset=[...getOffsetNews(bp.children[0])]
        
        // console.log('独立补偿',singleOffset)
        let globalOffset=[singleOffset[0]+relativeOffset[0],singleOffset[1]+relativeOffset[1]-64];
        // console.log('全局补偿',globalOffset)
        drawBufferBg()
        drawBuffers()

        bufferContainer.current.interaction=true;
        // // 框选部分
        let bufferSelector=new PIXI.Graphics()
        let scmm=false
        let startInCon:any;
        let processInCon:any;
        let achieveInCon:any;
        function scRightmove(mm){
            if(scmm){
                let {movementX,movementY}=mm
                processInCon[0]+=movementX;
                processInCon[1]+=movementY;
                achieveInCon=[...processInCon];
                console.log('processInCon',processInCon);
                let argArr=[...startInCon,...achieveInCon,[0xff0000,0.3],bufferSelector]
                drawBufferRect(...argArr);
                let newCon=new PIXI.Container()
                newCon.addChild(bufferSelector);
                let oldConIndex=bufferContainer.current.children.findIndex(m=>m.hasSelected)
                if(oldConIndex!==-1){
                    bufferContainer.current.removeChildAt(oldConIndex)
                }
                newCon.hasSelected=true
                bufferContainer.current.addChild(newCon)
                console.log('mm',mm);
            }else{
                bp.removeEventListener('mousemove',scRightmove);
            }
        };
        bp.addEventListener('mousedown',function(md){
            if(md.button===2){
                console.log('rightdown')
        
                let {clientX,clientY}=md;
                startInCon=[clientX-globalOffset[0],clientY-globalOffset[1]];
                processInCon=[...startInCon];
                achieveInCon=[0,0];
                console.log('startInCon',startInCon);
                scmm=true;
    
                // _this.on('mousemove',scRightmove(event,startInCon,processInCon,achieveInCon,scmm))
                bp.addEventListener('mousemove',scRightmove)
    
            }
        })
        bp.addEventListener('mouseup',function(e){
            if(e.button===2){
                scmm=false;
                console.log('startInCon,processInCon,achieveInCon','['+startInCon[0]+','+startInCon[1]+'],['+achieveInCon[0]+','+achieveInCon[1]+']')
                // console.log('startInCon,achieveInCon',`${startInCon[0]},${startInCon[1]};${processInCon[0]},${startInCon[1]};${processInCon[0]},${processInCon[0]};${startInCon[0]},${processInCon[0]}`)
                bp.removeEventListener('mousemove',scRightmove);
            }
            // _this.off('mousemove',scRightmove);
        })
    };
    // used in maptools
    const handleBuffferAreaShow= ()=>{
        bufferContainer.current.visible=!bufferContainer.current.visible
        // console.log(bufferContainer.current.visible);
        if(bufferContainer.current.visible){
            onBufferShow()
            
        }else{

        }
    
    }
//  运动、真车调试 随时刷新重画 比例丢失
    // used in maptools // 码值字体大小
    const handleAgvSize = (agvSize:any)=>{
        if(agvActiveScale!==agvSize){
            setAgvActiveScale(agvSize)
        }
        agvContainer.current.children.forEach((item:any)=>{
            let spriteCache = item.children[0];
            let textCache = item.children[1];
            let scale = agvSize/spriteCache.width
            if(item.scale.x && item.scale.y){
                item.position.x = ( textCache.position.x + spriteCache.position.x ) /2
                item.position.y = ( textCache.position.y + spriteCache.position.y ) /2
                item.pivot.x = item.position.x;
                item.pivot.y = item.position.y;
                item.scale.x = scale;
                item.scale.y = scale;
            }else{
                item.position.x = ( textCache.position.x + spriteCache.position.x ) /2
                item.position.y = ( textCache.position.y + spriteCache.position.y ) /2
                item.pivot.x = item.position.x;
                item.pivot.y = item.position.y;
                item.scale.x = scale;
                item.scale.y = scale;
            }
            // let spriteCache = item.children[0];
            // let textCache = item.children[1];
            // let scale = agvSize/spriteCache.width
            // spriteCache.scale.x *= scale;
            // spriteCache.scale.y *= scale;
            // textCache.scale.x *= scale;
            // textCache.scale.y *= scale;
        })
    }
    function runHandleAgvSize(size:any){
        return handleAgvSize(size)
    }
    // used in maptools
    const handleCodeSize = (codeScale:any)=>{
        let ctontainer = pixiApp.current.stage.children[currentFloor].children[2]
        ctontainer.children.forEach((item:any)=>{
            item.scale.x = codeScale
            item.scale.y = codeScale
        })
    }

    // used in maptools
    const handleLocation = async(code:any,region:any)=>{
        let lcFloor = region.replace(/[^0-9]/ig,"")
        let sceneList = pixiApp.current.stage.children
        if(lcFloor==currentFloor){
            pointLocationCenter(code,sceneList,lcFloor)
        }else{
            await loadRegion(lcFloor)
            setTimeout(()=>{
                pointLocationCenter(code,sceneList,lcFloor)
            },500)
        }
    }

    // used in maptools
    const handlePortType = (portType:any)=>{
        portTypeFilter.current = portType
        filterCodeByPortType(portType)
    }

    // used in maptools
    const filterCodeByPortType = (filter:any)=>{
        let ctontainer = pixiApp.current.stage.children[currentFloor].children[2]
        if(filter && codesPortType.length>0){
            let codeListArr
            // let kr=[currentFloor] as Array<any>;
            if(filter==='port_door'){
                codeListArr = codesPortType.filter((item:any)=>{
                    // if(!kr.includes(item.portType)){kr.push(item.portType,item.portType.includes('door')?item.portType+'_kr_door':null)}
                    return item.portType.includes('door')})
                         .map((item:any)=>{return item.code})
            }else{
                codeListArr = codesPortType.filter((item:any)=>{
                    // if(!kr.includes(item.portType)){kr.push(item.portType)}
                    return item.portType === filter})
                         .map((item:any)=>{return item.code})
            };
            // console.log('kr',kr);
            ctontainer.children.forEach((item:any)=>{
                if(codeListArr.indexOf(Number(item._text))!==-1){
                    item.visible = true
                }else{
                    item.visible = false
                }
            })
        }else{
            if(previousPortType!==''){
                ctontainer.children.forEach((item:any)=>{
                    item.visible = true
                })
            }
        }
    }

    // used in maptools
    const handleCenterScale = (scale:any)=>{
        centerScale.current = scale
    }

    // const handleResize = (collapsed:boolean)=>{
    //     let domNode = document.getElementById('pixiBody')
    //     if(domNode){
    //         if(collapsed){
    //             domNode.style.width = ( domNode.clientWidth - 400 ) +'px'
    //         }else{
    //             domNode.style.width = ( domNode.clientWidth + 400 ) +'px'
    //         }
    //         domNode.childNodes.forEach((item:any)=>{
    //             item.style.width = domNode.clientWidth+"px"
    //             item.style.height = domNode.clientHeight+"px"
    //         })
    //     }
    // }

    const pointLocationCenter =(code:any,sceneList:any,floor:any)=>{
        resetTextColor()
        changeTextColor(code,'new')
        let codeList = sceneList[floor].children[2].children
        let curCode = codeList.find((item:any)=>{return item._text == code })
        if(curCode){
            zoomCenter(curCode)
        }
    }

    const resetTextColor = ()=>{//颜色
        pixiApp.current.stage.children[currentFloor].children[2].children.forEach((item:any)=>{
            item.style.fill = canvasSets.codeTextColor
            item.style.stroke = canvasSets.codeTextColor
        })
    }

    return (
        <div className={styles.mapCanvas} id="pixiBody" ref={pixiBody.current}>
        </div>
      );
    });

export default connect(
    ({
      loading,
      global,
      homeAndMonitor
    }: {
      loading: {
        effects: { [key: string]: boolean };
      };
      global:ConnectState,
      homeAndMonitor: StateType
    }) => ({
      collapsed:global.collapsed,
      pathList:homeAndMonitor.pathList || []
    }),
    null,
    null,
    {forwardRef:true}
  )(MapCanvas);

