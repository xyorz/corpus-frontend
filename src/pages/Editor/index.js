import React, {useState} from 'react'
import Tags from './Tags'
import './editor.css'

function Editor() {
  const [text, setText] = useState([{text: 't', color: 'red'}, {text: 'h', color: 'blue'}]);
  const [tags, setTags] = useState(new Map());

  return (
    <div className="container">
      <Tags /> 
      <div
        contentEditable
        suppressContentEditableWarning
        className="text"
        onInput={(e) => console.log("onInput", e)}
        onKeyUp={(e) => console.log("onKeyUp", e)}
        onPaste={(e) => console.log("onPaste", e)}
        onCopy={(e) => console.log("onCopy", e)}
        onCut={(e) => console.log("onCut", e)}
        onMouseUp={(e) => console.log("onMouseUp", e)}
      >
        {text.map((t, index) => (
          <span 
            key={index}
            style={{color: t.color}} 
          >
            {t.text}
          </span>
        ))}
      </div>
    </div>
  )
}

export default Editor;
