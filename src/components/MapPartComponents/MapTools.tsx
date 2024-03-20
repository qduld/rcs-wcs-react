import React , { useState , useEffect, useCallback } from 'react';
import styles from './style.less';
import { Slider, Input , notification , Badge } from 'antd';
import { RetweetOutlined , ZoomInOutlined , ZoomOutOutlined , AppstoreOutlined , 
  CarOutlined , StockOutlined , 
  DoubleLeftOutlined , DoubleRightOutlined , AimOutlined , CheckSquareOutlined , 
  CompressOutlined , NumberOutlined , GatewayOutlined } from '@ant-design/icons';
import station from '@/assets/img/station.svg';
import door from '@/assets/img/door.svg';
import lift from '@/assets/img/lift.svg';
import pile from '@/assets/img/pile.svg';
import station_s from '@/assets/img/station_s.svg';
import door_s from '@/assets/img/door_s.svg';
import lift_s from '@/assets/img/lift_s.svg';
import pile_s from '@/assets/img/pile_s.svg';
import {toolStatusColorList as tsColor} from '@/utils/canvasSettings.js'
const lazyColor={color:tsColor.lazy}

interface mapToolsModal{
  canvasRef : any,
  codeMapList : Array<Object>,
  trackFlag:boolean,
  currentAgv:string,
  handleTrackFlag:() => void
}

