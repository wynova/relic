'use strict'

import axios from 'axios'
// import baseURL from '@/api/baseUrl'
import ElementUI from 'element-ui';
import common from '@/common/locale/index'
import 'url-search-params-polyfill'
let baseURL = '';
if (process.env.NODE_ENV === 'production') {
  baseURL = '/api/' + process.module
}
// console.log(baseURL);
axios.defaults.withCredentials = true;

axios.interceptors.request.use(config => {
  // loading
  return config
}, error => {
  return Promise.reject(error)
})

axios.interceptors.response.use(response => {
  return response
}, error => {
  return Promise.resolve(error.response)
})

function checkStatus (response) {
  // loading
  // 如果http状态码正常，则直接返回数据
  if (response && (response.status === 200 || response.status === 304 || response.status === 400)) {
    return response
    // 如果不需要除了data之外的数据，可以直接 return response.data
  }
  var msg = '网络异常';
  var lcode = common.getCookie('_lcode_');
  if (lcode == 'en') {
    msg = 'network anomaly'
  } else if (lcode == 'zh_TW') {
    msg = '網絡異常'
  }
  // 异常状态下，把错误信息返回去
  return {
    status: -404,
    msg: msg
  }
}

function checkCode (res) {
  // 如果code异常(这里已经包括网络错误，服务器错误，后端抛出的错误)，可以弹出一个错误提示，告诉用户
  if (res.status === -404) {
    ElementUI.Message.error(res.msg);
  }
  if (res.request && res.request.responseURL && res.request.responseURL.indexOf('/i18n/js') === -1 && res.data && res.data.result == 1) {
    if (res.data.message) {
      ElementUI.Message.error(res.data.message)
    }
  }
  return res;
}
let loading = '';
export default {
  post (url, data, type, options = {}) {
    var dataType = type || 'Array';
    var params = {};
    var topUrl = url.indexOf('forward_webfront') >= 0 ? '' : baseURL;
    var headers = {
      'invoke-type': 'ajax',
      'X-Requested-With': 'XMLHttpRequest'
    }
    if (dataType === 'Array') {
      params = new URLSearchParams();
      for (var key in data) {
        if (Array.isArray(data[key])) {
          for (var i = 0; i < data[key].length; i++) {
            params.append(key, data[key][i] || '');
          }
        } else if (typeof data[key] === 'object') {
          params.append(key, JSON.stringify(data[key]) || '');
        } else if (typeof data[key] === 'number') {
          params.append(key, data[key]);
        } else {
          params.append(key, data[key]);
        }
      }
      headers['Content-Type'] = options['contentType'] || 'application/x-www-form-urlencoded; charset=UTF-8';
    } else {
      // if (JSON.stringify(data) !== '{}' && data) {
      //   params['body'] = data;
      // } else {
      //   params = '';
      // }
      params = data;
      headers['Content-Type'] = options['contentType'] || 'application/json; charset=UTF-8';
    }
    if (options.loading || options.loadStart) {
      loading = ElementUI.Loading.service({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
    }
    console.log(params);
    return axios({
      method: 'post',
      baseURL: topUrl,
      url,
      data: params,
      headers: headers,
      responseType: options['responseType'] || 'json'
    }).then(
      (response) => {
        if (options.loading || options.loadEnd) {
          loading.close();
        }
        return checkStatus(response)
      }
    ).then(
      (res) => {
        if (options.loading || options.loadEnd) {
          loading.close();
        }
        return checkCode(res)
      }
    )
  },
  get (url, params, type, options = {}) {
    var topUrl = url.indexOf('forward_webfront') >= 0 ? '' : baseURL;
    if (options.loading || options.loadStart) {
      loading = ElementUI.Loading.service({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
    }
    return axios({
      method: 'get',
      baseURL: topUrl,
      url,
      params, // get 请求时带的参数
      headers: {
        'invoke-type': 'ajax',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }).then(
      (response) => {
        if (options.loading || options.loadEnd) {
          loading.close();
        }
        return checkStatus(response)
      }
    ).then(
      (res) => {
        if (options.loading || options.loadEnd) {
          loading.close();
        }
        return checkCode(res)
      }
    )
  },
  transParam (param, keyValue) {
    var newParam = {};
    for (var key in param) {
      newParam[keyValue + '.' + key] = param[key];
    }
    return newParam;
  },
  conversionParam (param, prefix = '') {
    var newParam = {};
    if (typeof param === 'object') {
      Object.keys(param).forEach((item) => {
        if (typeof param[item] === 'object' && param[item] && !prefix) {
          newParam = Object.assign(this.conversionParam(param[item], item), newParam);
        } else {
          if (prefix) {
            newParam[prefix + '.' + item] = param[item];
            // Object.keys(param).forEach((item) => {
            //   if (typeof param[item] === 'object' && param[item]) {
            //     newParam = Object.assign(this.conversionParam(param[item], item), newParam);
            //   }
            // });
          } else {
            newParam[item] = param[item];
          }
        }
      });
    }
    return newParam;
  }
}