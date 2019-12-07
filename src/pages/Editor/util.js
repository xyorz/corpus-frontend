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

export {
  getSelection,
  getOffset,
  setRangeStart,
  focusInput
}