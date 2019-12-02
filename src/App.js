import React from 'react'
import './App.css'
import {MainRouter} from './route'
import Layout from './layout'

function App() {
  return (
    <MainRouter>
      <Layout />
    </MainRouter>
  );
}

export default App;
