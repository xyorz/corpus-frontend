import React, {useState} from 'react'
import {Tag} from 'antd'
import TagWithModal from './TagWithModal'

function Tags(props) {
  const {tags, setTags} = props;
  function setTag() {
    setTags(new Set(tags))
  }
  return (
    <div>
      {[...tags].map((tag, index) => (
        <TagWithModal tag={tag} setTag={setTag} key={index} />
      ))}
      <Tag>
        + 新增标签
      </Tag>
    </div>
  )
}

export default Tags