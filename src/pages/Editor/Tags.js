import React, {useState, useEffect} from 'react'
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
  const {tags, setTags, removable} = props;
  function setTag() {
    setTags(new Set(tags));
  }
  function addTag(tag) {
    tag.id = -1;
    tag.preset = true;
    setTags(new Set([...tags].concat(tag)));
  }
  function delTag(tag) {
    tags.delete(tag);
    setTags(new Set([...tags]));
  }
  return (
    <div className={'tagsContainer' + ' ' + props.className || ''}>
      <div className="tagsBox">
        {[...tags].map((tag, index) => (
          <TagWithModal 
            tag={tag} 
            setTag={setTag} 
            delTag={delTag} 
            initial={presets} 
            removable={removable} 
            key={tag.id? tag.id: index + 3154}
          />
        ))}
        <TagWithModal tag={{}} setTag={addTag} initial={presets} />
      </div>
    </div>
  )
}

export default Tags