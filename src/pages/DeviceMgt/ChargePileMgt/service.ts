// import request from 'umi-request';
import request from '@/utils/request';
 
export async function getAllChargerPile() {         //获取所有Agv
  return request('/wcs/deviceManage/getAllChargerPile');
}

export async function deleteChargerPileById(params:any) {
  return request('/wcs/deviceManage/deleteChargerPileById', {
    method: 'POST',
    data: params,
  });
}

export async function insertChargerConfig(params:any) {
  return request('/wcs/deviceManage/insertChargerConfig', {
    method: 'POST',
    data: params,
  });
}

export async function updateChargerPileById(params:any) {
  return request('/wcs/deviceManage/updateChargerPileById', {
    method: 'POST',
    data: params,
  });
}



