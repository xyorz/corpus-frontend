import React, {useState, useEffect} from 'react'
import HantBox from './HantBox'
import API from '../../API'
import {Spin, Button, message, Input} from 'antd'
import './hant.css'

const {Search} = Input;

function Hant(props) {
  const [items, setItems] = useState([]);
  const [inputVal, setInputVal] = useState('');

  function handleSearch(e) {
    if (!e) return;
    const queryList = [];
    e.split('').forEach(z => queryList.push(API.post('/corpus/get_hant_by_zh/', {zh: z})))
    Promise.all(queryList).then(dataList => {
      let resItems = [];
      dataList.forEach(data => {
        try {
          resItems = resItems.concat(data.data.list);
          message.info('查询完成');
        } catch (e) {
          //TODO: handle error
          console.log(e)
        }
      })
      setItems(resItems);
    })
  }

  function handleSubmit() {
    for(let item of items) {
      if (!item.hant) {
        message.warn('存在未编辑项，无法提交');
        return;
      }
    }
    const queryList = [];
    const zh2Hant = {};
    items.forEach(item => {
      if (!zh2Hant[item.zh]) {
        zh2Hant[item.zh] = [item.hant];
      } else {
        zh2Hant[item.zh].push(item.hant);
      }
    });
    for(let key in zh2Hant) {
      const list = zh2Hant[key].map(h => ({zh: key, hant: h}));
      queryList.push(API.post('/corpus/update_zh_to_hant/', {zh: key, list: list}))
    }
    Promise.all(queryList).then(dataList => {
      try {
        message.success('设置成功');
      } catch (e) {
        //TODO: handle error
        console.log(e)
      }
    })
  }

  function delItem(index) {
    items.splice(index, 1);
    setItems(items.slice());
  }

  function setHant(index, hant) {
    if (hant.length > 1) {
      message.warn('限输入一个字');
      hant = hant.slice(0, 1);
    }
    items[index].hant = hant;
    setItems(items.slice());
  }

  function setZh(index, zh) {
    if (zh.length > 1) {
      message.warn('限输入一个字');
      zh = zh.slice(0, 1);
    }
    items[index].zh = zh;
    setItems(items.slice());
  }

  function addItem() {
    items.push({zh: '', hant: ''});
    setItems(items.slice());
  }

  return (
    <div className="hantContainer">
      <Search
        onSearch={handleSearch}
        placeholder="在此输入要搜索的字"
        enterButton="搜索"
        className="hantSearchBox"
      />
      <HantBox
        items={items}
        delItem={delItem}
        setHant={setHant}
        setZh={setZh}
        addItem={addItem}
        submit={handleSubmit}
        className="hantBox" 
      />
    </div>
  )
}

export default Hant;