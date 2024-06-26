import request from '@/utils/request';

export interface LoginParamsType {
  userName: string;
  password: string;
  mobile: string;
  captcha: string;
}

export async function fakeAccountLogin(params: LoginParamsType) {
  return request('/api/login/account', {
    method: 'POST',
    data: params,
  });
}

export async function getFakeCaptcha(mobile: string) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}

export async function umiLogin(params: LoginParamsType) {
  return request('/auth/accredit', {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data;boundary=<calculated when request is sent>',
      "Accept":'*/*'
    },
    data: params,
  });
}