const MapTools: React.FC<mapToolsModal> = (props) => {
    const { 
      canvasRef , 
      codeMapList , 
      currentAgv , 
      trackFlag , 
      handleTrackFlag ,
      showBufferArea ,
    } = props

    const [agvSideBarFlag,setAgvSideBarFlag] = useState<'block' | 'none'>('none');
    const [codeSideBarFlag,setCodeSideBarFlag] = useState<'block' | 'none'>('none');
    const [centerScaleFlag,setCenterScaleFlag] = useState<'block' | 'none'>('none');
    const [codeInputFlag,setCodeInputFlag] = useState<'inline-block' | 'none'>('none');
    const [agvId,setAgvId] = useState<string | number>();

    const [collapsed,setCollapsed] = useState<Boolean>(false);
    const [locationCode,setLocationCode] = useState();
    const [activeStatusFlag,setActiveStatusFlag] = useState<Boolean>(false);
    const [activeStatusColor,setActiveStatusColor] = useState(tsColor['lazy']);
    const [currentPortType,setCurrentPortType] = useState('');

    useEffect(() => {
      if(trackFlag){
          setActiveStatusFlag(true)
          setActiveStatusColor(tsColor['busy'])
          if(currentAgv){
              setAgvId(currentAgv.replace(/[^0-9]/ig,""))
          }
      }else{
          setActiveStatusColor(tsColor['lazy'])
          setActiveStatusFlag(false)
      }
    }, [trackFlag]);

    useEffect(() => {
        setAgvId(currentAgv.replace(/[^0-9]/ig,""))
    }, [currentAgv]);

    const changeAgvSizeBarFlag = ()=>{
      if(agvSideBarFlag==='none'){
        setAgvSideBarFlag('block')
        setCodeInputFlag('none')
        setCodeSideBarFlag('none')
        setCenterScaleFlag('none')
      }else{
        setAgvSideBarFlag('none')
      }
    }

    const changeCodeSizeBarFlag = ()=>{
      if(codeSideBarFlag==='none'){
        setCodeSideBarFlag('block')
        setCodeInputFlag('none')
        setAgvSideBarFlag('none')
        setCenterScaleFlag('none')
      }else{
        setCodeSideBarFlag('none')
      }
    }

    const changeCenterScaleFlag = ()=>{
      if(centerScaleFlag==='none'){
        setCenterScaleFlag('block')
        setCodeInputFlag('none')
        setCodeSideBarFlag('none')
        setAgvSideBarFlag('none')
      }else{
        setCenterScaleFlag('none')
      }
    }

    const changeCodeInputFlag = ()=>{
      if(codeInputFlag==='none'){
        setCodeInputFlag('inline-block')
        setAgvSideBarFlag('none')
        setCodeSideBarFlag('none')
        setCenterScaleFlag('none')
      }else{
        setCodeInputFlag('none')
      }
    }

    const resetAllFlag = ()=>{
        setAgvSideBarFlag('none')
        setCodeSideBarFlag('none')
        setCenterScaleFlag('none')
        setCodeInputFlag('none')
    }

    const location = ()=>{              //码点定位
      interface codeMapObj{
        region?:string,code_num?:string
      }
      let lcCache = codeMapList.find((item:codeMapObj)=>{return item.code_num == locationCode}) as codeMapObj | undefined
       if(!lcCache){
          notification.info({
              description: '无效码值',
              message: '请输入地图上已有的码值',
          }); 
          return ;
       }
       canvasRef.current.handleLocation(locationCode,lcCache.region)
       changeCodeInputFlag()
    }

    const changeLocationCode = (e:any)=>{
        setLocationCode(e.currentTarget.value)
    }

    const reset = ()=>{                 //缩放重置
       canvasRef.current.handleReset()
    }

    const zoomIn = ()=>{                //放大
       canvasRef.current.handleZoom('in')
    }

    const zoomOut = ()=>{               //缩小
      canvasRef.current.handleZoom('out')
    } 

    const codeShow = ()=>{               //码值显隐
      canvasRef.current.handleCodeShow()
    } 
    
    const pathShow = ()=>{                //线路显隐
      canvasRef.current.handlePathShow()
    }

    const buffferAreaShow = ()=>{ // 避让区（缓冲区）显隐
      if(canvasRef.current.handleBuffferAreaShow){
        canvasRef.current.handleBuffferAreaShow()
      }else{
        console.error('当前应用模块未设置handleBuffferAreaShow')
      }

    }

    const agvSizeChange = (value:any)=>{   //agv大小调整
      canvasRef.current.handleAgvSize(value)
    }

    const codeSizeChange = (value:any)=>{   //二维码大小调整
      canvasRef.current.handleCodeSize(value)
    }

    const centerScaleChange = (value:any)=>{
      canvasRef.current.handleCenterScale(value)
    }

    const portTypeChange = (value:any)=>{   //站点类型过滤
      let portTypeCache = ''
      if(!currentPortType){
          portTypeCache = value
      }else{
        if(value!==currentPortType){
          portTypeCache = value
        }else{
          portTypeCache = ''
        } 
      }
      setCurrentPortType(portTypeCache)
      canvasRef.current.handlePortType(portTypeCache)
    }

    const handleCollapsed = ()=>{          //侧边栏收回
      setAgvSideBarFlag('none')
      setCodeInputFlag('none')
      setCollapsed(!collapsed)
      setCodeSideBarFlag('none')
      setCenterScaleFlag('none')
    }
    return (
        <div className={collapsed?
               [styles.mapTools,styles.hide].join(' '):
               styles.mapTools
               }>
            <ul>
              <li><RetweetOutlined style={lazyColor} title='重置' onClick={reset}/></li>
              <li><ZoomInOutlined style={lazyColor} title='放大' onClick={zoomIn}/></li>                
              <li><ZoomOutOutlined style={lazyColor} title='缩小' onClick={zoomOut}/></li>
              <li></li>
              <li className={styles.codeInputWrapper}>
                    <AimOutlined style={lazyColor} title="定位码点" onClick={changeCodeInputFlag}/>
                    <Input value={locationCode}  
                          className={styles.codeInput} 
                          style={{display:codeInputFlag}}
                          onChange={changeLocationCode}
                          onPressEnter={location}
                          />
                    <CheckSquareOutlined 
                          className={styles.codeInputSure} 
                          style={{display:codeInputFlag,...lazyColor}}
                          onClick={location}/>
              </li>
              <li>
                  {!activeStatusFlag?
                      <i className="ion-md-navigate" title="AGV定位追踪" style={{fontSize:'28px',color:activeStatusColor}} onClick={()=>handleTrackFlag()}></i>:
                      <Badge count={agvId} showZero style={{ backgroundColor: '#40a9ff',display:'block'}}>
                          <i className="ion-md-navigate" title="AGV定位追踪" style={{fontSize:'28px',color:activeStatusColor}} onClick={()=>handleTrackFlag()}></i>
                      </Badge>
                  }
              </li>
              <li className={styles.agvSideBarWrapper}>
                    <CarOutlined style={lazyColor} title='AGV大小调节' onClick={changeAgvSizeBarFlag}/>
                    <Slider defaultValue={30} 
                          tooltipVisible={agvSideBarFlag==='none'?false:true}
                          className={styles.agvSideBar}
                          style={{display:agvSideBarFlag}}
                          onChange={agvSizeChange}/>
              </li>
              <li className={styles.codeSideBarWrapper}>
                    <CompressOutlined style={lazyColor} title='码值大小调节' onClick={changeCodeSizeBarFlag}/>
                    <Slider defaultValue={0.1} 
                          min={0}
                          max={0.25}
                          step={0.01}
                          tooltipVisible={codeSideBarFlag==='none'?false:true}
                          className={styles.codeSideBar}
                          style={{display:codeSideBarFlag}}
                          onChange={codeSizeChange}/>
              </li>
              <li><AppstoreOutlined style={lazyColor} title='码值显示隐藏' onClick={codeShow}/></li>
              <li><StockOutlined style={lazyColor} title='线路显示隐藏' onClick={pathShow}/></li>
              <li>
                <GatewayOutlined style={{color:tsColor['lazy']}} title='避让区显示隐藏' onClick={buffferAreaShow} />
              </li>
              <li>{currentPortType==='port_work'?
                    <img src={station_s} title='工位' 
                        onClick={()=>portTypeChange('port_work')}>
                    </img>:
                    <img src={station} title='工位' 
                        onClick={()=>portTypeChange('port_work')}>
                    </img>
              }</li>
              <li>{currentPortType==='port_door'?
                    <img src={door_s} title='门' 
                        onClick={()=>portTypeChange('port_door')}>
                    </img>:
                    <img src={door} title='门' 
                        onClick={()=>portTypeChange('port_door')}>
                    </img>
              }</li>
              <li>{currentPortType==='port_lift'?
                    <img src={lift_s} title='电梯' 
                        onClick={()=>portTypeChange('port_lift')}>
                    </img>:
                    <img src={lift} title='电梯' 
                        onClick={()=>portTypeChange('port_lift')}>
                    </img>
              }</li>
              <li>{currentPortType==='port_charge'?
                    <img src={pile_s} title='充电桩' 
                        onClick={()=>portTypeChange('port_charge')}>
                    </img>:
                    <img src={pile} title='充电桩' 
                        onClick={()=>portTypeChange('port_charge')}>
                    </img>
              }</li>
              {/* <li className={styles.centerScaleWrapper}>
                    <NumberOutlined style={lazyColor} title='中心定位调节' onClick={changeCenterScaleFlag}/>
                    <Slider defaultValue={20} 
                          min={100}
                          max={2000}
                          step={100}
                          tooltipVisible={centerScaleFlag==='none'?false:true}
                          className={styles.centerScaleBar}
                          style={{display:centerScaleFlag}}
                          onChange={centerScaleChange}/>
              </li> */}
              <li>
                {collapsed?
                    <DoubleRightOutlined style={lazyColor} className="collapsedRight" title="显示" onClick={handleCollapsed}/>:
                    <DoubleLeftOutlined style={lazyColor} className="collapsedLeft" title="隐藏" onClick={handleCollapsed}/>
                }
              </li>
            </ul>
        </div>
      );
    };

export default MapTools;
