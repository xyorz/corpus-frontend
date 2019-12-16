import React from 'react'
import {Tag} from 'antd'
import TagWithModal from './TagWithModal'
import './tags.css'

function Tags(props) {
  const {tags, setTags} = props;
  function setTag() {
    setTags(new Set(tags))
  }
  return (
    <div className="tagsContainer">
      <div className="tagsBox">
        {[...tags].map((tag, index) => (
          <TagWithModal tag={tag} setTag={setTag} key={index} />
        ))}
        <Tag>
          + 
        </Tag>
      </div>
    </div>
  )
}

export default Tags