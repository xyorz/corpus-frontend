import React from 'react'
import {Form, Icon, Input, Button, Checkbox, message} from 'antd';
import {useHistory} from 'react-router-dom'
import API from '../API'
import './login.css'

function Login(props) {
  const history = useHistory();
  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        API.post('/corpus/login/', values)
          .then((res) => {
            const success = res.data.success;
            if (success) {
              history.push('/app/manage');
            } else {
              message.error('登陆失败！');
            }
          })
        console.log('Received values of form: ', values);
      }
    });
  };
  const { getFieldDecorator } = props.form;
  return (
    <div className="loginContainer">
      <Form onSubmit={handleSubmit} className="login-form">
      <p className="loginTitle">用户登录</p>
        <Form.Item>
          {getFieldDecorator('username', {
            rules: [{ required: true, message: 'Please input your username!' }],
          })(
            <Input
              prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
              placeholder="请输入用户名"
            />,
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }],
          })(
            <Input
              prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="password"
              placeholder="请输入密码"
            />,
          )}
        </Form.Item>
        <Form.Item>
          {/* {getFieldDecorator('remember', {
            valuePropName: 'checked',
            initialValue: true,
          })(<Checkbox>Remember me</Checkbox>)} */}
          <a className="login-form-forgot" href="">
            {/* Forgot password */}
          </a>
          <Button type="primary" htmlType="submit" className="login-form-button">
            登陆
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}


export default Form.create({ name: 'normal_login' })(Login);