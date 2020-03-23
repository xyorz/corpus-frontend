import React, {useState} from 'react';
import {Input, Modal, Icon, Button, message} from 'antd';

const { TextArea } = Input;

function DetailModal(props) {
  let {visible, initDetails, onCancel, onSubmit} = props;
  if (initDetails) {
    const dts = [];
    for (let key of Object.keys(initDetails)) {
      dts.push({name: key, value: initDetails[key]});
    }
    initDetails = dts;
  } else {
    initDetails = [{name: '', value: ''}];
  }
  const [details, setDetails] = useState(initDetails);
  const addDetail = function () {
    details.push({name: '', value: ''});
    setDetails(details.slice());
  }
  const delDetail = (index) => () => {
    details.splice(index, 1);
    setDetails(details.slice());
  }
  const setDetail = (index, type) => (e) => {
    details[index][type] = e.target.value;
    setDetails(details.slice());
  }
  const submitDetail = () => {
    for (let item of details) {
      if(!item.name || !item.value) {
        message.warn("请填写完整所有项目!");
        return;
      }
    }
    let commitValue = details;
    let commitObj = {};
    for (let i of commitValue) {
      commitObj[i.name] = i.value;
    }
    if (!details || details.length === 0) {
      commitObj = null;
    }
    onSubmit(commitObj);
  }
  return (
    <Modal
      title="标签详情"
      visible={visible}
      okText="确定"
      cancelText="取消"
      onOk={submitDetail}
      onCancel={onCancel}
    >
      {details.map((detail, index) => (
        <div key={index} style={{display: 'flex', justifyContent: 'space-between', marginTop: '20px'}}>
          <Input 
            placeholder="字段名" 
            value={detail.name} 
            style={{flexBasis: '33%'}}
            onChange={setDetail(index, 'name')} 
          />
          <TextArea 
            rows={1} 
            value={detail.value}
            style={{flexBasis: '56%'}}
            onChange={setDetail(index, 'value')} 
          />
          <Icon type="minus-circle" style={{flexBasis: '6%', fontSize: '20px', marginTop: '6px', cursor: 'pointer'}} onClick={delDetail(index)} />
        </div>
      ))}
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <Button style={{width: '75%', marginTop: '20px'}} onClick={addDetail}>添加字段</Button>
      </div>
    </Modal>
  )
}

export default DetailModal;