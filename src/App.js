import React, {Component} from 'react';
import { Layout, Menu, Breadcrumb } from 'antd';
import Header from './components/Header';
import {BrowserRouter as Router, Route } from "react-router-dom";
import Create from './pages/Create'
import Course from './pages/Course'
import Detail from './pages/Detail'
import Qa from './pages/Qa'


const { Content, Footer } = Layout;

// Todo: 2019.5.23 制作标题图

class App extends Component {
  render() {
    return (
      
      <Router className="App">
        
        <Layout className="layout">
          <Header />
          <Content style={{ padding: '0 50px' }}>
            {/*匹配具体的路由*/}
            <Route path="/" exact component={Course}/>
            <Route path="/qa" component={Qa}/>
            <Route path="/create" component={Create}/>
            <Route path="/detail/:address" component={Detail}/>
          </Content>
          <Footer style={{ textAlign: 'center' }}>©Build by FrankDian@3556294@hku.hk</Footer>
        </Layout>
      </Router>
    );
  }
}

export default App;
