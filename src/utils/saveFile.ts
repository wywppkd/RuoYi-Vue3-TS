import { AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';
import saveAs from 'file-saver';

/**
 * blob 转 json
 */
export function blob2Json(blob: Blob): Promise<{ code: number; msg: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(blob, 'utf-8');
    reader.onload = () => {
      try {
        const resObj = JSON.parse(reader.result as string);
        resolve(resObj);
      } catch (error) {
        console.error('blob 转 json 失败', error);
      }
    };
    reader.onerror = reject;
  });
}

/**
 * 下载 Blob 文件
 * @param res axios 请求返回的完整响应
 * @param filename 文件名, 不传则根据 content-disposition 解析文件名
 */
export async function saveFile(res: AxiosResponse<Blob>, filename?: string) {
  const blob = res.data;
  const contentDisposition = res.headers['content-disposition'];
  /** 从响应头解析的文件名 */
  const filenameFromResHeader = contentDisposition
    ? decodeURI(contentDisposition?.split(';')[1].split('=')[1])
    : '';
  const contentType = res.headers['content-type'] as string;
  // 接口返回 json(错误提示信息)
  if (contentType.includes('application/json')) {
    const resObj = await blob2Json(blob);
    ElMessage.error(resObj?.msg);
    return;
  }
  // 处理成功, 接口返回文件
  const name = filename || filenameFromResHeader || '未命名';
  saveAs(blob, name);
}
