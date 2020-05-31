import pages from '../pages'
import App from '../App'

// 菜单路由
let menuConfig = [
  {
    path: '/app/manage',
    component: pages.Manage,
    title: '文档管理',
    icon: 'copy'
  }, {
    path: '/app/editor/local',
    component: pages.Editor,
    title: '文本编辑',
    icon: 'scan',
    exact: true
  }, {
    path: '/app/preset',
    component: pages.Preset,
    title: '预设信息',
    icon: 'edit'
  },{
    path: '/app/hant',
    component: pages.Hant,
    title: '异体字管理',
    icon: 'swap'
  }, {
    path: '/app/upload',
    component: pages.Upload,
    title: '文件上传',
    icon: 'upload',
    keepAlive: true
  }, 
  // {
  //   path: '/app/download',
  //   component: pages.DownLoad,
  //   title: '下载使用文档',
  //   icon: 'download'
  // }
];

// 其他路由
let otherConfig = [
  {
    path: '/app/editor/local/:localId',
    component: pages.Editor,
    title: '文本编辑',
    icon: 'scan',
    exact: true
  },
  {
    path: '/app/editor/remote/:remoteId',
    component: pages.Editor,
    title: '文本编辑',
    icon: 'scan',
    exact: true
  },
];

// 404/登陆等app外页面
let mainConfig = [
  {
    path: '/login',
    component: pages.Login,
    title: '用户登录',
  },
  {
    path: '/app/*',
    component: App,
    title: 'App',
  }
]

export { 
  menuConfig,
  otherConfig,
  mainConfig
};