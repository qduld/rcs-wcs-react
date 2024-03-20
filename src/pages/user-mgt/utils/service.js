import request from '@/utils/request';

/*
    wcs/userManage/
    
    getAllUserInfo
    getAllRole
    getUserInfoById
    deleteUserInfo
    saveUserInfo
*/
export async function getAllUserInfo() { //获取所有用户
  return request('/wcs/userManage/getAllUserInfo');
}
export async function getAllRole() { //获取所有角色
    return request('/wcs/userManage/getAllRoleInfo');
}
export async function getUserInfoById(params) { //根据id查询用户
  let parmsStr=''
  if(params&&params.id){
    parmsStr+='?id='+params.id
  }
    return request('/wcs/userManage/getUserInfoById'+parmsStr);
}
export async function deleteUserInfo(params) {
  return request('/wcs/userManage/deleteUserInfo', {
    method: 'POST',
    data: params,
  });
}
export async function updateUserInfo(params) {
  return request('/wcs/userManage/updateUserInfo', {
    method: 'POST',
    data: params,
  });
}


export async function saveUserInfo(params) {
    return request('/wcs/userManage/saveUserInfo', {
      method: 'POST',
      data: params,
    });
  }
