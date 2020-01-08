import getHashCode from './hashUtil'

function getUrlParams(index = 0) {
  const urlSpl = window.location.href.split('/');
  if (Array.isArray(index)) {
    const resList = [];
    index.forEach(i => {
      resList.push(urlSpl[urlSpl.length - i - 1])
    })
    return resList
  } else {
    return urlSpl[urlSpl.length - index - 1]
  }
}

export {
  getHashCode,
  getUrlParams
}