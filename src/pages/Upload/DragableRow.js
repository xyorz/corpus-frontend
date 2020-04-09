import React, {useRef} from 'react';
import { useDrag, useDrop } from 'react-dnd';

const type = 'DragableRow';

function DragableRow ({ index, moveRow, className, style, ...restProps }) {
  const ref = useRef();
  const [{isOver, dropClass}, drop] = useDrop({
    accept: type,
    collect: monitor => {
      const {index: dragIndex} = monitor.getItem() || {};
      if (!monitor.isOver() || dragIndex === index) {
        return {}
      }
      return {
        isOver: monitor.isOver(),
        dropClass: dragIndex < index? ' drop-over-downward' : ' drop-over-upward'
      }
    },
    drop: item => moveRow(item.index, index)
  });
  const [, drag] = useDrag({
    item: {index, type},
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drop(drag(ref));
  return (
    <tr
      ref={ref}
      style={{cursor: 'move', ...style}}
      className={className + isOver? dropClass: ''}
      {...restProps}
    />
  )
}

export default DragableRow;