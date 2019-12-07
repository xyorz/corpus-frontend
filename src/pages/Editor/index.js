import React, {useState, useEffect} from 'react'
import Tags from './Tags'
import {getSelection, getOffset, focusInput} from './util'
import useText from './useText'
import './editor.css'

const presetTags = new Set([
  {color: '#f44336', name: '李白'},
  {color: '#3f51b5', name: '杜甫'},
  {color: '#8bc34a', name: '白居易'},
  {color: '#ff5722', name: '苏轼'}
])

const selectedTextStyle = {
  color: "#FFF",
  background: "#3994ef"
}

function Editor() {
  const [text, textAPI] = useText();
  const [tags, setTags] = useState(presetTags);
  const [offset, setOffset] = useState({startOffset: 0, endOffset: 0});
  const selection = getSelection();
  const handleInputValue = (value) => {
    if (!(value = value.trim())) {
      return;
    }
    let textObject = Array.from(value).map((v) => {
      return {
        text: v,
        tag: tags.keys().next().value
      }
    })
    setOffset({
      startOffset: offset.startOffset + value.length,
      endOffset: offset.startOffset + value.length
    })
    textAPI.replaceText(offset.startOffset, offset.endOffset, textObject);
  }

  return (
    <div 
      className="textContainer" 
      id="textContent"
    >
      <Tags tags={tags} setTags={setTags} />
      <div
        className="textBox"
        onInput={(e) => {console.log("onInput", e)}}
        onKeyUp={(e) => {console.log("onKeyUp", e, selection)}}
        onPaste={(e) => console.log("onPaste", e)}
        onCopy={(e) => console.log("onCopy", e)}
        onCut={(e) => console.log("onCut", e)}
        onMouseDown={(e) => {
          textAPI.setTextMeta(offset.startOffset, offset.endOffset, {selected: false})
        }}
        onMouseUp={(e) => {
          const newOffset = getOffset();
          textAPI.setTextMeta(newOffset.startOffset, newOffset.endOffset, {selected: true});
          setOffset(newOffset); 
          selection.removeAllRanges();
          focusInput(); 
        }}
        onCompositionEnd={(e) => {console.log("onCompositionEnd", e.data)}}
        onCompositionStart={(e) => {console.log("onCompositionStart", e)}}
        onFocus={(e) => console.log("focus")}
      >
        {text.map((t, index) => (
          <span 
            key={index}
            style={t.selected? Object.assign({color: t.tag.color}, selectedTextStyle): {color: t.tag.color}}
            className="text"
          >
            {t.text}
          </span>
        ))}
      </div>
      <input 
        id="contentInput"
        onChange={(e) => handleInputValue(e.target.value)} 
        value=""
      />
    </div>
  )
}

export default Editor;
