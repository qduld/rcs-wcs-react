import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import styles from './style.less';
import * as PIXI from 'pixi.js';
// const PIXI = require('pixi.js')
// import "pixi-layers";
// window.PIXI = PIXI;
// import "pixi-spine";
// import "pixi-heaven";
// import { Heaven } from 'pixi-heaven';
import { Viewport } from 'pixi-viewport';
import { connect, Dispatch } from 'umi';
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
    currentFloor: number,
    dispatch: Dispatch,
    collapsed: Boolean,
    rightCollapse: Boolean,
    pathList: Array<object>,
    bufferAreaList:Array<any>,
    allAgvList: string,
    currentAgv: string,
    handleCurrentAgv: (agvId: string) => void,
    handleBufferListChange:()=>void,
    currentAgvObj: string,
    codesPortType: Array<object>,
    trackFlag: boolean,
    loadRegion: (currentTab: string) => void,
    handleCollapse: () => void
}

// React.FC<MapCanvasProps> = (props) => {      
// forwardRef((props:MapCanvasProps,ref) => {         
const MapCanvas = forwardRef((props: MapCanvasProps, ref) => {
    const { 
        gridDataArr, codeMapList, drawMapParams, currentFloor, 
        collapsed, rightCollapse, codesPortType,
        pathList, allAgvList, currentAgv, 
        currentAgvObj, trackFlag, handleCurrentAgv, loadRegion, 
        handleCollapse , bufferAreaList , handleBufferListChange 
    } = props;

    let pixiBody = useRef();
    let pixiApp = useRef();
    let initView = useRef();
    // let codeTextGroup = useRef();
    let bgContainer = useRef();
    let codeTextContainer = useRef();              //文字容器
    let pathContainer = useRef();                  //线路容器
    let agvContainer = useRef();
    let bufferContainer = useRef();                   // 缓冲区容器

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
    // let appRenderer = useRef<Object>();
    // let pathListCache = useRef([]);
    let centerScale = useRef<String | Number>(100);
    let hideAgv = useRef<Boolean>(true);
    let hideAgvPathList = useRef<Array<string>>([]);
    let agvListArr = useRef<Object>({});
    let [agvActiveScale, setAgvActiveScale] = useState<Number>(-1)


    let [textResourcesCache, setTextResourcesCache] = useState<any>(null)
    useImperativeHandle(ref, () => ({
        initApp: initApp,
        handleReset: handleReset,
        handleZoom: handleZoom,
        handleCodeShow: handleCodeShow,
        handlePathShow: handlePathShow,
        handleAgvSize: handleAgvSize,
        handleCodeSize: handleCodeSize,
        handleLocation: handleLocation,
        handlePortType: handlePortType,
        handleCenterScale: handleCenterScale,
        handleBuffferAreaShow:handleBuffferAreaShow,
        pixiRef: pixiBody
    }));
    let previousFloor:(number | any) = usePrevious(currentFloor);
    const handleBuffferAreaShow= ()=>{
        bufferContainer.current.visible=!bufferContainer.current.visible
        // console.log(bufferContainer.current.visible);
        if(bufferContainer.current.visible){
            onBufferShow()
            
        }else{

        }
    
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
        // drawBufferBg()
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
                // console.log('processInCon',processInCon);
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
                // console.log('mm',mm);
            }else{
                bp.removeEventListener('mousemove',scRightmove);
            }
        };
        bp.addEventListener('mousedown',function(md){
            if(md.button===2){
                // console.log('rightdown')
        
                let {clientX,clientY}=md;
                startInCon=[clientX-globalOffset[0],clientY-globalOffset[1]];
                processInCon=[...startInCon];
                achieveInCon=[0,0];
                // console.log('startInCon',startInCon);
                scmm=true;
    
                // _this.on('mousemove',scRightmove(event,startInCon,processInCon,achieveInCon,scmm))
                bp.addEventListener('mousemove',scRightmove)
    
            }
        })
        bp.addEventListener('mouseup',function(e){
            if(e.button===2){
                scmm=false;
                console.log('startInCon,processInCon,achieveInCon','['+startInCon[0]+','+startInCon[1]+'],['+achieveInCon[0]+','+achieveInCon[1]+']')
                bp.removeEventListener('mousemove',scRightmove);
            }
            // _this.off('mousemove',scRightmove);
        })
    };
    let previousAgv: (string | any) = usePrevious(currentAgvObj);
    let previousPortType: (string | any) = usePrevious(portTypeFilter);
    // componentDidMount
    useEffect(() => {
        initApp();
    }, []);
    // handle collapsed change
    useEffect(() => {
        if (gridDataArrCache.current) {
            pixiApp.current.resize();
            // initView.current.fit(true,pixiApp.current.view.width,pixiApp.current.view.height);
            // initView.current.fitWorld(true);
            // initViewPort();
        }
    }, [collapsed]);
    // handle rightCollapse change
    useEffect(() => {
        rightCollapseFlag.current = rightCollapse
        if (gridDataArrCache.current) {
            pixiApp.current.resize();
            // initView.current.fit(true,pixiApp.current.view.width,pixiApp.current.view.height);
            // initView.current.fitWorld(true);
            // initViewPort();
        }
    }, [rightCollapse]);

    useEffect(() => {
        if (pathList && pathList.length > 0 && initView.current) {
            // console.log('useEffect pathList',pathList)
            initPathBefore()
        }
    }, [pathList])

    const initPathBefore = () => {
        
        //每次清理线路容器
        let sceneList = pixiApp.current.stage.children
        if(!sceneList[currentFloor]||!sceneList[currentFloor].children[1]){return;}
        let parentContainer = sceneList[currentFloor]
        let pathCon = sceneList[currentFloor].children[1]
        parentContainer.removeChild(pathCon)
        pathContainer.current = new PIXI.Container()
        parentContainer.addChild(pathContainer.current)
        pathContainer.current.zIndex = 2;
        // if(!props.pathList||!props.pathList.length){
            canvasSets.fakePathList.forEach((item: any) => {
                initPath(item)
            })
            parentContainer.updateTransform();
        // }else{
        //     props.pathList.forEach((item: any) => {
        //         initPath(item)
        //     })
        //     parentContainer.updateTransform();
        // }
    }

    useEffect(() => {
        updateCurrentFloor()
    }, [allAgvList, agvTexture.current])

    const updateCurrentFloor = () => {
        if(!allAgvList){return}
        agvListArr.current = JSON.parse(allAgvList)
        bufferContainer.current.visible=false;
        onBufferShow();
        if (allAgvList !== '{}' && agvTexture.current) {
            agvContainer.current.visible = true
            agvContainer.current.children = []
            for (let agvId in agvListArr.current) {
                if (agvListArr.current[agvId].position.region === 'region' + currentFloor) {
                    drawAgv(agvTexture.current, agvListArr.current[agvId], agvListArr.current[agvId].agv_state)
                    updateAgv(agvListArr.current[agvId], agvContainer.current.children.length - 1, agvId)
                    // handleAgvSize(canvasSets.agvZoomEndScale)
                    // handleCodeSize(canvasSets.codeZoomEndScale);
                }
            }
            
        }
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
            drawBufferRect(
                ...m.coord[0],...m.coord[1],
                canvasSets.bufferAreaSquareColor,
                buffer
            )
            conNew.addChild(buffer)
            buffer.vitalName='buffer-cell'
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
    useEffect(() => {           //当不追踪时就重置地图缩放
        trackFlagCache.current = trackFlag
        if (!trackFlag && currentAgv) {
            handleCurrentAgv('')
            handleReset()
        }
    }, [trackFlag])

    useEffect(() => {
        if (gridDataArr.length > 0) {
            codePicTemp.current = drawCircle(drawMapParams.startWide);
            gridDataArrCache.current = gridDataArr;
            sceneSwitch();
        }
    }, [gridDataArr]);

    useEffect(() => {
        let currentStage = pixiApp.current.stage.children[currentFloor]
        if (currentStage) {
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

    const initApp = () => {
        if(pathList&&pathList.length){
            console.log('pathList&&pathList.length',pathList)
        }else{
            console.log('initApp no pathlist',pathList)
        }
        window.oncontextmenu=function(e){
            e.preventDefault();
        }
        let parentDom = document.querySelector('#pixiBody')
        if (parentDom) {
            let initViewOrg = {
                antialias: true,
                backgroundColor: canvasSets.backgroundColor,
                resizeTo: parentDom,
                width: parentDom.clientWidth,
                height: parentDom.clientHeight
            }
            if (!pixiApp.current) {
                pixiApp.current = new PIXI.Application(initViewOrg);
            } else if (
                pixiApp.current.view.width !== parentDom.clientWidth ||
                pixiApp.current.view.height !== parentDom.clientHeight
            ) {
                pixiApp.current = new PIXI.Application(initViewOrg);
            }
            // appRenderer.current = PIXI.autoDetectRenderer({width:parentDom.clientWidth, height:parentDom.clientHeight});
            parentDom.appendChild(pixiApp.current.view);

            bufferContainer.current=new PIXI.Container();
            bufferContainer.current.visible=false;
            bufferContainer.current.width=parentDom.clientWidth
            bufferContainer.current.height=parentDom.clientHeight
            // drawBufferBg()

            agvContainer.current = new PIXI.Container();

            agvContainer.current.visible = false;
            pixiApp.current.loader.add('agv0', canvasSets.agvStateImg['free'])
                .add('agv1', canvasSets.agvStateImg['running'])
                .add('agv2', canvasSets.agvStateImg['breakdown'])
                .add('agv3', canvasSets.agvStateImg['charging']);
            let stateImgName = stateDC[0];
            pixiApp.current.loader.load((loader: any, resources: any) => {
                if (!textResourcesCache) {
                    setTextResourcesCache(resources)
                }
                drawAgv(resources[stateImgName].texture);
                agvTexture.current = resources[stateImgName].texture
            });
            // let options = { crossOrigin: true };
            // var loader = new PIXI.Loader();
            // loader.add("fnt", "https://dump.stroep.nl/bitmapfonts/bitmatt_24_white.fnt", options); 
            // loader.add("png", "https://dump.stroep.nl/bitmapfonts/bitmatt_24_white_0.png", options);

            // loader.load(()=>{
            //     textTemp.current = new PIXI.BitmapText(' ', { font: drawMapParamsCache.current.startWide*10+'px bitmatt' });
            // });
            // const loader = new PIXI.Loader()
            // loader.add("fnt", "/assets/font/bitmap_text.fnt", options); 
            // loader.add("tga", "/assets/font/bitmap_text_0.tga", options);

            // loader.load(()=>{
            //     textTemp.current = new PIXI.BitmapText('1234', { font: '24px Arial' });
            // });
            // setGraphicsTemp(new PIXI.Graphics());
            // setTextTemp(new PIXI.Text('',textStyle));
            
        }
    }

    const sceneSwitch = () => {
        let sceneList = pixiApp.current.stage.children
        if (sceneList.length > 0) {
            sceneList.forEach((item: any) => {
                item.visible = false
            })
            if (sceneList[currentFloor]) {
                if (sceneList[currentFloor].children.length > 0) {
                    sceneList[currentFloor].setTransform(0, 0, 1, 1)
                    sceneList[currentFloor].visible = true
                    initView.current = sceneList[currentFloor]
                } else {
                    sceneList[currentFloor] = initViewPort(currentFloor)
                }
            } else {
                if (gridDataArrCache.current) {
                    for (let i = 0; i < currentFloor; i++) {
                        if (!sceneList[i]) {
                            pixiApp.current.stage.addChild(new Viewport());
                        }
                    }
                    sceneList[currentFloor] = initViewPort()
                }
            }
        } else {
            if (gridDataArrCache.current) {
                sceneList[currentFloor] = initViewPort()
            }
        }
    }

    const initViewPort = (index?: number) => {
        let { drawMapParams } = props
        // setGraphicsTemp(new PIXI.Graphics());
        let domWrapper = document.querySelector('#pixiBody')
        initView.current = new Viewport({
            screenWidth: domWrapper.clientWidth,
            screenHeight: domWrapper.clientHeight,
            // worldWidth: 1000,
            // worldHeight: 1000,
            divWheel: domWrapper,
            interaction: pixiApp.current.renderer.plugins.interaction
        })
        
        if(index || index==0){
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

        initView.current.addListener('zoomed-end', function (viewport: any) {
            transformCache.current = viewport.transform
            // handleAgvSize(canvasSets.agvZoomEndScale);
            // handleCodeSize(canvasSets.codeZoomEndScale);
        })

        initGrid(
            gridDataArrCache.current,
            drawMapParams.startPosX,
            drawMapParams.startPosY,
            drawMapParams.startWide,
            drawMapParams.space,
            bgContainer.current
        );
        initView.current.addChild(bgContainer.current);
        initView.current.addChild(pathContainer.current);
        initView.current.addChild(codeTextContainer.current);
        initView.current.addChild(agvContainer.current);
        initView.current.addChild(bufferContainer.current);
        
        initPathBefore()
        return initView.current
    }
    
    const initGrid = (gridArr: any, startX: any, startY: any, wide: any, space: any, currentView: any) => {         //绘制码点
        for (let i = 0; i < gridArr.length; i++) {
            for (let j = 0; j < gridArr[i].length; j++) {
                if (gridArr[i][j].position_flag != '-') {
                    if (gridArr[i][j].position_flag != '#' && gridArr[i][j]._isCode) {
                        drawCode(startX + (j - 1 / 2) * space, startY + (i + 1 / 2) * space, wide, gridArr[i][j], currentView)
                        drawCodeText(startX + (j - 1 / 2) * space, startY + (i + 1 / 2) * space, wide, gridArr[i][j], codeTextContainer.current)
                    }

                    if (gridArr[i][j + 1] && gridArr[i][j + 1].position_flag != '-' && gridArr[i][j + 1].position_flag != '#' && gridArr[i][j].position_flag != '#') {
                        drawLine([startX + (j - 3 / 4) * space, startY + (i + 1 / 2) * space,
                        startX + (j + 3 / 4) * space, startY + (i + 1 / 2) * space], canvasSets.lineColor, currentView);
                    }
                    if (gridArr[i + 1] && gridArr[i + 1][j] && gridArr[i + 1][j].position_flag != '-' && gridArr[i + 1][j].position_flag != '#' && gridArr[i][j].position_flag != '#') {
                        drawLine([startX + (j - 1 / 2) * space, startY + (i + 1 / 2) * space,
                        startX + (j - 1 / 2) * space, startY + (i + 3 / 2) * space], canvasSets.lineColor, currentView);
                    }
                }
            }
        }
    }
    // 依照路径码值列表查询码值绘图位置绘制路径
    const initPath = (pathData: any) => {
        let codeList = codeTextContainer.current.children
        let pathList = pathData.paths
        // 路径绘制元素列表
        let pathPartList = []
        if (pathList && pathList.length > 0) {
            for (let i = 0; i + 1 < pathList.length; i++) {
                let code1 = codeList.findIndex((item: any) => { return item._text == pathList[i] })
                let code2 = codeList.findIndex((item: any) => { return item._text == pathList[i + 1] })
                if (code1 != -1 && code2 != -1) {
                    pathPartList.push(
                        drawLine([codeList[code1].position.x, codeList[code1].position.y,
                        codeList[code2].position.x, codeList[code2].position.y],
                            canvasSets.pathHighlightColor))
                }
            }
        }
        // 当前绘制路径容器
        let containerPath = new PIXI.Container();
        if (hideAgvPathList.current.indexOf(pathData.agvId) != -1) {
            containerPath.visible = false
        }
        containerPath.name = pathData.agvId
        // 容器中写入路径
        if (pathPartList.length > 0) {
            containerPath.addChild(...pathPartList)
        }
        // 总路径图层写入当前绘制的路径
        pathContainer.current.addChild(containerPath)
    }

    const updateAgv = (agvInfo: any, agvIndex: number, agvId: string) => {
        let spriteCache = agvContainer.current.children[agvIndex].children[0];
        let textCache = agvContainer.current.children[agvIndex].children[1];
        let xC = drawMapParams.startPosX + (agvInfo.position.num_x - 1 / 2) * drawMapParams.space;
        let yC = drawMapParams.startPosY + (drawMapParams.gridPointHeight - agvInfo.position.num_y - 1 / 2) * drawMapParams.space;
        // let rC = Math.PI/180 * agvInfo.agv_curr_abs_deg;
        let angle = 0
        let rC = 0
        if (agvInfo.agv_type) {
            angle = agvInfo.agv_curr_abs_deg;
            rC = Math.PI / 180 * (angle - 90);
        } else {
            angle = agvInfo.position.yaw;
            rC = Math.PI / 180 * (-angle);
        }
        let objectAssign = { x: xC, y: yC };
        Object.assign(spriteCache, objectAssign);
        Object.assign(textCache, objectAssign);
        spriteCache.rotation = rC
        spriteCache.name = agvId;
        agvStateFilter(agvInfo, spriteCache, agvId, agvIndex)
        textCache.text = agvId.match(/\d+/g)[0];
        
    }
    const codeIsChargePile = (code: any) => {
        return codesPortType.filter((item: any) => {
            return item.code == code &&
                item.portType == "port_charge"
        })
    }
    const agvStateFilter = (agvInfo: any, sprite: any, agvId: any, agvIndex: any) => {

        let dad = agvContainer.current.children[agvIndex]
        if (!dad.children || !dad.children.length) {
            return []
        }
        let newContainer = new PIXI.Container()
        let oldOne = dad.children[0];
        let textCache = dad.children[1];
        let { dispatch } = props
        let state = agvInfo.agv_state
        dispatch({
            type: 'homeAndMonitor/getAgvByAgvId',
            payload:agvId,
            callback: (agvData:any) => {
                if(agvData.missionId||pathList[agvId]){
                    if(codeIsChargePile(agvInfo.code).length>0){
                        if(agvData && agvData.missionType == "port_charge"){
                            let chargeAgvCache= new PIXI.Sprite(textResourcesCache[stateDC[3]].texture)
                            setNewAgv(chargeAgvCache,oldOne)
                            newContainer.addChild(chargeAgvCache)
                            newContainer.addChild(textCache)
                            agvContainer.current.removeChildAt(agvIndex)
                            agvContainer.current.addChildAt(newContainer, agvIndex)
                        }
                        return [];
                    }
                    if (agvInfo.agv_state === 0) {
                        let chargeAgvCache = new PIXI.Sprite(textResourcesCache[stateDC[1]].texture)
                        setNewAgv(chargeAgvCache, oldOne)
                        newContainer.addChild(chargeAgvCache)
                        newContainer.addChild(textCache)
                        agvContainer.current.removeChildAt(agvIndex)
                        agvContainer.current.addChildAt(newContainer, agvIndex)
                        return;
                    }
                    let chargeAgvCache = new PIXI.Sprite(textResourcesCache[stateDC[state]].texture)
                    setNewAgv(chargeAgvCache, oldOne)
                    newContainer.addChild(chargeAgvCache)
                    newContainer.addChild(textCache)
                    agvContainer.current.removeChildAt(agvIndex)
                    agvContainer.current.addChildAt(newContainer, agvIndex)
                    return;
                }
                if (agvInfo.agv_state === 0 && pathList[agvId] && pathList[agvId].length) {
                    let currentPath = pathList[agvId]
                    let len = currentPath.length;
                    let finalPosition = currentPath[len - 1]
                    if (finalPosition.code_num !== agvInfo.code) {
                        let continuingAgvCache = new PIXI.Sprite(textResourcesCache[stateDC[1]].texture)
                        setNewAgv(continuingAgvCache, oldOne)
                        newContainer.addChild(continuingAgvCache)
                        newContainer.addChild(textCache)
                        agvContainer.current.removeChildAt(agvIndex)
                        agvContainer.current.addChildAt(newContainer, agvIndex)
                        return;
                    }
                }
                let chargeAgvCache = new PIXI.Sprite(textResourcesCache[stateDC[state]].texture)
                setNewAgv(chargeAgvCache, oldOne)
                newContainer.addChild(chargeAgvCache)
                newContainer.addChild(textCache)
                agvContainer.current.removeChildAt(agvIndex)
                agvContainer.current.addChildAt(newContainer, agvIndex)
            }
        });

    }
    const { drawCircle } = canvasSets
    const setNewAgv = (newAgvSprite: any, oldOne: any) => {
        newAgvSprite.anchor.set(0.5, 0.5);
        newAgvSprite.x = oldOne.x;
        newAgvSprite.y = oldOne.y;
        newAgvSprite.scale.x = oldOne.scale.x
        newAgvSprite.scale.y = oldOne.scale.y
        newAgvSprite.name = oldOne.name;
        newAgvSprite.visible = oldOne.visible;
        newAgvSprite.rotation = oldOne.rotation;
        newAgvSprite.buttonMode = oldOne.buttonMode;
        newAgvSprite.interactive = oldOne.interactive;
        newAgvSprite.on('mousedown', (event: any) => { agvClickEvent(event) })
    }
    const drawAgv = (texture: any, name?: string, agv_status?: any) => {
        let containerNew = new PIXI.Container();
        agvSprite.current = new PIXI.Sprite(texture);
        agvSprite.current.anchor.set(0.5, 0.5);
        agvSprite.current.x = 0;
        agvSprite.current.y = 0;
        // let scale = 32/agvSprite.current.width
        let scale = canvasSets.agvScaleItem / agvSprite.current.width
        // agvSprite.current.width = agvSprite.current.width*10
        // agvSprite.current.height = agvSprite.current.height*10
        agvSprite.current.scale.x = scale * canvasSets.agvScaleAxias.x;
        agvSprite.current.scale.y = scale * canvasSets.agvScaleAxias.y;
        agvSprite.current.name = name ? name : 'agv';
        // agvSprite.current.pivot.set(agvSprite.current.width/2, agvSprite.current.height/2);
        agvSprite.current.visible = true;
        agvSprite.current.rotation = 0;

        let textTemp = new PIXI.Text('', textStyle)
        textTemp.style.fontSize = agvSprite.current.width * 10;
        textTemp.style.fill = canvasSets.agvTextColor;
        textTemp.text = '';
        textTemp.anchor.set(0.5, 0.5);
        textTemp.scale.x = canvasSets.agvTextScale;
        textTemp.scale.y = canvasSets.agvTextScale;
        // textTemp.pivot.y = -textTemp.style.fontSize;       //没太搞懂
        // textTemp.pivot.y = textTemp.style.fontSize
        // textTemp.position.set(0,textTemp.style.fontSize/50);

        agvSprite.current.buttonMode = true;
        agvSprite.current.interactive = true;

        agvSprite.current.on('mousedown', (event: any) => { agvClickEvent(event) })

        containerNew.addChild(agvSprite.current)
        containerNew.addChild(textTemp)
        agvContainer.current.addChild(containerNew)
        if (agvActiveScale !== -1) {
            runHandleAgvSize(agvActiveScale)
        }
    }

    const agvClickEvent = (event: any) => {
        hideAgvPath(event.target.name)
    }
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

    const hideAgvPath = (agvName: string) => {
        let agvIdx = hideAgvPathList.current.findIndex((item: any) => { return item === agvName })
        if (agvIdx === -1) {
            hideAgvPathList.current.push(agvName)
            let hidePathItem = pixiApp.current.stage.children[currentFloor].children[1].children.find((item: any) => {
                return item.name == agvName
            })
            if (hidePathItem) {
                hidePathItem.visible = false
            }
        } else {
            hideAgvPathList.current.splice(agvIdx, 1)
            let hidePathItem = pixiApp.current.stage.children[currentFloor].children[1].children.find((item: any) => {
                return item.name == agvName
            })
            if (hidePathItem) {
                hidePathItem.visible = true
            }
        }
    }


    const backTransform = () => {
        let curTransform = transformCache.current
        let center = { x: curTransform.position.x, y: curTransform.position.y }
        initView.current.scale.x *= 1 / curTransform.scale.x
        initView.current.scale.y *= 1 / curTransform.scale.y
        initView.current.emit('zoomed', { viewport: initView.current, type: 'wheel' })
        initView.current.moveCenter(center)
        initView.current.emit('moved', { viewport: initView.current, type: 'wheel' })
    }

    const changeTextColor = (code: any, type: any) => {
        let codeList = initView.current.children[2].children
        if (code) {
            let curCode = codeList.find((item: any) => { return item._text == code })
            if (curCode) {
                if (type == 'old') {
                    curCode.style.fill = canvasSets.codeTextColor
                    curCode.style.stroke = canvasSets.codeTextColor
                } else {
                    curCode.style.fill = canvasSets.codeTextHighlightColor
                    curCode.style.stroke = canvasSets.codeTextHighlightColor
                }
            }
        }
    }

    const zoomCenter = (target?: any) => {
        let center = { x: '', y: '' }
        if (target) {
            center = { x: target.position.x, y: target.position.y }
        } else {
            center = { x: curPoint.current.position.x, y: curPoint.current.position.y }
        }
        let scaleX = Number(centerScale.current) / drawMapParams.gridPointWidth
        let scaleY = Number(centerScale.current) / drawMapParams.gridPointHeight
        let average = ((scaleX + scaleY) / 2).toFixed(2)
        initView.current.scale.x = average
        initView.current.scale.y = average
        initView.current.emit('zoomed', { viewport: initView.current, type: 'wheel' })
        initView.current.moveCenter(center)
        initView.current.emit('moved', { viewport: initView.current, type: 'wheel' })
        transformCache.current = initView.current.transform
    }

    const drawCode = (left: any, top: any, wide: any, dataCache: any, currentView: any) => {
        let graphicsTemp = new PIXI.Graphics(codePicTemp.current.geometry);
        graphicsTemp.position.set(left, top);

        graphicsTemp.interactive = true;
        graphicsTemp.buttonMode = true;
        graphicsTemp._data_cache = dataCache;

        currentView.addChild(graphicsTemp);
    }
    const drawCodeText = (left, top, wide, dataCache, currentView) => {
        let textTemp = new PIXI.Text('', textStyle)
        textTemp.style.fontSize = wide * 10;
        textTemp.text = dataCache.code_num;
        textTemp.anchor.set(0.5, 0.5);
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

    const drawLine = (coords: any, color: any, currentView?: any): (void | Object) => {
        let graphicsTemp = new PIXI.Graphics();
        graphicsTemp.beginFill(color);
        graphicsTemp.lineStyle(2, color, 6);
        graphicsTemp.moveTo(coords[0], coords[1]);
        graphicsTemp.lineTo(coords[2], coords[3]);
        graphicsTemp.closePath();
        graphicsTemp.endFill();

        if (currentView) {
            currentView.addChild(graphicsTemp);
        } else {
            return graphicsTemp
        }
    }

    const handleReset = () => {
        pixiApp.current.stage.children[currentFloor].setTransform(0, 0, 1, 1)
    }

    const handleZoom = (type: string) => {
        let currentTransform = initView.current.transform
        let center = initView.current.center
        if (type === 'in') {
            currentTransform.scale.x *= 1.2
            currentTransform.scale.y *= 1.2
        } else if (type === 'out') {
            currentTransform.scale.x /= 1.2
            currentTransform.scale.y /= 1.2
        }
        initView.current.emit('zoomed', { viewport: initView.current, type: 'wheel' })
        initView.current.moveCenter(center)
        initView.current.emit('moved', { viewport: initView.current, type: 'wheel' })
    }

    const handleCodeShow = () => {
        pixiApp.current.stage.children[currentFloor].children[2].visible = !pixiApp.current.stage.children[currentFloor].children[2].visible
    }

    const handlePathShow = () => {
        let hideArr = [] as Array<string>
        if (agvListArr.current) {
            hideArr = Object.keys(agvListArr.current)
        }
        if (!hideAgv.current) {
            hideAgvPathList.current = []
            pixiApp.current.stage.children[currentFloor].children[1].children.forEach((item: any) => {
                item.visible = true
            })
        } else {
            hideAgvPathList.current = hideArr
        }
        hideAgv.current = !hideAgv.current
        pixiApp.current.stage.children[currentFloor].children[1].visible = hideAgv.current
    }

    const handleAgvSize = (agvSize: any) => {
        if (agvActiveScale !== agvSize) {
            setAgvActiveScale(agvSize)
        }
        agvContainer.current.children.forEach((item: any) => {
            let spriteCache = item.children[0];
            let textCache = item.children[1];
            
            let scale = agvSize / spriteCache.width
            if (item.scale.x && item.scale.y) {
                item.position.x = (textCache.position.x + spriteCache.position.x) / 2
                item.position.y = (textCache.position.y + spriteCache.position.y) / 2
                item.pivot.x = item.position.x;
                item.pivot.y = item.position.y;
                item.scale.x = scale;
                item.scale.y = scale;
            } else {
                item.position.x = (textCache.position.x + spriteCache.position.x) / 2
                item.position.y = (textCache.position.y + spriteCache.position.y) / 2
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
    function runHandleAgvSize(size: any) {
        return handleAgvSize(size)
    }
    const handleCodeSize = (codeScale: any) => {
        if(
            !pixiApp.current ||
            !pixiApp.current.stage ||
            !pixiApp.current.stage.children ||
            !pixiApp.current.stage.children[currentFloor]
        ){
            return;
        }
        let ctontainer = pixiApp.current.stage.children[currentFloor].children[2]
        ctontainer.children.forEach((item: any) => {
            item.scale.x = codeScale
            item.scale.y = codeScale
        })
    }

    const handleLocation = async (code: any, region: any) => {
        let lcFloor = region.slice(-1)
        let sceneList = pixiApp.current.stage.children
        if (lcFloor == currentFloor) {
            pointLocationCenter(code, sceneList, lcFloor)
        } else {
            await loadRegion(lcFloor)
            setTimeout(() => {
                pointLocationCenter(code, sceneList, lcFloor)
            }, 500)
        }
    }

    const handlePortType = (portType: any) => {
        portTypeFilter.current = portType
        filterCodeByPortType(portType)
    }

    const filterCodeByPortType = (filter:any)=>{
 
        let ctontainer = pixiApp.current.stage.children[currentFloor].children[2]
        if(filter && codesPortType.length>0){
            let codeListArr=null;
            if(filter==='port_door'){
                codeListArr = codesPortType.filter((item:any)=>{return item.portType.includes('door')})
                         .map((item:any)=>{return item.code})
            }else{
                codeListArr = codesPortType.filter((item:any)=>{return item.portType === filter})
                         .map((item:any)=>{return item.code})
            }
            ctontainer.children.forEach((item:any)=>{
                if(codeListArr.indexOf(Number(item._text))!==-1){
                    item.visible = true
                } else {
                    item.visible = false
                }
            })
        } else {
            if (previousPortType !== '') {
                ctontainer.children.forEach((item: any) => {
                    item.visible = true
                })
            }
        }
    }

    const handleCenterScale = (scale: any) => {
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

    const pointLocationCenter = (code: any, sceneList: any, floor: any) => {
        resetTextColor()
        changeTextColor(code, 'new')
        let codeList = sceneList[floor].children[2].children
        let curCode = codeList.find((item: any) => { return item._text == code })
        if (curCode) {
            zoomCenter(curCode)
        }
    }

    const resetTextColor = () => {
        pixiApp.current.stage.children[currentFloor].children[2].children.forEach((item: any) => {
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
        global: ConnectState,
        homeAndMonitor: StateType
    }) => ({
        collapsed: global.collapsed,
        pathList: homeAndMonitor.pathList || []
    }),
    null,
    null,
    { forwardRef: true }
)(MapCanvas);

