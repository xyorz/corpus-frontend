import React, {useState} from 'react'
import {Button, Modal, Input, Radio, message} from 'antd'

function DocumentEditModal(props) {
  const {visible, onCancel, onSubmit} = props;
  const [documentList, setDocumentList] = useState(['']);
  const [documentSelected, setDocumentSelected] = useState(0);
  const onChangeDoc = (val, index) => {
    documentList[index] = val;
    setDocumentList([...documentList]);
  }
  const onAddDoc = () => {
    documentList.push('');
    setDocumentList([...documentList]);
  }
  const handleOk = () => {
    if (!documentList[documentSelected]) {
      message.warn("文档名不能为空!");
      return;
    }
    onSubmit(documentList[documentSelected]);
  }
  return (
    <Modal visible={visible} onCancel={onCancel} onOk={handleOk} title="选择所属文档">
      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        <Radio.Group onChange={(e) => setDocumentSelected(e.target.value)} value={documentSelected} style={{width: '70%'}}>
          {documentList.map((doc, index) => (
            <div style={{display: 'flex', alignItems: 'center', marginTop: '20px'}} key={index}>
              <Input value={doc} onChange={e => onChangeDoc(e.target.value, index)} placeholder="请输入文档名" />
              <Radio value={index} style={{marginLeft: '15px'}} />
            </div>
          ))}
        </Radio.Group>
        <Button type="dashed" style={{width: '50%', marginTop: '20px'}} onClick={onAddDoc}>添加</Button>
      </div>
    </Modal>
  )
}

export default DocumentEditModal;