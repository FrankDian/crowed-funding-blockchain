import React from 'react';
import {Layout, Menu} from 'antd';
import { Link, withRouter } from "react-router-dom";

const { Header } = Layout;

class HeadComp extends React.Component {
  render() {
    
    return (
        <Header
          style={{ height: '85px'}}
        >
          <div className="logo">
            <img src="/CrowedFundingLogo.png" alt=""/>
          </div>
          <Menu
            theme="dark"
            mode="horizontal"
            // defaultSelectedKeys={[this.props.location.pathname]}
            defaultSelectedKeys={['/courses']}
            selectedKeys={[this.props.location.pathname]}
            style={{ lineHeight: '85px' }}
          >
            <Menu.Item key="/courses">
              <Link to="/courses">Courses</Link>
            </Menu.Item>
            <Menu.Item key="/create">
              <Link to="/create">Create</Link>
            </Menu.Item>
            <Menu.Item key="/qa">
              <Link to="/qa">Q&A</Link>
            </Menu.Item>
          </Menu>
        </Header>
    )
  }
}

export default withRouter(HeadComp);

