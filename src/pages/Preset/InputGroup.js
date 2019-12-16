import React, {useState} from 'react'
import {Input, Button} from 'antd'

function InputGroup(props) {
  const {initialValue, onSubmit} = props;
  const [values, setValues] = useState(initialValue || []);
  function setValue(index, value) {
    values[index] = value;
    setValues(values);
  }
  return (
    <div className="inputGroupContainer">
      {values.map((value, index) => (
        <Input value={value} onChange={(e) => setValue(index, e.target.value)} />
    ))}
      <Button onClick={() => onSubmit(values)}>提交</Button>
    </div>
  )
}

export default InputGroup