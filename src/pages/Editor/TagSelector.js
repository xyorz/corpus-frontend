import React, {useRef} from 'react'
import './tagSelector.css'

function TagSelector(props) {
  const {position, tags, visible, setTextTag} = props;
  const containerRef = useRef(null);
  const left = (containerRef.current && position.left - containerRef.current.offsetWidth / 2) || 0;
  const top = (containerRef.current && position.top - containerRef.current.offsetHeight - 10) || 0;
  return (
    <div 
      className="selectorContainer"
      style={{
        visibility: visible? 'visible': 'hidden',
        opacity: visible? 1: 0,
        left,
        top
      }}
      ref={containerRef}
    >
      {[...tags].map((tag, index) => (
        <div 
          className="selectorItem"
          key={index}
          style={{
            background: tag.color
          }}
          onClick={() => setTextTag(tag)}
        >
          {tag.author}
        </div>
      ))}
    </div>
  )
}

export default TagSelector;