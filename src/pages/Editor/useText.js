import {useState} from 'react'

function useText(initialText) {
  const [text, setText] = useState(initialText || []);
  function deleteText(startOffset, endOffset) {
    setText(text.slice(startOffset, endOffset));
  }
  function insertText(offset, textToInsert) {
    setText(text.slice(0, offset).concat(textToInsert, text.slice(offset)));
  }
  function spliceText(offset, deleteCount, textToInsert) {
    setText(text.slice(0, offset).concat(textToInsert, text.slice(offset + deleteCount)));
  }
  function replaceText(startOffset, endOffset, textToInsert) {
    setText(text.slice(0, startOffset).concat(textToInsert, text.slice(endOffset)))
  }
  function setTextMeta(startOffset, endOffset, meta) {
    const textSlice = text.slice(startOffset, endOffset);
    textSlice.forEach((t) => {
      Object.assign(t, meta);
    });
    setText(text.slice(0, startOffset).concat(textSlice, text.slice(endOffset)));
  }
  return [
    text,
    {
      deleteText,
      insertText,
      spliceText,
      replaceText,
      setTextMeta
    }
  ]
}

export default useText;