import React from 'react'
import {Input, Icon, Button} from "antd";

function HantBox(props){
  const {items, delItem, setZh, setHant, addItem, submit} = props;

  return (
    <div className="hantBox">
      {items.map((item, index) => (
        <div className="hantItem" key={index}>
          <Input 
            defaultValue={item.zh} 
            onChange={(e) => setZh(index, e.target.value)} 
            style={{textAlign: 'center'}} 
          />
          <Icon 
            type="swap-right" 
            style={{fontSize: '1.8em'}} 
          />
          <Input 
            defaultValue={item.hant} 
            onChange={(e) => setHant(index, e.target.value)} 
            style={{textAlign: 'center'}} 
          />
          <Icon 
            type="minus-circle-o" 
            style={{fontSize: '1.5em', marginLeft: '15px'}}
            onClick={() => delItem(index)} 
          />
        </div>
      ))}
      <Button 
        className="hantNew" 
        type="dashed" 
        onClick={addItem}
      >
        新增
      </Button>
      <Button className="hantButton" onClick={submit}>提交</Button>
    </div>
  )
}

export default HantBox;
