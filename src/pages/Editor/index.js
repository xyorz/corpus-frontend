import React, {useState, useEffect, useRef} from 'react'
import {useParams} from 'react-router-dom'
import useSWR from 'swr'
import {Spin} from 'antd'
import API from '../../API'
import Tags from './Tags'
import TagSelector from './TagSelector'
import {
  parseText,
  getSelection, 
  getOffset, 
  getOffsetInElem, 
  focusInput, 
  getPointerPos, 
  useCursorBlink,
  textObjEqual
} from './util'
import useText from './useText'
import getHashCode from '../../util/hashUtil'
import './editor.css'

const selectedTextStyle = {
  color: "#FFF",
  background: "#3994ef"
}

function Editor() {
  const {textId} = useParams();
  const [loading, setLoading] = useState(false);
  const [textTitle, setTextTitle] = useState('');
  const [text, textAPI] = useText();
  const [tags, setTags] = useState([]);
  const [offset, setOffset] = useState({startOffset: 0, endOffset: 0});
  const [usingIME, setUsingIME] = useState(false);
  const [pointerPos, setPointerPos] = useState({top: 0, left: 0});
  const [selectorVisible, setSelectorVisible] = useState(false);
  const inputRef = useRef(null);
  useEffect(() => {
    API.post('/corpus/authors_info/').then((data) => {
      setTags(data.data.list);
    }).catch((e) => {
      // TODO: handle error
    });
    if (textId) {
      API.post('/corpus/doc/', {id: textId}).then((data) => {
        const [textRes, tagsRes, titleRes] = parseText(data.data.doc);
        const tagsToAdd = tagsRes.filter((resTag) => {
          return !tags.some((tag) => textObjEqual(resTag, tag));
        });
        setTags(tags.concat(tagsToAdd));
        textAPI.insertText(0, textRes);
        setTextTitle(titleRes);
      }).catch((e) => {
        // TODO: handle error
        console.log(e)
      })
    }
  }, []);
  const selection = getSelection();
  useCursorBlink();
  // 输入事件
  const handleValueInput = (value) => {
    if (!(value = value.trim())) {
      return;
    }
    let textObject = Array.from(value).map((v) => {
      return {
        text: v,
        tag: tags.keys().next().value,
        hash: getHashCode()
      }
    });
    setOffset({
      startOffset: offset.startOffset + value.length,
      endOffset: offset.startOffset + value.length
    });
    textAPI.replaceText(offset.startOffset, offset.endOffset, textObject);
    inputRef.current.value = '';
  }
  const setSelectedTextTag = (tag) => {
    textAPI.setTextTag(offset.startOffset, offset.endOffset, tag);
    textAPI.setTextMeta(offset.startOffset, offset.endOffset, {selected: false});
    setSelectorVisible(false);
    setOffset({
      startOffset: offset.endOffset,
      endOffset: offset.endOffset
    })
  }
  // 键盘事件
  const handleKeyDown = (event) => {
    const key = event.key;
    const ctrlKey = event.ctrlKey;
    switch(key) {
      // 退格
      case 'Backspace': 
        if (offset.startOffset === offset.endOffset) {
          if (offset.startOffset === 0) {
            return;
          }
          textAPI.replaceText(offset.startOffset - 1, offset.endOffset, []);
          setOffset({
            startOffset: offset.startOffset-1,
            endOffset: offset.startOffset-1
          })
        } else {
          textAPI.replaceText(offset.startOffset, offset.endOffset, []);
          setOffset({
            startOffset: offset.startOffset,
            endOffset: offset.startOffset
          })
        }
        break;
      // ctrl + c
      case 'c':
        if (ctrlKey) {
          let range = null;
          try {
            range = selection.getRangeAt(0);
          } catch (e) {
            range = document.createRange();
            selection.addRange(range);
          }
          const offsetInElem = getOffsetInElem(offset);
          if (!offsetInElem) {
            return;
          }
          range.setStart(offsetInElem.startNode, offsetInElem.startOffset);
          range.setEnd(offsetInElem.endNode, offsetInElem.endOffset);
          document.execCommand('copy');
          selection.removeAllRanges();
        }
        break;
      // ctrl + x
      case 'x':
        if (ctrlKey) {
          let range = null;
          try {
            range = selection.getRangeAt(0);
          } catch (e) {
            range = document.createRange();
            selection.addRange(range);
          }
          const offsetInElem = getOffsetInElem(offset);
          if (!offsetInElem) {
            return;
          }
          range.setStart(offsetInElem.startNode, offsetInElem.startOffset);
          range.setEnd(offsetInElem.endNode, offsetInElem.endOffset);
          document.execCommand('copy');
          selection.removeAllRanges();
          textAPI.replaceText(offset.startOffset, offset.endOffset, []);
          setOffset({
            startOffset: offset.startOffset,
            endOffset: offset.startOffset
          })
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
    }
  }
  // 渲染
  if (loading) {
    return <Spin />
  }
  let textToRender = [];
  let prevT = {};
  text.forEach((t) => {
    if (textObjEqual(t, prevT)) {
      prevT.text += t.text;
    } else {
      textToRender.push(prevT);
      prevT = Object.assign({}, t);
    }
  })
  textToRender.push(prevT);
  textToRender = textToRender.slice(1);
  return (
    <div 
      className="textContainer" 
    >
      <TagSelector 
        tags={tags} 
        position={pointerPos}
        visible={selectorVisible} 
        setTextTag={setSelectedTextTag}
      />
      <div
        className="textBox"
        onInput={(e) => {console.log("onInput", e)}}
        onKeyUp={(e) => {console.log("onKeyUp", e, selection)}}
        onPaste={(e) => console.log("onPaste", e)}
        onCopy={(e) => console.log("onCopy", e)}
        onCut={(e) => console.log("onCut", e)}
        onMouseDown={(e) => {
          textAPI.setTextMeta(offset.startOffset, offset.endOffset, {selected: false});
          textAPI.setTextMeta(offset.startOffset, offset.endOffset+1, {cursor: false});
        }}
        onMouseUp={(e) => {
          const newOffset = getOffset();
          textAPI.setTextMeta(newOffset.startOffset, newOffset.endOffset, {selected: true});
          setOffset(newOffset); 
          selection.removeAllRanges();
          focusInput();
          setPointerPos(getPointerPos(e));
          setSelectorVisible(newOffset.startOffset !== newOffset.endOffset);
          // 鼠标位置
          if (newOffset.startOffset === newOffset.endOffset && newOffset.startOffset) {
            textAPI.setTextMeta(newOffset.startOffset, newOffset.endOffset+1, {cursor: true});
          }
        }}
        onFocus={(e) => console.log("focus")}
      >
        <div className="textTitle">{textTitle}</div>
        <Tags tags={tags} setTags={setTags} />
        <div className="textContent">
          {textToRender.map((t, index) => (
            <span 
              key={t.hash}
              style={t.selected? Object.assign({color: t.tag.color}, selectedTextStyle): {color: t.tag.color}}
              className={`text`}
            >
              {t.cursor && <span className="cursor"></span>}
              {t.text}
            </span>
          ))}
        </div>
      </div>
      <input 
        id="contentInput"
        ref={inputRef}
        onKeyDown={handleKeyDown}
        onChange={(e) => {
          if (!usingIME) {
            handleValueInput(e.target.value);
          }
        }} 
        onCompositionEnd={(e) => {
          setUsingIME(false); 
          handleValueInput(e.data)
        }}
        onCompositionStart={(e) => setUsingIME(true)}
      />
    </div>
  )
}

export default Editor;
