import React, {useState} from 'react';
import {Tag, Form, Input, Modal, Select} from 'antd';
import {CirclePicker} from 'react-color'
import {defaultTag} from '../../util/config'

const { Option } = Select;

const colors = ["#f44336", "#e91e63", "#9c27b0", "#3f51b5", "#2196f3", "#009688", "#4caf50", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff5722", "#795548", "#607d8b"];
let defaultInitial = {};
console.log('defaultTag:', defaultTag)
for(let key in defaultTag) {
  defaultInitial[key] = [];
}
defaultInitial.color = colors;
console.log(defaultInitial)

function TagWithModal(props) {
  const [visible, setVisible] = useState(false);
  const {tag, setTag, form} = props
  const initial = props.initial || defaultInitial;
  const {getFieldDecorator, setFieldsValue, getFieldValue} = form;
  function handleSubmit() {
    form.validateFields((err, values) => {
      if (!err) {
        values.color = values.color.hex;
        Object.assign(tag, values);
        setTag(tag);
        setVisible(false);
      }
    })
  }
  function handleCancel() {
    setVisible(false);
  }
  initial.color = initial.color.map((c) => c.toUpperCase());
  if (tag.color && !initial.color.includes(tag.color.toUpperCase())) {
    initial.color.push(tag.color.toUpperCase());
  }
  return (
    <>
      <Tag 
        color={tag.color}
        onClick={() => setVisible(true)}
      >
        {tag.author || '未编辑'}
      </Tag>
      <Modal
        title="标签编辑"
        visible={visible}
        okText="确定"
        cancelText="取消"
        onOk={handleSubmit}
        onCancel={handleCancel}
      >
        <Form style={{width: "60%", marginLeft: "20%"}}>
          <Form.Item>
            {getFieldDecorator('author', {
              rules: [{ required: true, message: '请输入作者!' }],
              initialValue: tag.author || ""
            })(
              <Input
                suffix={<span style={{ color: 'rgba(0,0,0,.25)' }}>作者</span>}
                placeholder="请输入作者"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('dynasty', {
              rules: [{ required: true, message: '请输入朝代!' }],
              initialValue: tag.dynasty || ''
            })(
              <Select
                showSearch
                notFoundContent={''}
                suffixIcon={<span style={{ color: 'rgba(0,0,0,.25)', fontSize: '14px' }}>朝代</span>}
                placeholder=''
                optionFilterProp='children'
                onSearch={(e) => {
                  if(e){
                    setFieldsValue({dynasty: e});
                  }
                }}
                filterOption={(input, option) =>
                  option.props.children.indexOf(input) >= 0
                }
              >
                {initial.dynasty.map((item, index) => (
                  <Option value={item} key={index}>{item}</Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('type', {
              rules: [{ required: true, message: '请输入译体!' }],
              initialValue: tag.type || ''
            })(
              <Select
                showSearch
                notFoundContent={''}
                suffixIcon={<span style={{ color: 'rgba(0,0,0,.25)', fontSize: '14px' }}>译体</span>}
                placeholder='请选择译体'
                optionFilterProp='children'
                onSearch={(e) => {
                  if(e){
                    setFieldsValue({type: e});
                  }
                }}
                filterOption={(input, option) =>
                  option.props.children.indexOf(input) >= 0
                }
              >
                {initial.type.map((item, index) => (
                  <Option value={item} key={index}>{item}</Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('area', {
              rules: [{ required: true, message: '请输入地域!' }],
              initialValue: tag.area || ''
            })(
              <Select
                showSearch
                notFoundContent={''}
                suffixIcon={<span style={{ color: 'rgba(0,0,0,.25)', fontSize: '14px' }}>地域</span>}
                placeholder='请选择地域'
                optionFilterProp='children'
                onSearch={(e) => {
                  if(e){
                    setFieldsValue({area: e});
                  }
                }}
                filterOption={(input, option) =>
                  option.props.children.indexOf(input) >= 0
                }
              >
                {initial.area.map((item, index) => (
                  <Option value={item} key={index}>{item}</Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('color', {
              rules: [{ required: true, message: '请选择颜色!' }],
              initialValue: tag.color || ''
            })(
              <CirclePicker 
                colors={initial.color}
                color={getFieldValue('color')}
                circleSize={26.4}
                onChange={(e) => setFieldsValue({color: e.hex})}
                width={'100%'}
              />
            )}
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default Form.create()(TagWithModal);

