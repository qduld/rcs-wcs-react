// import request from 'umi-request';
import request from '@/utils/request';
 
export async function getAllAgv() {         //获取所有Agv
  return request('/wcs/deviceManage/getAllAgv');
}

export async function getAllVoice() {         //获取所有Agv
  return request('/wcs/deviceManage/getAllVoice');
}

export async function deleteVoiceById(params:any) {
  return request('/wcs/deviceManage/deleteVoiceById', {
    method: 'POST',
    data: params,
  });
}

export async function updateVoiceById(params:any) {
  return request('/wcs/deviceManage/updateVoiceById', {
    method: 'POST',
    data: params,
  });
}

export async function insertVoice(params:any) {
  return request('/wcs/deviceManage/insertVoice', {
    method: 'POST',
    data: params,
  });
}

