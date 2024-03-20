import request from '@/utils/request';

export async function getDmCodeMapInfo() {          //获取code2_map.json
  return request('/v1/arena/1234?fields=dm_code_config&access_token=13');
}

export async function getGridPointMapInfo() {       //获取map.json
  return request('/v1/arena/1234?fields=map&access_token=13');
}

export async function getDeviceList() {             //获取Rcs设备列表
  return request('/v1/arena/0?fields=device_list&access_token=0');
}

export async function getAllArea(){                 // 获取避让缓冲区坐标
  return request('/wcs/systemController/getAllArea');
}


export async function getIdleAgv() {                //获取空闲AGV列表
  return request('/wcs/systemController/getIdleAgv');
}

export async function getSimulateAgv(params: any) {                //获取模拟AGV列表
  return request('/wcs/systemController/getSimulateAgv', {
    method: 'POST',
    data: params,
  });
}

export async function getAllPortType() {                  //获取工位类型
  return request('/wcs/systemController/getAllPortType');
}

export async function getAllDDL() {                       //获取字典表
  return request('/wcs/systemController/getAllDDL');
}

export async function getCodesOfPortType() {              //获取码值对应的类型
  return request('/wcs/systemController/getCodesOfPortType');
}

export async function getAllDoor() {                      //获取所有门
  return request('/wcs/systemController/getAllDoor');
}

export async function getAllChargePile() {                //获取所有充电桩
  return request('/wcs/systemController/getAllChargePile');
}

export async function findMapDistance(param: any) {        //获取字典表
  return request('/wcs/systemController/findMapDistance?' + param);
}

export async function getAllAction() {                    //获取所有动作
  return request('/wcs/systemController/getAllAction');
}
