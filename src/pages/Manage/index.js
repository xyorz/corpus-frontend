import React, {useState, useEffect} from 'react'
import {Table, Button, message, Modal} from 'antd'
import {Link} from 'react-router-dom'
import API from '../../API'

const columns = [
  {
    align: 'center',
    title: 'id',
    dataIndex: 'id',
  }, {
    align: 'center',
    title: '文档名',
    dataIndex: 'document',
  }, {
    align: 'center',
    title: '操作',
    dataIndex: 'action',
  },
]

function Manage(props) {
  const [dataSource, setDataSource] = useState([]);
  useEffect(() => {
    API.post('/corpus/manage/').then(data => {
      const list = data.data.list;
      setDataSource(list)
      console.log(list)
    }
  )}, []);
  // 隐藏没有章节的行的展开图标
  useEffect(() => {
    const btList = Array.from(document.querySelectorAll(".ant-table-row-expand-icon.ant-table-row-collapsed"));
    for (let i in dataSource) {
      if (!dataSource[i].sections || dataSource[i].sections.length === 0) {
        btList[i] && (btList[i].style.visibility = 'hidden');
      }
    }
  }, [dataSource]);
  function deleteDoc(docId) {
    Modal.confirm({
      title: '确认删除此文档？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        API.post('/corpus/delete/', {id: docId}).then((data) => {
          setDataSource(data.data.docList);
          message.success('删除成功！');
        })
      }
    })
  }
  const expandedRowRender = data => {
    if (!data.sections) {
      return null
    }
    const columns = [
      {
        align: 'center',
        title: '章节名',
        dataIndex: 'section',
      }, {
        align: 'center',
        title: '操作',
        dataIndex: 'action',
      }
    ];
    const sections = data.sections;
    const dataSource = sections.map(section => {
      return {
        section: section,
        action: (
          <Link to={{
            pathname: `/app/editor/remote/${data.id}`,
            search: `?section=${encodeURI(section)}`
          }}>
            <Button>浏览</Button>
          </Link>
        )
      }
    })
    return (
      <Table columns={columns} dataSource={dataSource} rowKey={data => data.section} pagination={false} />
    )
  }
  dataSource.forEach(data => {
    data.action = (
      <>
        {/* <Link to={`/app/editor/remote/${data.id}`}>
          <Button>浏览</Button>
        </Link> */}
        <Button 
          style={{marginLeft: '10px'}}
          onClick={() => deleteDoc(data.id)}
        >
          删除
        </Button>
      </>
    )
    if (data.sections && typeof data.sections === 'string') {
      data.sections = JSON.parse(data.sections).list;
    }
  })
  return (
    <Table columns={columns} dataSource={dataSource} rowKey={data => data.id} expandedRowRender={expandedRowRender}  />
  )
}

export default Manage;