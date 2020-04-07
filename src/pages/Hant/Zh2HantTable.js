import React from 'react'
import {Table, Input, Icon, Popconfirm, message } from 'antd'

function Zh2HantTable (props) {
  const {data, update, page, onChangePage, total} = props;
  const columns = [
    {
      title: "box1",
      dataIndex: 'box1',
      key: 'box1Id',
      render: data => (
        <div className="hantItem">
          <Input 
            defaultValue={data.zh} 
            disabled
            style={{textAlign: 'center'}} 
          />
          <Icon 
            type="swap-right" 
            style={{fontSize: '1.8em'}} 
          />
          <Input 
            defaultValue={data.hant} 
            onBlur={e => {
              const val = e.target.value;
              if (val.length !== 1) {
                message.warn("长度不正确！");
                return;
              }
              val !== data.hant && update('update', data.id, null, val)
            }}
            style={{textAlign: 'center'}} 
          />
            <div>
              <Popconfirm 
                title="确认删除？" 
                okText="是" 
                cancelText="否"
                onConfirm={() => update('delete', data.id, null, null)}
              >
                <a 
                  style={{display: 'block', width: '36px', marginLeft: '15px'}}
                  href="#"
                >
                  删除
                </a>
              </Popconfirm>
            </div>
        </div>
      )
    },
    {
      title: "box2",
      dataIndex: 'box2',
      key: 'box2Id',
      render: data => {
        if (!data) {
          return null;
        }
        return (
          <div className="hantItem" style={{marginLeft: '40px'}}>
            <Input 
              defaultValue={data.zh} 
              disabled
              style={{textAlign: 'center'}} 
            />
            <Icon 
              type="swap-right" 
              style={{fontSize: '1.8em'}} 
            />
            <Input 
              defaultValue={data.hant} 
              onBlur={e => {
                const val = e.target.value;
                if (val.length !== 1) {
                  message.warn("长度不正确！");
                  return;
                }
                val !== data.hant && update('update', data.id, null, val)
              }}
              style={{textAlign: 'center'}} 
            />
            <div>
              <Popconfirm 
                title="确认删除？" 
                okText="是" 
                cancelText="否"
                onConfirm={() => update('delete', data.id, null, null)}
              >
                <a 
                  style={{display: 'block', width: '36px', marginLeft: '15px'}}
                  href="#"
                >
                  删除
                </a>
              </Popconfirm>
            </div>
          </div>
        )
      }
    }
  ]
  const paginationConfig = {
    current: page,
    pageSize: 10,
    showQuickJumper: true,
    onChange: onChangePage,
    total: total
    }
  return (<Table columns={columns} dataSource={data} rowKey='id' className="zh2HantTable" pagination={paginationConfig} />)
}

export default Zh2HantTable;