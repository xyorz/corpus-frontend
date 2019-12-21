import {useEffect} from 'react';
import getHashCode from '../../util/hashUtil'

const equalIgnores = {
  text: true,
  meta: {
    hash: true
  },
  zhujie: true,
  detail: true
};

function parseText(textJSON) {
  const textObj = typeof textJSON === 'string'? JSON.parse(textJSON): textJSON;
  const textRes = [];
  const tags = [];
  let title = "";
  let curTag = null;
  console.log(textObj)
  // 排序
  let sortedKeys = Object.keys(textObj).sort((a, b) => {
    const [a1, a2, a3] = [...a.split('.').map((e) => parseInt(e)), 0, 0];
    const [b1, b2, b3] = [...b.split('.').map((e) => parseInt(e)), 0, 0];
    if(a1 === b1){
      if(a2 === b2){
        return a3 - b3;
      }
      return a2 - b2;
    }
    return a1 - b1;
  });
  for(let i of sortedKeys){
    if(i.split('.').length === 1){
      title = textObj[i].document;
      title = title.split('.')[0];
    }
    else{
      if(!tags.some((tag) => textObjEqual(tag, textObj[i]) && (curTag = tag))) {
        if(textObj[i]['detail']){
          textObj[i]['detail'] = JSON.parse(textObj[i]['detail']);
        }
        tags.push(textObj[i]);
        curTag = textObj[i];
      }
      // 章节标题
      if(i.split('.').length === 2){
        tags.push(textObj[i]);
      } // 正文部分
      else{
        textObj[i].text.split('').forEach((t) => {
          textRes.push({
            text: t,
            tag: curTag,
            meta: {
              hash: getHashCode()
            }
          })
        });
        const ids = i.split('.').map(id => parseInt(id));
        ids[2] ++;
        if (ids.length === 3 && !Object.keys(textObj).includes(ids.join('.'))) {
          textRes[textRes.length - 1].meta.paraEnd = true;
        }
      }
    }
  }
  tags.forEach((tag) => {
    delete tag.text; 
    delete tag.zhujie;
  });
  return [textRes, tags, title];
}

function generateTextToUpdate(textObj, documentId) {
  const resObj = {};
  documentId = documentId? documentId: 0;
  const idArr = [documentId, 0, 0];
  const getCurId = () => idArr.join('.');
  textObj = combineTextObj(textObj);
  console.log(textObj)
  // TODO: 文档标题特殊处理
  textObj.forEach((para) => {
    idArr[1] ++;
    idArr[2] = 0;
    para.forEach((text) => {
      idArr[2] ++;
      const curId = getCurId();
      resObj[curId] = {};
      resObj[curId].text = text.text;
      for (let tagKey of Object.keys(text.tag)) {
        resObj[curId][tagKey] = text.tag[tagKey];
      }
    });
  });
  return resObj;
}

function getSelection() {
  const selection = window.getSelection();
  return selection;
}

function getOffset() {
  const selection = window.getSelection();
  const textSpanList = Array.from(document.querySelectorAll(".text"));
  if (!selection.anchorNode) {
    let textLength = document.querySelector(".textBox").textContent.length;
    return {
      startOffset: textLength,
      endOffset: textLength
    }
  }
  const anchorSpan = selection.anchorNode.parentElement;
  const focusSpan = selection.focusNode.parentElement;
  let anchorOffset = 0;
  let focusOffset = 0;
  let offsetCount = 0;
  let findCount = 0;
  textSpanList.some((textSpan) => {
    if (textSpan === anchorSpan) {
      anchorOffset = offsetCount + selection.anchorOffset;
      findCount ++;
    }
    if (textSpan === focusSpan) {
      focusOffset = offsetCount + selection.focusOffset;
      findCount ++;
    }
    offsetCount += textSpan.textContent.length;
    return findCount >= 2;
  })
  return {
    startOffset: Math.min(anchorOffset, focusOffset),
    endOffset: Math.max(anchorOffset, focusOffset)
  }
}

