import React, { Component } from 'react';
import { connect, Dispatch } from 'umi';
import { Row , Col } from 'antd';
import  MapContext from './context';
import { StateType , MapStateInit  } from './data.d';

import MapCanvas from './components/MapCanvas';
import MapSideBar from './components/MapSideBar';
import MapTabs from '@/components/MapPartComponents/MapTabs';
import MapTools from '@/components/MapPartComponents/MapTools';

interface MapProps {
  loading: boolean
  dispatch: Dispatch
  mapAndMonitor: StateType
}

interface codeArrObj{
    x?:number,g_x?:number,y?:number,g_y?:number,position_flag?:string | undefined,_editable?:boolean,_isCode?:boolean
}

class MapMonitor extends Component<MapProps> {
    mapWrapper:any
    mapCanvasRef=React.createRef()
    mapTabsRef=React.createRef()

    state = MapStateInit

    constructor(props: MapProps) {
        super(props);
        this.loadTabData = this.loadTabData.bind(this);
        this.reloadTabFromCanvas = this.reloadTabFromCanvas.bind(this);
        this._setActionByCode = this._setActionByCode.bind(this);
        this._handleTrackFlag = this._handleTrackFlag.bind(this);
        this._changeRightCollapse = this._changeRightCollapse.bind(this);
    }

    componentDidMount() {
        this.initCanvasHeight();   //首先要定义画布大小
        const { dispatch } = this.props;
        dispatch({
            type: 'mapAndMonitor/fetchRcsMap',
            callback: (dmCodeList:any,gridPointData:any) => {
                this.setState({
                    gridMapData : gridPointData,
                    codeMapData : dmCodeList.positions
                })
                this.orgRegionsPointArr(dmCodeList.positions);
                this.setEditableTabs();
                this.orgGirdPosForCode();
                this.orgFloorsData(this.state.currentFloor);
            }
        });
        this.getAllDDL();
        this.getCodePortType();
    }

    getAllDDL=()=>{               //获取所有动作
        const {dispatch} = this.props;
        dispatch({
            type: 'mapAndMonitor/fetchAllDDL',
            callback: (resp:any) => {
                if(resp){
                    this.setState({
                        allDDL:resp
                    })
                }
            }
        });
    }

    getCodePortType=()=>{
        const {dispatch} = this.props;
        dispatch({
            type: 'mapAndMonitor/fetchAllCodePortType',
            callback: (resp:any) => {
                if(resp){
                    this.setState({
                        allCodePortType:resp
                    })
                }
            }
        });
    }

    loadTabData(currentTab:any){
        this.setState({
            activeTab:currentTab,
            currentFloor:currentTab
        })
        this.orgFloorsData(currentTab);
    }

    reloadTabFromCanvas(currentTab:any){
        this.mapTabsRef.current.handleTabChange(currentTab)
        this.loadTabData(currentTab)
    }

    initCanvasHeight(){
        this.mapWrapper.style.height = document.body.clientHeight- this.mapWrapper.getBoundingClientRect().top + 'px';
    }

    setEditableTabs(){
        let { 
            regionsPointArr,
            editableTabs
        } = this.state
        let tabObj = { title:'',name:'',content:'', isActive:''}
        for(let i =0 ;i<regionsPointArr.length;i++){
            if(!editableTabs[i]){
                if(i===0){
                    tabObj = { title:'R '+(i+1),name: i+1+'',content: 'R ' + (i+1) + 'content', isActive:'primary'}  
                }else{
                    tabObj = { title:'R '+(i+1),name: i+1+'',content: 'R ' + (i+1) + 'content', isActive:'default'}
                }
                editableTabs.push(tabObj)
            }
        }
    }

    orgRegionsPointArr(allCodeList:[]){
        let { regionsPointArr } = this.state
        allCodeList.forEach( (codeIte:{ region:String ,position_flag:String} )=>{
            let regionKey = Number(codeIte.region.replace(/[^0-9]/ig,""));
            if(!regionsPointArr[regionKey]){
                regionsPointArr[regionKey] = [];
            }
            if(codeIte.position_flag!="-"){
                regionsPointArr[regionKey].push(codeIte);
            } 
        })

        this.setState({
            regionsPointArr
        })
    }

