import request from '@/utils/request';


export async function getListInstance() { //获取所有用户
  return request('/wcs/chargeManage/getsth');
}



export async function postListInstance(params) {
    return request('/wcs/chargeManage/poststh', {
      method: 'POST',
      data: params,
    });
  }
