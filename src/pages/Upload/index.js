import React, {useState, useEffect, useRef} from 'react'
import {Table, Button, message, Modal, Select} from 'antd'
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import {Link, useHistory} from 'react-router-dom'
import API from '../../API'
import {parseFile, combineSectionToDocument} from './util'
import {parseText, generateTextToUpdate} from '../Editor/util'
import FileDragger from './FileDragger'
import DocumentEditModal from './DocumentEditModal'
import DragableRow from './DragableRow'
import Tags from '../Editor/Tags'
import TagWithModal from '../Editor/TagWithModal'
import {useDispatch, useSelector} from 'react-redux'
import {PUSH_DOC_INFO_LIST, SET_DOC_INFO_LIST, DEL_DOC_INFO_LIST, RESET_DOC_INFO_LIST} from '../../redux/actionTypes'
import './upload.css'

const { Option } = Select;

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
    dataIndex: 'tagsRender'
  },
  {
    align: 'center',
    title: '所属文档',
    dataIndex: 'belongDocument'
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
  const dispatch = useDispatch();
  const history = useHistory();
  const storedDocInfoList = useSelector(state => state.storedDocInfoList, () => false);
  const [globalTags, setGlobalTags] = useState([]);
  const [enableGlobalTags, setEnableGlobalTags] = useState(false);
  const [presets, setPresets] = useState(null);
  const [encoding, setEncoding] = useState("utf-8")
  const [docEditModalVisible, setDocEditModalVisible] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState([]);

  useEffect(() => {
    API.post('/corpus/authors_info/').then((data) => {
      setGlobalTags(new Set(data.data.list));
    }).catch((e) => {
      // TODO: handle error
    });
  }, []);

  useEffect(() => {
    API.post('/corpus/get_preset/')
      .then((res) => {
        const presets = res.data.list;
        const result = {};
        presets.forEach((item) => {
          result[item.type] = item.value.split('|');
        });
        setPresets(result);
      })
  }, []);

  let dataSource = [];
  const setTag = () => {
    if (storedDocInfoList[0]) {
      dispatch({
        type: SET_DOC_INFO_LIST,
        payload: {
          index: 0,
          docInfo: storedDocInfoList[0]
        }
      })
    }
  };
  storedDocInfoList.forEach((docInfo, index) => {
    dataSource.push({
      id: index,
      document: docInfo.title,
      action: (
        <>
          <Link to={`/app/editor/local/${index}`}>
            <Button>修改</Button>
          </Link>
          <Button style={{marginLeft: '10px'}} onClick={handleDelete(index)}>删除</Button>
        </>
      ),
      tagsInfo: docInfo.tags,
      tagsRender: (
        <>
          {docInfo.tags.reduce((tagRenderList, tag, index) => {
            const tagRender = <TagWithModal tag={tag} setTag={setTag} key={index} initial={presets} />;
            if (enableGlobalTags && [...globalTags].some((gt) => {
              return !tag.author && gt.color.toUpperCase() === tag.color.toUpperCase();
            })) {
              return tagRenderList;
            }
            return tagRenderList.concat(tagRender)
          }, [])}
        </>
      ),
      belongDocument: docInfo.belongDocument
    })
  });

  function handleFileSelect(file) {
    parseFile(file, encoding).then((resObj) => {
      const parseResult = parseText(resObj);
      dispatch({
        type: PUSH_DOC_INFO_LIST,
        payload: parseResult
      });
    })
  }
  function changeEnableGlobalTags() {
    setEnableGlobalTags(enableGlobalTags? false: true);
    if (storedDocInfoList[0]) {
      dispatch({
        type: SET_DOC_INFO_LIST,
        payload: {
          index: 0,
          docInfo: storedDocInfoList[0]
        }
      })
    }
  }
  function handleSubmit() {
    const docInfoList = storedDocInfoList.slice();
    for (let docInfo of docInfoList) {
      for (let tagIndex in docInfo.tags) {
        let tag = docInfo.tags[tagIndex];
        if (!tag.author) {
          // 尝试从全局标签找
          if (enableGlobalTags) {
            const matchTag = [...globalTags].find(t => t.color.toUpperCase() === tag.color.toUpperCase());
            if (matchTag) {
              for(let key in matchTag) {
                docInfo.tags[tagIndex][key] = matchTag[key]
              }
              delete docInfo.tags[tagIndex].preset;
              delete docInfo.tags[tagIndex].id;
            } else {
              message.warn('请编辑所有标签');
              return;
            }
          } else {
            message.warn('请编辑所有标签');
            return;
          }
        }
      }
    }
    // TODO: 批量调接口插入
    const requestList = [];
    const combineRes = combineSectionToDocument(docInfoList);
    combineRes.forEach(res => {
      const parseResult = generateTextToUpdate(res.text, res.title, 0);
      requestList.push(API.post('/corpus/insert/', parseResult));
    });
    Promise.all(requestList).then(() => {
      message.success('上传成功!');
      dispatch({
        type: RESET_DOC_INFO_LIST
      })
      history.push('/app/manage');
    })
  }

  function handleDelete(index) {
    return () => {
      dispatch({
        type: DEL_DOC_INFO_LIST,
        payload: index
      });
      message.success('删除成功');
    }
  }

  const rowSelection = {
    onChange: selectedRowKeys => {setSelectedDocId(selectedRowKeys.map(key => parseInt(key))); console.log(selectedRowKeys)}
  }

  const onDocumentBelongSubmit = docBelong => {
    setDocEditModalVisible(false);
    const docInfoList = storedDocInfoList.slice();
    for (let i in docInfoList) {
      if (selectedDocId.includes(parseInt(i))) {
        console.log(i, docInfoList[i])
        docInfoList[i].belongDocument = docBelong;
        dispatch({
          type: SET_DOC_INFO_LIST,
          payload: {...docInfoList[i]}
        })
      }
    }
  }

  const tableComponents = {
    body: {row: DragableRow}
  }

  const moveRow = (dragIndex, hoverIndex) => {
    const dragRow = storedDocInfoList[dragIndex];
    storedDocInfoList.splice(dragIndex, 1);
    storedDocInfoList.splice(hoverIndex, 0, dragRow);
    dispatch({
      type: SET_DOC_INFO_LIST,
      payload: {
        index: 0,
        docInfo: storedDocInfoList[0]
      }
    });
  }
 
  return (
    <div>
      <div className='tableHeader'>
        <DocumentEditModal 
          visible={docEditModalVisible} 
          onSubmit={onDocumentBelongSubmit}
          onCancel={() => setDocEditModalVisible(false)}
        />
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
      <DndProvider backend={HTML5Backend}>
        <Table 
          columns={columns} 
          dataSource={dataSource} 
          rowKey={(data) => data.id}
          rowSelection={rowSelection}
          pagination={false}
          components={tableComponents}
          onRow={(record, index) => ({
            index,
            moveRow
          })}
          title={() => (
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
              <Select placeholder="选择编码" onChange={setEncoding} style={{marginRight: '10px', minWidth: '120px'}}>
                <Option value="utf-8">utf-8</Option>
                <Option value="gb2312">gb2312</Option>
              </Select>
              <Button 
                onClick={() => setDocEditModalVisible(true)}
                style={{marginRight: '10px'}}
              >
                选择所属文档
              </Button>
              <Button 
                type="primary"
                onClick={handleSubmit}
              >
                提交
              </Button>
            </div>
          )} 
        />
      </DndProvider>
    </div>
  )
}

export default Upload;