    orgGirdPosForCode(){
        let { regionsPointArr } = this.state
        regionsPointArr.forEach((codeArrList:Array<codeArrObj>)=>{
            let xList = [],yList=[];
            for(let i=0;i<codeArrList.length;i++){
                if(xList.indexOf(codeArrList[i].x)==-1){
                    xList.push(codeArrList[i].x)
                }
                if(yList.indexOf(codeArrList[i].y)==-1){
                    yList.push(codeArrList[i].y)
                }
            }
            xList.sort((bef:any,nex:any)=>{return bef - nex;})
            yList.sort((bef:any,nex:any)=>{return bef - nex;})
            for(let u=0;u<codeArrList.length;u++){
                for(let v = 0;v<xList.length;v++){
                    if(codeArrList[u].x == xList[v]){
                        codeArrList[u].g_y = v;
                    }
                }
                for(let w = 0;w<yList.length;w++){
                    if(codeArrList[u].y == yList[w]){
                        codeArrList[u].g_x = yList.length-1-w;
                    }
                }
                if(codeArrList[u].position_flag == '-' || codeArrList[u].position_flag == '#'){
                    codeArrList[u]._editable = false;
                }else{
                    codeArrList[u]._editable = true;
                }   
                codeArrList[u]._isCode = true;  
            }
        })
    }

    orgFloorsData(curFloor:string | number){   
        const { gridMapData,regionsPointArr } = this.state  
        this.orgDrawMapParams( gridMapData['region'+curFloor] );
        // this.curFloorPorts = this.orgGirdPosForPort(this.regionsPortArr[curFloor],this.regionsPointArr[curFloor]);
        this.setState({
        curFloorGrids:this.unionCodeAndGrid(regionsPointArr[curFloor+''],this.transMapsMinus(gridMapData['region'+curFloor].terrain))
        })
    }

    orgDrawMapParams(curFloor:{width:number,height:number}){       //适应配置 
        const { drawMapParams } = this.state;
        let mapParamsCache = Object.assign({},drawMapParams);
        mapParamsCache.gridPointWidth = curFloor.width;
        mapParamsCache.gridPointHeight = curFloor.height;
        let wrapper = document.getElementById('pixiBody');
        let mapsW = mapParamsCache.space*curFloor.width+2*mapParamsCache.startPosX;
        let mapsH = mapParamsCache.space*curFloor.height+2*mapParamsCache.startPosY;
        mapParamsCache.canvasWidth =  wrapper.clientWidth;
        mapParamsCache.canvasHeight = wrapper.clientHeight;

                mapParamsCache.scaleProp= this.computeScaleProp(mapParamsCache.canvasWidth,mapParamsCache.canvasHeight,mapsW,mapsH)
                mapParamsCache.mapWidth= mapsW*mapParamsCache.scaleProp;
                mapParamsCache.mapHeight= mapsH*mapParamsCache.scaleProp;     
                mapParamsCache.startPosX = (mapParamsCache.canvasWidth-mapParamsCache.mapWidth+2*mapParamsCache.startPosX*mapParamsCache.scaleProp )/2; 
                mapParamsCache.startPosY = (mapParamsCache.canvasHeight-mapParamsCache.mapHeight+2*mapParamsCache.startPosY*mapParamsCache.scaleProp )/2;
                mapParamsCache.space = mapParamsCache.space*mapParamsCache.scaleProp;
                mapParamsCache.startWide = mapParamsCache.startWide*mapParamsCache.scaleProp;
                this.setState({
                    drawMapParamsCache:mapParamsCache
                })
    }

    computeScaleProp(wrapperW:number,wrapperH:number,mapsW:number,mapsH:number){             //计算缩放比例
        let lprop=(wrapperW/mapsW)
        let cprop=(wrapperH/mapsH)
        return lprop>=cprop?cprop:lprop
    }

    unionCodeAndGrid(codeList:Array<codeArrObj>,gridList:Array<Array<codeArrObj>>){
        for(let i =0;i<codeList.length;i++){
            inLoop:
            for(let j=0;j<gridList.length;j++){
                for(let k=0;k<gridList[j].length;k++){
                    if(codeList[i].g_x == gridList[j][k].g_x && codeList[i].g_y == gridList[j][k].g_y){
                        if(codeList[i].position_flag == '-' || codeList[i].position_flag == '#'){
                            codeList[i].position_flag = gridList[j][k].position_flag
                        }
                        Object.assign(gridList[j][k],codeList[i]);
                        break inLoop;
                    }
                }
            }
        }
        return gridList
    }

