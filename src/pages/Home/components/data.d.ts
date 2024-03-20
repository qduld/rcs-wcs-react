export interface action{
    action:{
        id?:string | number | null | undefined,
        code:string | number | null,
        code1:string | number | null,
        code2:string | number | null,
        portType:string | number,
        portName:string | null
    },
    actionGroup:Array<actionGroup>,
    type:string | number
}


export interface AgvInfoState {
        agvId: string,
        agvCode?: string | number,
        agvName:string,
        agvStatus:string,
        missionId?: string | number,
        missionName?: string | number,
        agvVoltageLow: number,
        agvVoltageFull: number,
        voltage: number 
}

export const agvInfoInit={
    agvId: "",
    agvCode : "",
    agvName: "",
    agvStatus: "",
    missionId: "",
    missionName: "空闲",
    agvVoltageLow: 0,
    agvVoltageFull: 0,
    voltage: 0
}