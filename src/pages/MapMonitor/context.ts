import { createContext } from 'react';

export interface MapContextProps {
  updatePathList:(pathList:any,agvId:string) => void
  updateAgvList:(agvList:any) => void
  updateCurrentAgv:(agvName:any) => void
  updateActionList:(actionList:any) => void
  updateMonitorAgvList:(monitorAgvList:any) => void,
  updateTrackFlag:(flag:boolean) => void,
  currentRegion:string,
  allDDL:Array<object>,
  codeMapList:Array<object>,
  monitorAgvList:Array<String>
}

const MapContextInit={
    updatePathList:function(param:any,param1:any){},
    updateAgvList:function(param:any){},
    updateCurrentAgv:function(param:any){},
    updateActionList:function(param:any){},
    updateMonitorAgvList:function(param:any){},
    updateTrackFlag:function(param:any){},
    currentRegion:'',
    allDDL:[] as Array<object>,
    codeMapList:[] as Array<object>,
    monitorAgvList:[] as Array<String>
}

const MapContext: React.Context<MapContextProps> = createContext(MapContextInit);

export default MapContext;