    transMapsMinus(mapList:[]){             //转变减号地图为正常地图
        let allMapList=[] as Array<Array<string | undefined>>
        mapList.forEach((item:string)=>{
            allMapList.push(item.split(''))
        })
        let outArrLen=allMapList.length
        let inArrLen=allMapList[0].length
        let effStrArr=['0','1','2','3','4']
        outLoop:
        for(let j=0;j<outArrLen;j++){
            for(let z=0;z<inArrLen;z++){
                if(allMapList[j][z]=='-'){
                    if(j==0){
                        if(z==0){
                            let effStr=effStrArr.find(item=>(item==allMapList[j][z+1] && item==allMapList[j+1][z]) )
                            if( effStr ){
                                allMapList[j][z]= effStr
                            }else{
                                allMapList[j][z]='-'
                            }
                        }else if(z==inArrLen-1){
                            let effStr=effStrArr.find(item=>(item==allMapList[j+1][z] && item==allMapList[j][z-1]) )
                            if( effStr ){
                                allMapList[j][z]= effStr
                            }else{
                                allMapList[j][z]='-'
                            }
                        }else{
                            let effStr=effStrArr.find(item=>( item==allMapList[j][z-1] && item==allMapList[j][z+1]) )
                            if( effStr ){
                                allMapList[j][z]= effStr
                            }else{
                                allMapList[j][z]='-'
                            }
                        }
                    }else if(j==outArrLen-1){
                        if(z==0){
                            let effStr=effStrArr.find(item=>(item==allMapList[j][z+1] && item==allMapList[j-1][z]) )
                            if( effStr ){
                                allMapList[j][z]= effStr
                            }else{
                                allMapList[j][z]='-'
                            }
                        }else if(z==inArrLen-1){
                            let effStr=effStrArr.find(item=>(item==allMapList[j][z-1] && item==allMapList[j-1][z]) )
                            if( effStr ){
                                allMapList[j][z]= effStr
                            }else{
                                allMapList[j][z]='-'
                            }
                        }else{
                            let effStr=effStrArr.find(item=>(item==allMapList[j][z-1] && item==allMapList[j][z+1]) )
                            if( effStr ){ 
                                allMapList[j][z]= effStr
                            }else{
                                allMapList[j][z]='-'
                            }
                        }
                    }else{
                        let effStr=null 
                            if( (effStrArr.find(item=>item==allMapList[j][z-1]) 
                                && effStrArr.find(item=>item==allMapList[j][z-1])==effStrArr.find(item=>item==allMapList[j][z+1])) ){
                                effStr=effStrArr.find(item=>item==allMapList[j][z-1])
                            }else if( (effStrArr.find(item=>item==allMapList[j-1][z]) 
                                && effStrArr.find(item=>item==allMapList[j-1][z])==effStrArr.find(item=>item==allMapList[j+1][z])) ){
                                effStr=effStrArr.find(item=>item==allMapList[j+1][z])
                            }else{
                                allMapList[j][z]='-'
                                continue;
                            }
                            allMapList[j][z]= effStr
                    }
                }
            }
        }
        let allMapObjList = [] as Array<Array<codeArrObj>>
        allMapList.forEach((rowArr,rowIdx)=>{
            let rowArrCache = [] as Array<codeArrObj>
            rowArr.forEach((colArr,colIdx)=>{
                rowArrCache.push({position_flag:colArr,g_x:rowIdx,g_y:colIdx})
            })
            allMapObjList.push(rowArrCache)
        })
        return allMapObjList
    }

    _setActionByCode(actionResp:any){
        this.setState({
            actionList:actionResp
        })
    }

    updateAgvList(){         //持续获取AGV位置
        const { dispatch } = this.props
        const that = this
        if(dispatch){
                dispatch({
                    type: 'mapAndMonitor/fetchDeviceList',
                    callback: (deviceList:any) => {
                        // console.log('updateAgvList',deviceList)
                        if(this.state.currentAgv && deviceList.Payload.agv_list[this.state.currentAgv]){
                            this.setState({
                                agvList : deviceList.Payload.agv_list,
                                currentAgvObj : JSON.stringify(deviceList.Payload.agv_list[this.state.currentAgv])
                            })
                        }else{
                            this.setState({
                                agvList : deviceList.Payload.agv_list,
                                currentAgvObj : ""
                            })
                        }
                        setTimeout(()=>{
                            that.updateAgvList()
                        },1000)
                    }
                })
        }
    }

