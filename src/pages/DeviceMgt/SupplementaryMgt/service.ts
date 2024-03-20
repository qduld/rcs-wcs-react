// import request from 'umi-request';
import request from '@/utils/request';
 
export async function getAllSupplementary() {         //获取所有Agv
  return request('/wcs/deviceManage/getAllSupplementary');
}

export async function deleteSupplementaryById(params:any) {
  return request('/wcs/deviceManage/deleteSupplementaryById', {
    method: 'POST',
    data: params,
  });
}

export async function insertSupplementary(params:any) {
  return request('/wcs/deviceManage/insertSupplementary', {
    method: 'POST',
    data: params,
  });
}

export async function updateSupplementaryById(params:any) {
  return request('/wcs/deviceManage/updateSupplementaryById', {
    method: 'POST',
    data: params,
  });
}

