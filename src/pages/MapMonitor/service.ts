// import request from 'umi-request';
import request from '@/utils/request';
 
export async function getActionByCode(params:any) {
  return request('/wcs/systemController/getActionByCode?code='+params);
}

export async function insertOrUpdateAction(params:any) {
  return request('/wcs/systemController/insertOrUpdateAction', {
    method: 'POST',
    data: params
  });
}

export async function deleteActionGroup(params:any) {
  return request('/wcs/systemController/deleteActionGroup',{
    method: 'POST',
    data: params
  });
}

export async function simulationPath(params:any) {
  return request('/wcs/systemController/simulationPath', {
    method: 'POST',
    data: params
  });
}

export async function beginSimulation(params:any) {            //开始模拟
  return request('/wcs/systemController/beginSimulation', {
    method: 'POST',
    data: params
  });
}

export async function saveCmdTemplate(params:any) {            //保存通用模板
  return request('/wcs/systemController/saveCmdTemplate', {
    method: 'POST',
    data: params
  });
}

export async function getAllCmdTemplate(params:any) {            //获取通用模板
  return request('/wcs/systemController/getAllCmdTemplate');
}

export async function deleteCmdTemplate(params:any) {            //删除通用模板
  return request('/wcs/systemController/deleteCmdTemplate?id='+params)
}