    updatePathList(value:any,agvId:string){
        let pathListCache = JSON.parse(JSON.stringify(this.state.pathList))
        pathListCache[agvId] = value
        // console.log('plc',pathListCache);debugger;
        this.setState({
            pathList:pathListCache
        })
    }

    _handleTrackFlag(){
        // if(this.state.trackFlag){this.mapCanvasRef.current.handleReset()}
        let flag = this.state.trackFlag
        this.setState({ trackFlag:!flag })
    } 

    _changeRightCollapse(){
        let domNode = document.getElementById('pixiBody')
        if(domNode){
            if(this.state.rightCollapse){
                domNode.style.width = ( domNode.clientWidth - 400 ) +'px'
            }else{
                domNode.style.width = ( domNode.clientWidth + 400 ) +'px'
            }
            domNode.childNodes.forEach((item:any)=>{
                item.style.width = domNode.clientWidth+"px"
                item.style.height = domNode.clientHeight+"px"
            })
        }
        this.orgFloorsData(this.state.currentFloor);
        this.setState({ rightCollapse : !this.state.rightCollapse })
    }
    handleBufferListChange=(v:any)=>{
        this.setState({
            bufferAreaList:v
        })
    }
    render() {
        return (
                <Row>
                    <Col xl={24} lg={24} md={24} sm={24} xs={24} style={{marginTop:10}}>
                        <div ref = {el => {this.mapWrapper = el}}>
                        <MapContext.Provider value={{
                            updatePathList:(value:any,agvId:string)=>{this.updatePathList(value,agvId)},
                            updateAgvList:()=>{this.updateAgvList()},
                            updateCurrentAgv:(value:any)=>{this.setState({currentAgv:value})},
                            updateActionList:(value:any)=>{this.setState({actionList:value})},
                            updateTrackFlag:(value:any)=>{this.setState({trackFlag:value})},
                            updateMonitorAgvList:(value:any)=>{this.setState({monitorAgvList:value})},
                            currentRegion:this.state.activeTab,
                            allDDL:this.state.allDDL,
                            codeMapList:this.state.codeMapData,
                            monitorAgvList:this.state.monitorAgvList
                            }}
                        >
                            <MapTabs
                                tabs={this.state.editableTabs}
                                activeTab={this.state.activeTab}
                                setActiveTab={this.loadTabData}
                                ref={this.mapTabsRef}
                            />
                            <MapCanvas
                                gridDataArr={this.state.curFloorGrids}
                                drawMapParams={this.state.drawMapParamsCache}
                                codesPortType={this.state.allCodePortType}
                                currentFloor={this.state.currentFloor}
                                getActionByCode={this._setActionByCode}
                                pathList={this.state.pathList}
                                agvList={this.state.agvList}
                                currentAgv={this.state.currentAgv}
                                currentAgvObj={this.state.currentAgvObj}
                                codeMapList={this.state.codeMapData}
                                monitorAgvList={this.state.monitorAgvList}
                                loadRegion={this.reloadTabFromCanvas}
                                handleCurrentAgv={(value:any)=>{this.setState({currentAgv:value})}}
                                trackFlag={this.state.trackFlag}
                                rightCollapse = {this.state.rightCollapse}
                                handleCollapse = { this._changeRightCollapse }
                                ref={this.mapCanvasRef}
                                bufferAreaList={this.state.bufferAreaList}
                                handleBufferListChange={this.handleBufferListChange}
                            />
                            <MapTools
                                canvasRef={this.mapCanvasRef}
                                codeMapList={this.state.codeMapData}
                                currentAgv={this.state.currentAgv}
                                trackFlag={this.state.trackFlag}
                                handleTrackFlag={this._handleTrackFlag}
                            />
                            <MapSideBar
                                actionList = {this.state.actionList}
                                collapse = {this.state.rightCollapse}
                                handleCollapse = { this._changeRightCollapse }
                            />
                            </MapContext.Provider>
                        </div>
                    </Col>
                </Row>
        );
    }
    }; 
    
export default connect(
  ({
    mapAndMonitor,
    loading,
  }: {
    mapAndMonitor: StateType,
    loading: {
      effects: { [key: string]: boolean };
    };
  }) => ({
    mapAndMonitor,
    loading: loading.effects['mapAndMonitor/fetchRcsMap'],
  }),
)(MapMonitor);

