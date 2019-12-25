import React from 'react'
import {Provider} from 'react-redux'
import './App.css'
import {MainRouter} from './route'
import Layout from './layout'
import store from './redux/store'

function App() {
  return (
    <Provider store={store}>
      <MainRouter>
        <Layout />
      </MainRouter>
    </Provider>
  );
}

export default App;
