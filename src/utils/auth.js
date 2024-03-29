import Cookies from 'js-cookie';
import { name } from '/package.json';

const TokenKey = `${name || 'admin'}-token`;

export function getToken() {
  return Cookies.get(TokenKey);
}

export function setToken(token) {
  // 默认7天过期
  return Cookies.set(TokenKey, token, { expires: 7 });
}

export function removeToken() {
  return Cookies.remove(TokenKey);
}
