import axios, { AxiosError } from 'axios';
import { ElNotification, ElMessageBox, ElMessage, ElLoading } from 'element-plus';
import { getToken } from '@/utils/auth';
import errorCode from '@/utils/errorCode';
import { tansParams, blobValidate } from '@/utils/ruoyi';
import { saveAs } from 'file-saver';
import useUserStore from '@/store/modules/user';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** 是否跳过统一错误处理 */
    skipErrorHandler?: boolean;
    /** 是否返回完整的 axios 响应对象 */
    getResponse?: boolean;
  }
}

let downloadLoadingInstance: any;
// 是否显示重新登录
export const isRelogin = { show: false };

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  timeout: 30000,
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    console.error('🚀 ~ file: request.js:31 ~ error:', error);
    return Promise.reject(error);
  },
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data;
    const { skipErrorHandler, getResponse } = response.config;
    const { responseType } = response.request;

    // 返回完整的 axios 响应对象: 方便页面能拿到响应头信息, 如 content-disposition
    if (getResponse) {
      return response;
    }
    // 跳过统一错误提示, 页面单独处理
    if (skipErrorHandler) {
      return res;
    }
    // 二进制数据则直接返回, 避免获取不到 code, msg 导致报错
    if (responseType === 'blob' || responseType === 'arraybuffer') {
      return res;
    }

    // 未设置状态码则默认成功状态
    const code = res.code || 200;
    // 获取错误信息
    const msg = res.msg || errorCode[code] || errorCode['default'];

    // 登录失效
    if (code === 401) {
      if (!isRelogin.show) {
        isRelogin.show = true;
        ElMessageBox.confirm('登录状态已过期，您可以继续留在该页面，或者重新登录', '系统提示', {
          confirmButtonText: '重新登录',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(() => {
            isRelogin.show = false;
            useUserStore()
              .logOut()
              .then(() => {
                location.href = '/index';
              });
          })
          .catch(() => {
            isRelogin.show = false;
          });
      }
      return Promise.reject('无效的会话，或者会话已过期，请重新登录。');
    } else if (code !== 200) {
      ElMessage.error({ message: msg });
    }
    return res;
  },
  (error: AxiosError) => {
    console.error('🚀 ~ file: request.js:79 ~ error:', error);
    const { skipErrorHandler, url } = error.config || {};
    const status = error.response?.status ?? '';

    if (skipErrorHandler) {
      return Promise.reject(error);
    }

    let message = error.message || errorCode[status];
    if (message == 'Network Error') {
      message = '好像与互联网断开了连接';
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时';
    }

    ElNotification({
      title: `请求错误 ${status}: ${url}`,
      message: message || '系统未知错误，请反馈给管理员',
      type: 'error',
    });
    return Promise.reject(error);
  },
);

// @ts-expect-error
export function download(url, params, filename, config) {
  downloadLoadingInstance = ElLoading.service({
    text: '正在下载数据，请稍候',
    background: 'rgba(0, 0, 0, 0.7)',
  });
  return service
    .post(url, params, {
      transformRequest: [
        (params) => {
          return tansParams(params);
        },
      ],
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'blob',
      ...config,
    })
    .then(async (data) => {
      const isBlob = blobValidate(data);
      if (isBlob) {
        // @ts-expect-error
        const blob = new Blob([data]);
        saveAs(blob, filename);
      } else {
        // @ts-expect-error
        const resText = await data.text();
        const rspObj = JSON.parse(resText);
        const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default'];
        ElMessage.error(errMsg);
      }
      downloadLoadingInstance.close();
    })
    .catch((r) => {
      console.error(r);
      ElMessage.error('下载文件出现错误，请联系管理员！');
      downloadLoadingInstance.close();
    });
}

export default service;
