import React, {useState, useEffect} from 'react'
import {Tag} from 'antd'
import TagWithModal from './TagWithModal'
import API from '../../API'
import './tags.css'

function Tags(props) {
  const [presets, setPresets] = useState(null);
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
  const {tags, setTags} = props;
  function setTag() {
    setTags(new Set(tags));
  }
  function addTag(tag) {
    setTags(new Set([...tags].concat(tag)));
  }
  return (
    <div className={'tagsContainer' + ' ' + props.className || ''}>
      <div className="tagsBox">
        {[...tags].map((tag, index) => (
          <TagWithModal tag={tag} setTag={setTag} initial={presets} key={index} />
        ))}
        <TagWithModal tag={{}} setTag={addTag} initial={presets} />
      </div>
    </div>
  )
}

export default Tags