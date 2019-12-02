import React from 'react'
import {Layout, Menu, Breadcrumb, Icon} from 'antd'
import './layout.css'
import {menuConfig} from '../route/config'
import {Link, useLocation} from 'react-router-dom'
import {ContentRouter, getConfigListByPathname} from '../route'

const { SubMenu } = Menu;
const { Header, Content, Footer, Sider } = Layout;

function PageLayout(props) {
  let location = useLocation();
  const curRouteConfigList = getConfigListByPathname(location.pathname);
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <div className="logo" />
        <Menu theme="dark" defaultSelectedKeys={['0']} mode="inline" style={{marginTop: '64px'}}>
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
            <Menu.Item>RootManager</Menu.Item>
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