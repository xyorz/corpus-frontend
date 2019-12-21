import React, {useState} from 'react'
import {message, Upload, Icon} from 'antd';
const { Dragger } = Upload;

function FileDragger(props) {
  const [loading, setLoading] = useState(false);

  return (
    <div>
      <Dragger
        onChange={props.onSelectFile}
        beforeUpload={() => false}
        fileList={[]}
        multiple
      >
        <p className="ant-upload-drag-icon">
          <Icon type="inbox" />
        </p>
        <p className="ant-upload-text">单击或拖拽文件到此处解析</p>
      </Dragger>
    </div>
  )
}

export default FileDragger;