import React, {useState} from 'react'
import {Input, Button, Icon, message} from 'antd'
import API from '../../API'

function InputGroup(props) {
  const {initialValue, type} = props;
  const [values, setValues] = useState(initialValue || []);
  function setValue(index, value) {
    console.log(value, index)
    values[index] = value;
    setValues(values.slice());
  }
  function onSubmit() {
    for(let i in values) {
      if (values[i].trim() === '') {
        message.warn('存在空值，请编辑');
        return;
      }
    }
    API.post('/corpus/set_preset/', {type: type, value: values.join('|')})
      .then(res => {
        if(res.status === 200 && res.data.type && res.data.value){
          setValues(
            res.data.value.split('|')
          );
          message.success('修改成功');
        }
      })
  }
  function addInput() {
    values.push('');
    setValues(values.slice());
  }
  function delInput(index) {
    values.splice(index, 1);
    setValues(values.slice());
  }
  return (
    <div className="inputGroupContainer">
      {values.map((value, index) => (
        <div className="tabInputContainer" key={index} >
          <Input 
            className="tabInput"
            value={value} 
            onChange={(e) => setValue(index, e.target.value)} 
          />
          <Icon 
            type="minus-circle-o" 
            onClick={() => delInput(index)} 
            className="tabInputIcon"
            title="删除项"
          />
        </div>
    ))}
      <Button onClick={addInput} type="dashed" className="button">新增</Button>
      <Button onClick={onSubmit} className="button submit">提交</Button>
    </div>
  )
}

export default InputGroup