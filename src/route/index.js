import React from 'react'
import {HashRouter, Route, Switch, Redirect, withRouter} from 'react-router-dom'
import NotLiveRoute from 'react-live-route'
import {menuConfig, otherConfig, mainConfig} from './config'

const LiveRoute = withRouter(NotLiveRoute)

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
        <LiveRoute 
          key={route.path}
          exact={route.exact}
          path={route.path}
          component={route.component} 
          alwaysLive={route.keepAlive}
          render={
            () => <RouterConfig config={route.children} />
          }
        />
      ))}
      {/* <Redirect from="/app/*" to="/app/manage" /> */}
    </>
  )
}

const createMainRouter = (config) => () => (
  <HashRouter>
    <Switch>
      {config && config.map((route, index) => (
        <Route 
          key={index}
          exact
          path={route.path}
          component={route.component} 
        />
      ))}
    </Switch>
  </HashRouter>
)

// 根据path找路由配置，返回从父到子的路由列表
const getConfigByPathname = (config) => (pathName) => {
  pathName.indexOf('/') === 0 && (pathName = pathName.slice(1));
  const paths = pathName.split('/');
  let curConfig = config;
  let target;
  let targetList = [];
  for (let i = 0; i < paths.length; i++) {
    target = null;
    if (!curConfig) {
      return [];
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
  return targetList;
}

const ContentRouter = createRouter(menuConfig.concat(otherConfig));
const MainRouter = createMainRouter(mainConfig);
const getMenuConfigByPathname = getConfigByPathname(menuConfig);

export {
  ContentRouter,
  MainRouter,
  getMenuConfigByPathname as getConfigByPathname
}
