import React from 'react'
import {HashRouter, Route, Redirect} from 'react-router-dom'
import {menuConfig, otherConfig} from './config'

let createRouter = (config) => (props) => {
  return (
    <HashRouter>
      <RouterConfig config={config} />
      {props.children}
    </HashRouter>
  )
}

function RouterConfig(props) {
  const config = props.config;
  return (
    <>
      {config && config.map((route) => (
        <Route 
          key={route.path}
          exact={route.exact}
          path={route.path}
          component={route.component} 
          render={
            () => <RouterConfig config={route.children} />
          }
        />
      ))}
      <Redirect from="/*" to="/manage" />
    </>
  )
}

// 根据path找路由配置
const getConfigByPathname = (returnList) => (config) => (pathName) => {
  pathName.indexOf('/') === 0 && (pathName = pathName.slice(1));
  const paths = pathName.split('/');
  let curConfig = config;
  let target;
  let targetList = [];
  for (let i = 0; i < paths.length; i++) {
    target = null;
    if (!curConfig) {
      return target;
    }
    curConfig.some((conf) => {
      if (conf.path === '/' + paths[i]) {
        target = conf;
        targetList.push(conf);
        return true;
      }
      return false;
    })
    curConfig = (target && target.children) || null;
  }
  return returnList? targetList: target;
}

const ContentRouter = createRouter(menuConfig.concat(otherConfig));
const MainRouter = createRouter();
const getMenuConfigByPathname = getConfigByPathname(false)(menuConfig);
const getMenuConfigListByPathname = getConfigByPathname(true)(menuConfig);

export {
  ContentRouter,
  MainRouter,
  getMenuConfigByPathname as getConfigByPathname,
  getMenuConfigListByPathname as getConfigListByPathname
}
