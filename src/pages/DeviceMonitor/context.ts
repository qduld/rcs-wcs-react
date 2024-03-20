import { createContext } from 'react';

export interface MapContextProps {
  updatePathList:(pathList:any,agvId:string) => void
  updateCurrentAgv:(agvName:any) => void
  updateActionList:(actionList:any) => void
  updateTrackFlag:(flag:boolean) => void,
  currentRegion:string,
  allDDL:Array<object>,
  allAgvList:string,
  codeMapList:Array<object>,
}

const MapContextInit={
    updatePathList:function(param:any,param1:any){},
    updateCurrentAgv:function(param:any){},
    updateActionList:function(param:any){},
    updateTrackFlag:function(param:any){},
    currentRegion:"",
    allDDL:[] as Array<object>,
    allAgvList:"{}",
    codeMapList:[] as Array<object>,
}

const MapContext: React.Context<MapContextProps> = createContext(MapContextInit);

export default MapContext;
