import React, {useState, useEffect, useRef} from 'react'
import {Table, Button, message, Modal, Spin} from 'antd'
import {Link, useHistory} from 'react-router-dom'
import API from '../../API'
import {parseFile} from './util'
import {parseText, generateTextToUpdate} from '../Editor/util'
import FileDragger from './FileDragger'
import Tags from '../Editor/Tags'
import TagWithModal from '../Editor/TagWithModal'
import {useDispatch, useSelector} from 'react-redux'
import {PUSH_DOC_INFO_LIST, SET_DOC_INFO_LIST, DEL_DOC_INFO_LIST} from '../../redux/actionTypes'
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
    dataIndex: 'tagsRender'
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

  useEffect(() => {
    API.post('/corpus/authors_info/').then((data) => {
      setGlobalTags(data.data.list);
    }).catch((e) => {
      // TODO: handle error
    });
  }, []);

  let dataSource = [];
  const setTag = () => {
    dispatch({
      type: SET_DOC_INFO_LIST,
      payload: {
        index: 0,
        docInfo: storedDocInfoList[0]
      }
    })
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
            const tagRender = <TagWithModal tag={tag} setTag={setTag} key={index} />;
            if (enableGlobalTags && globalTags.some((gt) => {
              return gt.color.toUpperCase() === tag.color.toUpperCase();
            })) {
              return tagRenderList;
            }
            return tagRenderList.concat(tagRender)
          }, [])}
        </>
      )
    })
  });

  function handleFileSelect(file) {
    parseFile(file).then((resObj) => {
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
    console.log(storedDocInfoList);
    const docInfoList = storedDocInfoList.slice();
    for (let docInfo of docInfoList) {
      for (let tagIndex in docInfo.tags) {
        let tag = docInfo.tags[tagIndex];
        if (!tag.author) {
          // 尝试从全局标签找
          if (enableGlobalTags) {
            const matchTag = globalTags.find(t => t.color.toUpperCase() === tag.color.toUpperCase());
            if (matchTag) {
              for(let key in matchTag) {
                docInfo.tags[tagIndex][key] = matchTag[key]
              }
              delete docInfo.tags[tagIndex].preset;
              delete docInfo.tags[tagIndex].id;
            } else {
              message.warn('请编辑所有标签1');
              return;
            }
          } else {
            message.warn('请编辑所有标签2');
            return;
          }
        }
      }
    }
    // TODO: 批量调接口插入
    const requestList = [];
    docInfoList.forEach(docInfo => {
      const parseResult = generateTextToUpdate(docInfo.text, docInfo.title, 0);
      requestList.push(API.post('/corpus/insert/', parseResult));
      console.log(parseResult)
    });
    Promise.all(requestList).then(() => {
      message.success('上传成功!');
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
      <Button 
        style={{position: 'relative', left: '90%', marginTop: '10px'}}
        onClick={handleSubmit}
      >
        提交
      </Button>
    </div>
  )
}

export default Upload;