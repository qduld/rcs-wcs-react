// import request from 'umi-request';
import request from '@/utils/request';

export async function getAllAgv() {         //获取所有Agv
  return request('/wcs/deviceManage/getAllAgv');
}

export async function deleteDeviceAgvByAgvId(params: any) {
  return request('/wcs/deviceManage/deleteDeviceAgvByAgvId', {
    method: 'POST',
    data: params,
  });
}

export async function insertAgv(params: any) {
  return request('/wcs/deviceManage/insertAgv', {
    method: 'POST',
    data: params,
  });
}

export async function updateDeviceAgvByAgvId(params: any) {
  return request('/wcs/deviceManage/updateDeviceAgvByAgvId', {
    method: 'POST',
    data: params,
  });
}

export async function checkAgv(params: any) {    //验证小车
  return request('/wcs/deviceManage/checkAgv', {
    method: 'GET',
    data: params,
  });
}
