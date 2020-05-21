import React, {useState, useEffect, useRef} from 'react'
import {useHistory} from 'react-router-dom'
import {Spin, Button, Input, Tooltip, message} from 'antd'
import {useSelector, useDispatch} from 'react-redux'
import API from '../../API'
import Tags from './Tags'
import TagSelector from './TagSelector'
import ZhujieModal from './ZhujieModal'
import {
  parseText,
  generateTextToUpdate,
  getSelection, 
  getOffset, 
  getOffsetInElem, 
  focusInput, 
  paraStartOrEnd,
  getPointerPos, 
  useCursorBlink,
  textObjEqual,
  combineTextObj,
  combineTagsByColor,
  parsePasteText
} from './util'
import useText from './useText'
import {getHashCode, getUrlParams} from '../../util'
import {SET_DOC_INFO_LIST} from '../../redux/actionTypes'
import './editor.css'

const selectedTextStyle = {
  color: "#FFF",
  background: "#3994ef"
}

const eqItems = {
  tag: true,
  meta: {
    // paraEnd: true,
    cursor: true,
    selected: true,
    zhujie: true
  },
}

function Editor() {
  const history = useHistory();
  const urlParams = getUrlParams([0, 1]);
  const [remoteId, localId] = (() => 
    (urlParams[1] === 'local'
      ? [null, urlParams[0]]
      : [urlParams[0], null]
  ))();
  const [enableEdit, setEnableEdit] = useState(true);
  const localDocInfo = useSelector(state => state.storedDocInfoList[localId]);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [textTitle, setTextTitle] = useState('');
  const [titleInputVisible, setTitleInputVisible] = useState(!textTitle);
  const [text, textAPI] = useText();
  const [tags, setTags] = useState(new Set());
  const [offset, setOffset] = useState({startOffset: 0, endOffset: 0});
  const [usingIME, setUsingIME] = useState(false);
  const [pointerPos, setPointerPos] = useState({top: 0, left: 0});
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [ZhujieModalVisible, setZhujieModalVisible] = useState(false);
  const [zhujieVal, setZhujieVal] = useState('');
  const [zhujieIndex, setZhujieIndex] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    API.post('/corpus/authors_info/').then((data) => {
      let initialTags = data.data.list;
      if (remoteId && parseInt(remoteId)) {
        setEnableEdit(false);
        let url, params;
        /section=(.+)\&?/.test(window.location.hash);
        const section = RegExp.$1;
        if (!section) {
          url = '/corpus/doc/';
          params = {id: remoteId};
        } else {
          url = '/corpus/get_section/';
          params = {id: remoteId.split('?')[0], section: decodeURI(section)}
        }
        API.post(url, params).then((data) => {
          const parseResult = parseText(data.data.doc);
          let tagsToAdd = parseResult.tags;
          // initialTags = [...initialTags].filter((it) => {
          //   return !tagsToAdd.some((ta) => ta.color.toUpperCase() === it.color.toUpperCase())
          // })
          // initialTags = new Set(initialTags.concat(tagsToAdd));
          textAPI.insertText(0, parseResult.text);
          setTextTitle(parseResult.title);
          setTitleInputVisible(false);
          setTags(tagsToAdd);
        }).catch((e) => {
          // TODO: handle error
          console.log(e)
        })
      } else if (localDocInfo) {
        initialTags = new Set(combineTagsByColor(initialTags, localDocInfo.tags)); 
        setTextTitle(localDocInfo.title);
        setTags(initialTags);
        // fix tag pointer
        localDocInfo.text.forEach(t => {
          const newTag = [...initialTags].filter(it => it.color.toUpperCase() === t.tag.color.toUpperCase())[0];
          t.tag = newTag;
        });
        textAPI.insertText(0, localDocInfo.text);
      } else {
        setTags(new Set(initialTags));
      }
    }).catch((e) => {
      console.log(e)
      // TODO: handle error
    });
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
    // 空文章
    if (text.length === 0) {
      textObject[textObject.length - 1].meta.paraEnd = true;
      offset.startOrEnd = 'end';
    }
    setOffset({
      startOffset: offset.startOffset + value.length,
      endOffset: offset.startOffset + value.length,
      startOrEnd: offset.startOrEnd
    });
    if (offset.startOrEnd) {
      if (offset.startOrEnd === 'end') {
        textAPI.setTextMeta(offset.startOffset - 1, offset.startOffset, {paraEnd: false});
        textObject[textObject.length - 1].meta.paraEnd = true;
      }
    }
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
      case 'Enter':
        textAPI.setTextMeta(offset.startOffset-1, offset.startOffset, {paraEnd: true});
        textAPI.replaceText(offset.startOffset, offset.endOffset, []);
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
        break;
    } // 键盘事件end
    console.log(key)
  }
  const commitText = () => {
    if (remoteId || !localId) {
      if (!parseInt(remoteId)) remoteId = -1;
      console.log(generateTextToUpdate(text, textTitle, remoteId))
      API.post('/corpus/insert/', generateTextToUpdate(text, textTitle, remoteId))
        .then(() => {
          message.success('修改成功');
          history.push('/app/manage');
        });
    } else {
      // TODO: 处理本地上传文件
      const parseResult = parseText(generateTextToUpdate(text, textTitle, localId));
      dispatch({
        type: SET_DOC_INFO_LIST,
        payload: {
          index: localId,
          docInfo: parseResult
        }
      });
      message.success('修改成功');
      history.push('/app/upload');
    }
  }
  const setZhujie = (val, index) => {
    setZhujieModalVisible(false);
    textAPI.setTextMeta(index, index+1, {zhujie: val, index: index});
  }
  const deleteZhujie = (index) => {
    setZhujieModalVisible(false);
    textAPI.setTextMeta(index, index+1, {zhujie: false});
  }
  const clickZhujie = (val) => {
    setZhujieVal(val);
    setZhujieModalVisible(true);
  }
  // console.log(text)
  // 加载中
  if (loading) {
    return <Spin />
  }
  const textCombine = combineTextObj(text, eqItems);
  // 只读
  if (!enableEdit) {
    return (
      <div className="textContainer">
        <div className="textBox">
          <div className="textTitle" >
            <span>
              {textTitle}
            </span>
          </div>
          <Tags tags={tags} setTags={setTags} editable={false} />
          <div className="textContent">
            {textCombine.map((para, index) => (
              <div key={index} className="para">
                {para.map((t) => (
                  <React.Fragment key={t.meta.hash}>  
                    {t.meta.cursor && offset.startOrEnd !== 'end' && <span className="cursor"></span>}
                    <span 
                      style={t.meta.selected? Object.assign({color: t.tag.color}, selectedTextStyle): {color: t.tag.color}}
                      className={`text`}
                    >
                      {t.text}
                    </span>
                    {t.meta.zhujie? (
                      <Tooltip title={t.meta.zhujie}>
                        <span>[*]</span>
                      </Tooltip>
                    ): ""}
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  return (
    <div 
      className="textContainer" 
    >
      <ZhujieModal 
        visible={ZhujieModalVisible}
        onCancel={() => setZhujieModalVisible(false)}
        onSubmit={setZhujie}
        text={zhujieVal}
        setText={setZhujieVal}
        onDelete={deleteZhujie}
        index={zhujieIndex}
      />
      <TagSelector 
        tags={tags} 
        position={pointerPos}
        visible={selectorVisible} 
        setTextTag={setSelectedTextTag}
        onClickZhujie={() => {setZhujieModalVisible(true); setZhujieVal(""); setZhujieIndex(offset.endOffset)}}
      />
      <div>
        <Button 
          className="confirmBtn"
          onClick={commitText}
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
          let target = e.target;
          while(target && target.getAttribute('class') !== 'textBox') {
            // 标题input
            if (target.getAttribute('class') === 'textTitle') {
              return;
            }
            target = target.parentElement;
          }
          if (!target) {
            return;
          }
          const newOffset = getOffset();
          textAPI.setTextMeta(newOffset.startOffset, newOffset.endOffset, {selected: true});
          setOffset(newOffset); 
          selection.removeAllRanges();
          focusInput(e);
          setPointerPos(getPointerPos(e));
          setSelectorVisible(newOffset.startOffset !== newOffset.endOffset);
          // 鼠标位置
          if (newOffset.startOffset === newOffset.endOffset && newOffset.startOffset) {
            textAPI.setTextMeta(newOffset.startOffset, newOffset.endOffset+1, {cursor: true});
          }
        }}
      >
        <div className="textTitle" >
          {titleInputVisible
            ? <Input
                className="titleInput"
                placeholder="请输入文章标题"
                autoFocus
                onChange={(e) => setTextTitle(e.target.value)}
                value={textTitle}
                onBlur={() => {
                  if (textTitle)
                    setTitleInputVisible(false)
                }}
              /> 
            : <span onClick={() => setTitleInputVisible(true)}>
                {textTitle}
              </span>}
        </div>
        <Tags tags={tags} setTags={setTags} />
        <div className="textContent">
          {textCombine.map((para, index) => (
            <div key={index} className="para">
              {para.map((t) => (
                <React.Fragment key={t.meta.hash}>  
                  {t.meta.cursor && offset.startOrEnd !== 'end' && <span className="cursor"></span>}
                  {t.meta.zhujie? (
                    <Tooltip title={t.meta.zhujie}>
                      <span onClick={() => {clickZhujie(t.meta.zhujie); setZhujieIndex(t.meta.index)}}>[*]</span>
                    </Tooltip>
                  ): ""}
                  <span 
                    style={t.meta.selected? Object.assign({color: t.tag.color}, selectedTextStyle): {color: t.tag.color}}
                    className={`text`}
                  >
                    {t.text}
                  </span>
                </React.Fragment>
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
        onPaste={(e) => {
          const pasteText = parsePasteText(e);
          const resText = [];
          const color2Tag = {};

          for(let t of pasteText) {
            if (color2Tag[t.tagColor.toUpperCase()]) {
              t.tag = color2Tag[t.tagColor.toUpperCase()];
            } else {
              for(let tag of tags) {
                if(tag.color && tag.color.toUpperCase() === t.tagColor.toUpperCase()) {
                  t.tag = tag;
                  color2Tag[tag.color.toUpperCase()] = tag;
                  break;
                }
              }
              if (!t.tag) {
                const tag = {
                  author: '',
                  color: t.tagColor
                };
                tags.add(tag);
                setTags(new Set(tags));
                t.tag = tag;
              }
            }
            for (let i in t.text) {
              resText.push({
                text: t.text[i],
                tag: t.tag,
                meta: {
                  hash: getHashCode(),
                  paraEnd: t.meta.paraEnd && parseInt(i) === t.text.length - 1
                }
              });
            }
          }
          textAPI.insertText(offset.startOffset, resText);
          setOffset({
            startOffset: offset.startOffset + resText.length,
            endOffset: offset.startOffset + resText.length
          })
        }}
      />
    </div>
  )
}

export default Editor;
