import React, {useState} from 'react';
import {Input, Modal, Button} from 'antd';

const { TextArea } = Input;

function ZhujieModal(props) {
  let {text, setText, index, onSubmit, visible, onCancel, onDelete} = props;
  return (
    <Modal
      title="添加注解"
      visible={visible}
      okText="确定"
      cancelText="取消"
      onOk={() => onSubmit(text, index)}
      onCancel={onCancel}
      footer={[
        <Button key="back" type="primary" onClick={() => onSubmit(text, index)}>
          确认
        </Button>,
        <Button key="submit" onClick={onCancel}>
          取消
        </Button>,
        <Button key="delete" type="danger" onClick={() => onDelete(index)}>
          删除
        </Button>,
      ]}
    >
      <TextArea value={text} onChange={e => setText(e.target.value)} rows={3} />
    </Modal>
  )
}

export default ZhujieModal;