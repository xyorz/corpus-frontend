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
      Object.assign(t.meta, meta);
    });
    setText(text.slice());
  }
  function setTextTag(startOffset, endOffset, tag) {
    const textSlice = text.slice(startOffset, endOffset);
    textSlice.forEach((t) => {
      t.tag = tag;
    });
    setText(text.slice());
  }
  return [
    text,
    {
      deleteText,
      insertText,
      spliceText,
      replaceText,
      setTextMeta,
      setTextTag
    }
  ]
}

export default useText;