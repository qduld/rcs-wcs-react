// import request from 'umi-request';
import request from '@/utils/request';
 
export async function getAllDeviceRcs() {         //获取所有Agv
  return request('/wcs/deviceManage/getAllDeviceRcs');
}

export async function deleteDeviceRcsById(params:any) {
  return request('/wcs/deviceManage/deleteDeviceRcsById', {
    method: 'POST',
    data: params,
  });
}

export async function insertDeviceRcs(params:any) {
  return request('/wcs/deviceManage/insertDeviceRcs', {
    method: 'POST',
    data: params,
  });
}

export async function updateDeviceRcsById(params:any) {
  return request('/wcs/deviceManage/updateDeviceRcsById', {
    method: 'POST',
    data: params,
  });
}



