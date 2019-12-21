import React, {useState, useEffect} from 'react'
import {Table, Button, message, Modal, Spin} from 'antd'
import {Link} from 'react-router-dom'
import API from '../../API'
import {parseFile, cc} from './util'
import {parseText} from '../Editor/util'
import FileDragger from './FileDragger'

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
  }, {
    align: 'center',
    title: '未定义标签',
    dataIndex: 'undefinedTags'
  }
]

function Upload(props) {
  const [textList, setTextList] = useState([]);
  const [tagList, setTagList] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  function handleFileSelect(file) {
    parseFile(file).then((resObj) => {
      const res = parseText(resObj);
      textList.push(res[0]);
      tagList.push(res[1]);
      setTextList(textList.slice());
      setTagList(tagList.slice());

      dataSource.push({
        id: dataSource.length + 1,
        document: res[2],
        action: (
          <>
            <Link to={`/editor/${dataSource.length + 1}`}>
              <Button>修改</Button>
            </Link>
            <Button style={{marginLeft: '10px'}}>删除</Button>
          </>
        )
      });
      setDataSource(dataSource.slice());
    })
  }
 
  console.log("render" , dataSource)
  return (
    <div>
      <FileDragger onSelectFile={handleFileSelect} />
      <Table 
        columns={columns} 
        dataSource={dataSource} 
        rowKey={(data) => data.id} 
      />
    </div>
  )
}

export default Upload;