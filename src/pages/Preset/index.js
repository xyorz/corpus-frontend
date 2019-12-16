import React, {useEffect, useState} from 'react'
import {Tabs, Button} from 'antd';
import API from '../../API'
import './preset.css'
import Tags from '../Editor/Tags'
import InputGroup from './InputGroup'

const {TabPane} = Tabs;

function Preset(props) {
  const [tags, setTags] = useState([]); 
  const mockValues = ['111', '222', '333'];
  useEffect(() => {
    API.post('/corpus/authors_info/').then((data) => {
      setTags(data.data.list);
    }).catch((e) => {
      // TODO: handle error
    });
  })
  return (
    <div className="presetContainer">
        <Tabs className="tabs" defaultActiveKey="1" className="tabs">
          <TabPane tab="预设标签" key="1">
            <Tags tags={tags} setTags={setTags} />
            <Button>提交</Button>
          </TabPane>
          <TabPane tab="预设朝代" key="2">
            <InputGroup initialValue={mockValues} />
          </TabPane>
          <TabPane tab="预设文体" key="3">
            <InputGroup initialValue={mockValues} />
          </TabPane>
          <TabPane tab="预设地域" key="4">
            <InputGroup initialValue={mockValues} />
          </TabPane>
          <TabPane tab="预设颜色" key="5">
            <InputGroup initialValue={mockValues} />
          </TabPane>
        </Tabs>
      </div>
  )
}

export default Preset;