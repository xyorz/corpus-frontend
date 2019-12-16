import React, {useState} from 'react'
import {Input, Icon} from "antd";
import './hant.css'

function HantBox(props){
  const {initialItems} = props;
  const [items, setItems] = useState(initialItems || [])
  function delItem(index) {
    items.splice(index, 1);
    setItems(items);
  }
  function setItem(index, item) {
    items[index] = item;
    setItems(items);
  }
  return (
    <div className="hantBox">
      {items.map((item, index) => (
        <div className="hantItem">
          <Input defaultValue={item.zh} disabled />
          <Icon type="swap-right" style={{fontSize: '1.8em'}} />
          <Input defaultValue={item.hant} onChange={(e) => setItem(index, e.target.value)} />
          <Icon type="minus-circle-o" style={{fontSize: '1.5em'}} onClick={() => delItem(index)} />
        </div>
      ))}
    </div>
  )
}

export default HantBox;
