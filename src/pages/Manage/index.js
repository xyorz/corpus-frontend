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
  )});
  if (!dataSource) {
    return <Spin />
  } else {
    dataSource.forEach((data) => {
      data.action = (
        <>
          <Link to={`/editor/remote/${data.id}`}>
            <Button>修改</Button>
          </Link>
          <Button style={{marginLeft: '10px'}}>删除</Button>
        </>
      )
    })
    return (
      <Table columns={columns} dataSource={dataSource} rowKey={(data) => data.id} />
    )
  }
}

export default Manage;