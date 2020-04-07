import React, {useState} from 'react'
import {Input, Icon, Modal, Button, message} from 'antd'

function Zh2HantAddModal (props) {
  const {visible, setVisible, onSubmit} = props;
  const [list, setList] = useState([{zh: "", hant: ""}]);
  const add = () => {
    list.push({zh: "", hant: ""});
    setList([...list]);
  }
  const del = index => {
    list.splice(index, 1);
    setList([...list]);
  }
  const change = (index, key, val) => {
    list[index][key] = val;
    setList([...list]);
  }
  const check = () => {
    if (list.length === 0) {
      message.warn("至少添加一项！");
      return false;
    }
    for (let item of list) {
      if (!item.zh || !item.hant) {
        message.warn("请填写完整所有项！");
        return false;
      };
      if (item.zh.length !== 1 || item.hant.length !== 1) {
        message.warn("存在项长度不正确！");
        return false;
      }
    }
    return true;
  }
  return (
    <Modal visible={visible} onCancel={() => setVisible(false)} onOk={() => {check() && onSubmit(list)}}>
      <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
        {list.map((item, index) => (
          <div className="hantItem" style={{marginTop: '20px'}} key={index}>
            <Input 
              value={item.zh}
              onChange={e => change(index, 'zh', e.target.value)}
              style={{textAlign: 'center'}} 
            />
            <Icon 
              type="swap-right" 
              style={{fontSize: '1.8em'}} 
            />
            <Input 
              value={item.hant}
              onChange={e => change(index, 'hant', e.target.value)}
              style={{textAlign: 'center'}} 
            />
            <div>
              <a 
                style={{display: 'block', width: '36px', marginLeft: '15px'}}
                onClick={() => del(index)}
              >
                删除
              </a>
            </div>
          </div>
        ))}
        <Button onClick={add} style={{marginTop: '20px', width: '60%'}} type="dashed">添加</Button>
      </div>
    </Modal>
  )
}

export default Zh2HantAddModal;