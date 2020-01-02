import React, {useState, useEffect} from 'react'
import {Table, Button, message, Modal, Spin} from 'antd'
import {Link} from 'react-router-dom'
import API from '../../API'
import {parseFile} from './util'
import {parseText} from '../Editor/util'
import FileDragger from './FileDragger'
import Tags from '../Editor/Tags'
import TagWithModal from '../Editor/TagWithModal'
import {useDispatch} from 'react-redux'
import {PUSH_DOC_INFO_LIST} from '../../redux/actionTypes'
import './upload.css'

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
];

const buttonEnableStyle = {
  left: '100%',
  top: '0',
  transform: 'translate(-100%, 0)'
}

const buttonDisableStyle = {
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)'
}

const maskEnableStyle = {
  width: 0,
  height: 0,
  left: '100%',
  top: 0
}

const maskDisableStyle = {
  width: '100%',
  height: '100%',
  top: 0,
  left: 0
}

function Upload(props) {
  const [dataSource, setDataSource] = useState([]);
  const dispatch = useDispatch();
  const [globalTags, setGlobalTags] = useState([]);
  const [enableGlobalTags, setEnableGlobalTags] = useState(false);
  useEffect(() => {
    API.post('/corpus/authors_info/').then((data) => {
      setGlobalTags(data.data.list);
    }).catch((e) => {
      // TODO: handle error
    });
  }, []);
  function handleFileSelect(file) {
    parseFile(file).then((resObj) => {
      const parseResult = parseText(resObj);
      dispatch({
        type: PUSH_DOC_INFO_LIST,
        payload: parseResult
      });
      console.log(parseResult)
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
        ),
        undefinedTags: (
          <>
            {parseResult.tags.map((tag) => {
              const setTag = () => {
                setDataSource([...dataSource]);
                dispatch({
                  type: PUSH_DOC_INFO_LIST,
                  payload: parseResult
                });
              }
              return <TagWithModal tag={tag} setTag={setTag} />
            })}
          </>
        ),
      });
      setDataSource(dataSource.slice());
    })
  }
  function changeEnableGlobalTags() {
    setEnableGlobalTags(enableGlobalTags? false: true);
  }
 
  return (
    <div>
      <div className='tableHeader'>
        <FileDragger
          onSelectFile={handleFileSelect}
          className='fileDragger'
        />
        <div className='commonTags'>
          <div 
            className='commonTagsMask' 
            style={enableGlobalTags? maskEnableStyle: maskDisableStyle}
          >
            <Button 
              ghost={!enableGlobalTags} 
              onClick={changeEnableGlobalTags}
              style={enableGlobalTags? buttonEnableStyle: buttonDisableStyle}
              className='commonTagsButton' 
            >
              {enableGlobalTags? '禁用': '点击启用全局标签'}
            </Button>
          </div>
          <Tags 
            tags={globalTags} 
            setTags={setGlobalTags}
          />
        </div>
      
      </div>
      <Table 
        columns={columns} 
        dataSource={dataSource} 
        rowKey={(data) => data.id} 
      />
      <Button style={{position: 'relative', left: '90%', marginTop: '10px'}}>提交</Button>
    </div>
  )
}

export default Upload;