import pages from '../pages'

// 菜单路由
let menuConfig = [
  {
    path: '/manage',
    component: pages.Manage,
    title: '文档管理',
    icon: 'copy'
  }, {
    path: '/editor',
    component: pages.Editor,
    title: '文本编辑',
    icon: 'scan',
    exact: true
  }, {
    path: '/preset',
    component: pages.Preset,
    title: '预设信息',
    icon: 'edit'
  },{
    path: '/hant',
    component: pages.Hant,
    title: '异体字管理',
    icon: 'swap'
  }, {
    path: '/upload',
    component: pages.Upload,
    title: '文件上传',
    icon: 'upload'
  }, {
    path: '/download',
    component: pages.DownLoad,
    title: '下载使用文档',
    icon: 'download'
  }
];

// 其他路由
let otherConfig = [
  {
    path: '/editor/:textId',
    component: pages.Editor,
    title: '文本编辑',
    icon: 'scan',
    exact: true
  }
]

export { 
  menuConfig,
  otherConfig
};