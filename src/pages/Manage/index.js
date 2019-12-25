import React from 'react'
import useSWR from 'swr'
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
  const {data} = useSWR('/corpus/manage', API.get);
  if (!data) {
    return <Spin />
  } else {
    const dataSource = data.data.list;
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
      <Table columns={columns} dataSource={data.data.list} rowKey={(data) => data.id} />
    )
  }
}

export default Manage;