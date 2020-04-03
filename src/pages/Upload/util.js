import JSZip from 'jszip'

const parseFile = (f) => {
  let file = f.file;
  function idIncrease1At(id, pos){
    let idArr = id.split('.');
    idArr[pos] = parseInt(idArr[pos]) + 1;
    return idArr.join('.');
  }
  function idSet0At(id, pos){
    let idArr = id.split('.');
    idArr[pos] = 0;
    return idArr.join('.');
  }
  // if(!file.name.endsWith('.docx')){
  //   message.info('仅支持.docx文件的上传');
  //   return;
  // }
  // 读取上传的docx文件用JSZip读取并成DOM对象，用DOM来操作xml
  let reader = new FileReader();
  reader.readAsBinaryString(file);
  return new Promise((resolve, reject) => {
    reader.onload = function () {
      // docx文件支持
      if(file.name.endsWith('.docx')){
        let zip = new JSZip();
        zip.loadAsync(this.result).then(function () {
          zip.files['word/document.xml'].async('string').then((content) => {
            let footContent = zip.files['word/footnotes.xml'] && 
              zip.files['word/footnotes.xml'].async('string');
            return Promise.all([content, footContent])
          }).then(([content, footContent]) => {
            let xmlDoc = new DOMParser().parseFromString(content, "text/xml");
            let footXmlDoc = new DOMParser().parseFromString(footContent, "text/xml");
            let [idCounter, resObject] = ['0.0.0', {}];
            let fileName = file.name.split('.')[0];
            let [docName, sectionName] = fileName.split('-');
            resObject['0'] = {
              document: docName,
              section: sectionName || '',
            };
            xmlDoc.querySelectorAll('p').forEach(pElement => {
              let [spanText, colorLast, zhujieInfo] = ['', '#000000', {content: [], offset: []}];
              if(pElement.querySelector('t')){
                idCounter = idIncrease1At(idCounter, 1);
              }
              pElement.querySelectorAll('r t').forEach(tElement => {
                let prerPr = tElement.previousElementSibling;
                let footNodeText = "";
                let footNode = null;
                if ((footNode = tElement.parentElement.nextSibling && tElement.parentElement.nextSibling.querySelector("footnoteReference"))) {
                  let fId = footNode.getAttribute("w:id");
                  footXmlDoc.querySelectorAll("footnote").forEach(noteEle => {
                    let footId = noteEle.getAttribute("w:id");
                    if (fId === footId) {
                      let textEle = noteEle.querySelectorAll("t");
                      textEle.forEach(textE => {
                        if (textE.innerHTML.trim()) {
                          footNodeText += textE.innerHTML.trim();
                        }
                      })
                    }
                  });
                }
                // 找到上一个最近的rpr
                while(prerPr.tagName !== 'w:rPr'){
                  prerPr = prerPr.previousElementSibling;
                }
                let preSiblingColor = prerPr.querySelector('color');
                let color = preSiblingColor? '#' + preSiblingColor.getAttribute('w:val'): '#000000';
                if(color === colorLast){
                  spanText += tElement.innerHTML;
                }
                else{
                  if(spanText.trim()){
                    idCounter = idIncrease1At(idCounter, 2);
                    resObject[idCounter] = {
                      color: colorLast,
                      text: spanText
                    };
                    if (zhujieInfo.content.length > 0) {
                      resObject[idCounter].zhujie = JSON.stringify(zhujieInfo);
                      zhujieInfo = {content: [], offset: []};
                    }
                  }
                  spanText = tElement.innerHTML;
                }
                if (footNodeText) {
                  zhujieInfo.content.push(footNodeText);
                  zhujieInfo.offset.push(spanText.length-1);
                }
                colorLast = color;
              });
              if(spanText){
                idCounter = idIncrease1At(idCounter, 2);
                resObject[idCounter] = {
                  color: colorLast,
                  text: spanText
                };
                if (zhujieInfo.content.length > 0) {
                  resObject[idCounter].zhujie = JSON.stringify(zhujieInfo);
                  zhujieInfo = {content: [], offset: []};
                }
              }
              idCounter = idSet0At(idCounter, 2);
            });
            resolve(resObject);
          })
        });
      }
      // 文本文件
      else{
        let [idCounter, resObject] = ['0.0.1', {}];
        let textList = this.result.split(/\n/g);
        resObject['0'] = {
          document: file.name,
        };
        textList.forEach(text => {
          idCounter = idIncrease1At(idCounter, 1);
          resObject[idCounter] = {
            color: '#000000',
            text: text.trim()
          }
        });
        resolve(resObject);
      }
    };
  });
};

export {
  parseFile,
}