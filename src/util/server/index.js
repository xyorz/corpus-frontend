import request from './request'

let getDocumentList = request.get({url: '/corpus', params: {}})


export default {
  getDocumentList
}