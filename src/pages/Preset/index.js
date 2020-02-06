import React, {useEffect, useState} from 'react'
import {Tabs, Button, message} from 'antd';
import API from '../../API'
import './preset.css'
import Tags from '../Editor/Tags'
import InputGroup from './InputGroup'

const {TabPane} = Tabs;
const presetTypes = ['area', 'color', 'dynasty', 'type'];

function Preset(props) {
  const [tags, setTags] = useState(new Set());
  const [presets, setPresets] = useState({});
  useEffect(() => {
    API.post('/corpus/authors_info/')
      .then((data) => {
        console.log(data)
        setTags(new Set(data.data.list));
        return API.post('/corpus/get_preset/')
      })
      .then((data) => {
        const list = data.data.list;
        const result = {};
        list.forEach((item) => {
          if (presetTypes.includes(item.type)) {
            result[item.type] = item.value.split('|');
          }
        });
        setPresets(result);
        console.log(result)
      })
      .catch((e) => {
        // TODO: handle error
      });
  }, []);
  function submitPresetAuthor() {
    console.log(...tags);
    tags.forEach(item => {
      delete item.detail
    })
    API.post('/corpus/authors_info_insert/', {list: [...tags]})
      .then((res) => {
        if(res.data.success) {
          message.success('保存成功');
        }
      })
  }
  return (
    <div className="presetContainer">
        <Tabs className="tabs" defaultActiveKey="1" className="tabs">
          <TabPane tab="预设标签" key="1">
            <div className="inputGroupContainer">
              <Tags tags={tags} setTags={setTags} />
              <Button onClick={submitPresetAuthor} className="submit">提交</Button>
            </div>
          </TabPane>
          <TabPane tab="预设朝代" key="2">
            <InputGroup initialValue={presets.dynasty} type="dynasty" />
          </TabPane>
          <TabPane tab="预设文体" key="3">
            <InputGroup initialValue={presets.type} type="type" />
          </TabPane>
          <TabPane tab="预设地域" key="4">
            <InputGroup initialValue={presets.area} type="area" />
          </TabPane>
          <TabPane tab="预设颜色" key="5">
            <InputGroup initialValue={presets.color} type="color" />
          </TabPane>
        </Tabs>
      </div>
  )
}

export default Preset;