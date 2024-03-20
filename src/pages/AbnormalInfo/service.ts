// import request from 'umi-request';
import request from '@/utils/request';
 
export async function getAllAbnormalInfo() {         //获取所有Agv
  return request('/wcs/deviceMonitor/getAgvExceptionInfo');
}

export async function getRcsErrorType() {         //获取所有Agv
  return request('/wcs/systemController/getRcsErrorType');
}


