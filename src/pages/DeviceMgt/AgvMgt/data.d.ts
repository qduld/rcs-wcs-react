export interface AgvState{
    agvChargeTimeScope: string,       //车辆权限范围
    agvCode: number,     
    agvEnable: 'Y' | 'N',              //激活状态  
    agvId: string,
    agvIp: string,
    agvName: string,
    agvStatus: string,
    agvVoltageFull: number | null,
    agvVoltageLow: number | null,           //充电电压
    agvVoltageWork: number | null,
    amgId: number,
    chargeEnable: 'Y' | 'N',           //自动充电
    chargerType: string,         
    lastCode: number,
    missionId: string,
    missionType: string,
    orderWaitEnable: 'Y' | 'N',        //自动返回待命
    permissionCode: string | null
}

export interface ModalState{
    agvId: string,
    agvIp: string,
    agvVoltageFull: number | null,          //最高电压
    agvVoltageLow: number | null,           //最低电压
    agvVoltageWork: number | null,          //工作电压
    agvEnable: 'Y' | 'N',            //是否激活
    agvStatus: 'Y' | 'N',            //是否可用
    chargeEnable: 'Y' | 'N',            //是否可充电
    orderWaitEnable: 'Y' | 'N',         //自动返回待命
    permissionCode: string | null,           //权限码
    permissionCodeList: Array<number>,
    agvChargeTimeScope: Array<string>,
    agvSpeed:number, //初始速度
    agvSpeedList:Array<number>, //初始速度
    timeListCache: Array<string>,
}


