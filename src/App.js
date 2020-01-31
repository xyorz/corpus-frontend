import React, {useState, useEffect} from 'react'
import {useHistory} from "react-router-dom";
import './App.css'
import API from './API'
import Layout from './layout'

function App() {
  const history = useHistory();
  const [hasLogin, setHasLogin] = useState(false);
  useEffect(() => {
    API.post('/corpus/login/')
      .then((res) => {
        const success = res.data.success;
        console.log('session', res)
        if (!success) {
          setHasLogin(false);
          history.push('/login');
        } else {
          setHasLogin(true);
        }
      })
  }, []);
  if (hasLogin) {
    return <Layout />
  }
  return <div />
}

export default App;
