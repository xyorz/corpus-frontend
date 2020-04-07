import React, {useState, useEffect} from 'react'
import {Button, message, Input} from 'antd'
import './hant.css'
import Zh2HantTable from './Zh2HantTable'
import Zh2HantAddModal from './Zh2HantAddModal'
import axios from 'axios'

const {Search} = Input;

let timer = null;

const formatList = list => {
  const resList = [];
  let resItem = {};
  for (let i in list) {
    if (i % 2 === 0) {
      resItem.id = list[i].id;
      resItem.box1 = list[i];
    } else {
      resItem.box2 = list[i];
      resList.push(resItem);
      resItem = {};
    }
  }
  if (resItem.box1) {
    resList.push(resItem);
  }
  return resList;
}

function Hant(props) {
  const [data, setData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    getAll();
  }, []);

  const search = word => {
    if (!word) {
      setKeyword("");
      getAll();
    } else {
      setKeyword(word);
      getByKeyword(word);
    }
  }

  const refresh = () => {
    if (!keyword) {
      getAll();
    } else {
      getByKeyword(keyword);
    }
  }

  const getAll = inPage => {
    let pg = inPage;
    if (pg) {
      setPage(inPage);      
    } else {
      pg = page;
    }
    axios.post(`/corpus/get_zh_to_hant_list/`, {page: pg}).then(res => {
      const list = res.data.list;
      setData(formatList(list));
      setTotal(res.data.total);
    });
  }

  const getByKeyword = word => {
    setPage(1);
    axios.post(`/corpus/get_hant_by_zh/`, {zh: word}).then(res => {
      const list = res.data.list;
      setData(formatList(list));
      setTotal(res.data.total);
    })
  }

  const update = (type, id, zh, hant) => {
    axios.post(`/corpus/update_zh_to_hant_1/`, {type, id, zh, hant}).then(res => {
      console.log(res.data);
      message.success("修改成功！")
      if (!timer) {
        refresh();
         timer = setTimeout(() => {
           timer = null;
         }, 1000);
      }
    });
  }

  const onSubmitAdd = list => {
    for (let item of list) {
      update('insert', null, item.zh, item.hant);
    }
    setModalVisible(false);
  }

  return (
    <div className="hantContainer">
      <Zh2HantAddModal visible={modalVisible} setVisible={setModalVisible} onSubmit={onSubmitAdd} />
      <Search
        onSearch={search}
        placeholder="在此输入要搜索的字"
        enterButton="搜索"
        className="hantSearchBox"
      />
      <Button type="primary" style={{marginBottom: "20px"}} onClick={() => setModalVisible(true)}>添加映射</Button>
      <Zh2HantTable data={data} update={update} page={page} onChangePage={getAll} total={total} />
    </div>
  )
}

export default Hant;