import React, {useState, useEffect, useRef} from 'react'
import {useParams} from 'react-router-dom'
import {Spin, Button} from 'antd'
import {useSelector} from 'react-redux'
import API from '../../API'
import Tags from './Tags'
import TagSelector from './TagSelector'
import {
  parseText,
  generateTextToUpdate,
  getSelection, 
  getOffset, 
  getOffsetInElem, 
  focusInput, 
  getPointerPos, 
  useCursorBlink,
  textObjEqual,
  combineTextObj
} from './util'
import useText from './useText'
import getHashCode from '../../util/hashUtil'
import './editor.css'

const selectedTextStyle = {
  color: "#FFF",
  background: "#3994ef"
}

function Editor() {
  const {remoteId, localId} = useParams();
  const localDocInfo = useSelector(state => state.storedDocInfoList[localId]);
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
    if (remoteId) {
      API.post('/corpus/doc/', {id: remoteId}).then((data) => {
        const parseResult = parseText(data.data.doc);
        const tagsToAdd = parseResult.tags.filter((resTag) => {
          return !tags.some((tag) => textObjEqual(resTag, tag));
        });
        setTags(tags.concat(tagsToAdd));
        textAPI.insertText(0, parseResult.text);
        setTextTitle(parseResult.title);
      }).catch((e) => {
        // TODO: handle error
        console.log(e)
      })
    } else if (localDocInfo) {
      setTags(localDocInfo.tags);
      setTextTitle(localDocInfo.title);
      textAPI.insertText(0, localDocInfo.text);
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
        meta: {
          hash: getHashCode()
        }
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
            startOffset: offset.startOffset - 1,
            endOffset: offset.startOffset - 1
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
      <div>
        <Button 
          className="confirmBtn"
          onClick={() => console.log(generateTextToUpdate(text, remoteId))}
        >
          提交
        </Button>
      </div>
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
          console.log(newOffset)
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
          {combineTextObj(text).map((para, index) => (
            <div key={index}>
              {para.map((t) => (
                <span 
                key={t.meta.hash}
                style={t.meta.selected? Object.assign({color: t.tag.color}, selectedTextStyle): {color: t.tag.color}}
                className={`text`}
              >
                {t.meta.cursor && <span className="cursor"></span>}
                {t.text}
              </span>
              ))}
            </div>
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
