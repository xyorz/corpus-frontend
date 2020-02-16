import React from 'react'
import {Layout, Menu, Breadcrumb, Icon, message} from 'antd'
import {useSelector} from 'react-redux'
import {menuConfig} from '../route/config'
import {Link, useLocation, useHistory} from 'react-router-dom'
import {ContentRouter, getConfigByPathname} from '../route'
import API from '../API'
import './layout.css'

const {SubMenu} = Menu;
const {Header, Content, Footer, Sider} = Layout;

function PageLayout(props) {
  const location = useLocation();
  const history = useHistory();
  const userInfo = useSelector(state => state.userInfo);
  const curRouteConfigList = getConfigByPathname(location.pathname);
  function logOut() {
    API.post('/corpus/logout/')
      .then((res) => {
        if (res.data.success) {
          message.success('登出成功');
          history.push('/login');
        }
      })
  }
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <div className="logo">语料库后台管理系统</div>
        <Menu theme="dark" defaultSelectedKeys={['0']} mode="inline">
          {menuConfig.map((config, index) => {
            if (!config.children) {
              return (
                <Menu.Item key={index}>
                  <Link to={config.path}>
                    <Icon type={config.icon} />
                    <span>{config.title}</span>
                  </Link>
                </Menu.Item>
              )
            } else {
              return (
                <SubMenu 
                  key={index}
                  title={
                    <span>
                      <Icon type={config.icon} />
                      <span>{config.title}</span>
                    </span>
                  }
                >
                  {config.children.map((child, index) => (
                    <Menu.Item key={index}>
                      <Link to={child.path}>
                        <Icon type={child.icon} />
                        <span>{child.title}</span>
                      </Link>
                    </Menu.Item>
                  ))}
                </SubMenu>
              )
            }
          })}
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ zIndex: 1, width: '100%' }}>
          <Menu
            theme="dark"
            mode="horizontal"
            style={{ lineHeight: '64px', display: 'flex', justifyContent: 'flex-end' }}
          >
            <Menu.Item onClick={logOut} title="点击登出">{userInfo.username}</Menu.Item>
          </Menu>
        </Header>
        <Content style={{ margin: '0 16px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>首页</Breadcrumb.Item>
            {curRouteConfigList && curRouteConfigList.map((config, index) => (
              <Breadcrumb.Item key={index}>{config.title}</Breadcrumb.Item>
            ))}
          </Breadcrumb>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            <ContentRouter />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
      </Layout>
    </Layout>
  )
}

export default PageLayout