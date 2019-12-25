import React, {useState, useEffect} from 'react'
import {Table, Button, message, Modal, Spin} from 'antd'
import {Link} from 'react-router-dom'
import API from '../../API'
import {parseFile} from './util'
import {parseText} from '../Editor/util'
import FileDragger from './FileDragger'
import {useDispatch} from 'react-redux'
import {PUSH_DOC_INFO_LIST} from '../../redux/actionTypes'

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
  // const [textList, setTextList] = useState([]);
  // const [tagList, setTagList] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const dispatch = useDispatch();
  function handleFileSelect(file) {
    parseFile(file).then((resObj) => {
      const parseResult = parseText(resObj);
      // textList.push(parseResult[0]);
      // tagList.push(parseResult[1]);
      // setTextList(textList.slice());
      // setTagList(tagList.slice());
      dispatch({
        type: PUSH_DOC_INFO_LIST,
        payload: parseResult
      });
      dataSource.push({
        id: dataSource.length + 1,
        document: parseResult.title,
        action: (
          <>
            <Link to={`/editor/local/${dataSource.length}`}>
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