import React, {useState, useEffect} from 'react'
import {Table, Button, message, Modal, Spin} from 'antd'
import {Link} from 'react-router-dom'
import API from '../../API'

const columns = [
  {
    align: 'center',
    title: 'id',
    dataIndex: 'id',
  }, {
    align: 'center',
    title: '标题',
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
    API.post('/corpus/manage/').then((data) => {
      setDataSource(data.data.list)
    }
  )}, []);
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
  if (!dataSource) {
    return <Spin />
  } else {
    dataSource.forEach((data) => {
      data.action = (
        <>
          <Link to={`/app/editor/remote/${data.id}`}>
            <Button>修改</Button>
          </Link>
          <Button 
            style={{marginLeft: '10px'}}
            onClick={() => deleteDoc(data.id)}
          >
            删除
          </Button>
        </>
      )
    })
    return (
      <Table columns={columns} dataSource={dataSource} rowKey={(data) => data.id} />
    )
  }
}

export default Manage;