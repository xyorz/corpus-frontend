import React, {useState, useEffect} from 'react'
import {SET_USER_INFO} from './redux/actionTypes'
import {useHistory} from "react-router-dom";
import {useDispatch} from 'react-redux'
import './App.css'
import API from './API'
import Layout from './layout'

function App() {
  const history = useHistory();
  const dispatch = useDispatch();
  const [hasLogin, setHasLogin] = useState(false);
  useEffect(() => {
    API.post('/corpus/login/')
      .then((res) => {
        const success = res.data.success;
        console.log('session', res.data)
        if (!success) {
          setHasLogin(false);
          history.push('/login');
        } else {
          setHasLogin(true);
          dispatch({
            type: SET_USER_INFO,
            payload: {
              username: res.data.info.username
            }
          })
        }
      })
  }, []);
  if (hasLogin) {
    return <Layout />
  }
  return <div />
}

export default App;