function getOffsetInElem(offset) {
  const {startOffset, endOffset} = offset;
  const textSpanList = Array.from(document.querySelectorAll(".text"));
  if (textSpanList.length === 0) {
    return null;
  }
  let offsetCount = 0;
  let startNodeFind = false;
  let endNodeFind = false;
  let res = {};
  textSpanList.some((textSpan) => {
    if (offsetCount >= startOffset && !startNodeFind) {
      res.startNode = textSpan;
      res.startOffset = offsetCount - startOffset;
      startNodeFind = true;
    }
    if (offsetCount >= endOffset && !endNodeFind) {
      res.endNode = textSpan;
      res.endOffset = offsetCount - endOffset;
      endNodeFind = true;
    }
    offsetCount += textSpan.textContent.length;
    return startNodeFind && endNodeFind;
  })
  if (!res.endNode) {
    res.endNode = textSpanList[textSpanList.length - 1];
    res.endOffset = textSpanList[textSpanList.length - 1].textContent.length;
  }
  return res;
}

function setRangeStart(offset) {
  const range = window.getSelection().getRangeAt(0);
  let child = document.querySelector(".textBox").childNodes[0];
  let length = child.textContent.length;
  while (length < offset) {
    child = child.nextSibling;
    if (child.getAttribute("class").indexOf("text") >= 0) {
      length += child.textContent.length;
    }
  }
  let off = child.textContent.length - (length - offset);
  range.setStart(child, off);
}

function focusInput() {
  const input = document.getElementById("contentInput");
  input.focus();
}

function getPointerPos(event) {
  return {
    top: event.clientY,
    left: event.clientX 
  }
}

function useCursorBlink() {
  useEffect(() => {
    const cursorElem = document.querySelector('.cursor');
    if (!cursorElem) {
      return;
    }
    let timeout;
    cursorElem.style.opacity = '1';
    function timeoutFunction() {
      timeout = setTimeout(() => {
        cursorElem.style.opacity = cursorElem.style.opacity === '0'? '1': '0';
        timeoutFunction();
      }, 500);
    }
    timeoutFunction();
    return () => {
      clearTimeout(timeout);
    };
  })
}

function textObjEqual(textObj1, textObj2) {
  let flag = true;
  function objEqual(obj1, obj2, ignores) {
    if (obj1 && obj2 && typeof obj1 === 'object' && typeof obj2 === 'object') {
      const keys = new Set(Object.keys(obj1).concat(Object.keys(obj2)));
      keys.forEach((key) => {
        if (ignores[key] === true) {
          return;
        }
        if (typeof obj1[key] === 'object') {
          objEqual(obj1[key], obj2[key] || {}, ignores[key] || {});
        } else {
          obj1[key] !== obj2[key] && (flag = false);
        }
      });
    }
  }
  objEqual(textObj1, textObj2, equalIgnores);
  return flag;
}

function isSubSign(obj) {
  // return Object.keys(obj).length === 0;
  return !!obj.meta.paraEnd;
}

function combineTextObj(textObj) {
  let textToRender = [];
  let curPara = [];
  let prevT = {};
  textObj.forEach((t) => {
    if (textObjEqual(t, prevT)) {
      prevT.text += t.text;
    } else {
      curPara.push(prevT);
      prevT = Object.assign({}, t);
    }
    if (isSubSign(t)) {
      curPara.push(prevT);
      curPara = curPara.slice(1);
      textToRender.push(curPara);
      curPara = [];
    }
  });
  if (curPara.length > 0) {
    textToRender.push(curPara);
  }
  return textToRender;
}

export {
  parseText,
  generateTextToUpdate,
  getSelection,
  getOffset,
  getOffsetInElem,
  setRangeStart,
  focusInput,
  getPointerPos,
  useCursorBlink,
  textObjEqual,
  combineTextObj
}