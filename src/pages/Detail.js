import React from 'react'
import { Form, Input, Row, Col, Badge, Button } from 'antd';
import { Link } from 'react-router-dom'
import { ipfsPrefix, web3, courseListContract, getCourseContract } from '../config'
import address from "../address";


class Detail extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      address: this.props.match.params.address
    }
    this.buy = this.buy.bind(this)
    this.init()
  }
  async init(){
    const [account] = await web3.eth.getAccounts()
    console.log(account)
    const contract = getCourseContract(this.state.address)
    const detail = await contract.methods.getDetail().call({from:account})
    let [name, content, target, fundingPrice, onlinePrice,img, video, count, isOnline, role] = Object.values(detail)
    target = web3.utils.fromWei(target.toString())
    fundingPrice = web3.utils.fromWei(fundingPrice.toString())
    onlinePrice = web3.utils.fromWei(onlinePrice.toString())
    console.log(role.toString())
    this.setState({
      account,
      name,
      content,
      img,
      video,
      count:count.toString(),
      isOnline,
      role:role.toString(),
      target,
      fundingPrice,
      onlinePrice
    })
  }
  async buy(){
    console.log(this.state.account)
    const contract = getCourseContract(this.state.address)
    let buyPrice = this.state.isOnline? this.state.onlinePrice: this.state.fundingPrice
    await contract.methods.buy()
      .send({
        from: this.state.account,
        value: web3.utils.toWei(buyPrice),
        gas: '6000000'
      })
    this.init()
  }
  
  render(){
    const formItemLayout = {
      labelCol:{
        span:6
      },
      wrapperCol:{
        span:10
      }
    }
    return <Row type='flex' justify='center' style={{marginTop:'30px'}}>
      <Col span={20}>
        <Form>
          <Form.Item {...formItemLayout} label='Course Name'>
            {this.state.name}
          </Form.Item>
          <Form.Item {...formItemLayout} label='Course Content'>
            {this.state.content}
          </Form.Item>
          <Form.Item {...formItemLayout} label='Course Target'>
            {this.state.target} ETH
          </Form.Item>
          <Form.Item {...formItemLayout} label='Funding Price'>
            {this.state.fundingPrice} ETH
          </Form.Item>
          <Form.Item {...formItemLayout} label='Online Price'>
            {this.state.onlinePrice} ETH
          </Form.Item>
          <Form.Item {...formItemLayout} label='Support Count'>
            {this.state.count}
          </Form.Item>
          <Form.Item {...formItemLayout} label='Status'>
            {
              this.state.isOnline ? <Badge count='Finish Fund Raising' />
                :<Badge count='Fund Raising...' />
            }
          </Form.Item>
          <Form.Item {...formItemLayout} label='Identity'>
            {
              this.state.role === '0' && 'Upload Video'
            }
            {
              this.state.role === '1' && 'Already Bought'
            }
            {
              this.state.role === '2' && 'Customer'
            }
          </Form.Item>
          <Form.Item {...formItemLayout} label='Video Status'>
            {this.state.video ? 'Play Video': 'Waiting for Upload'}
          </Form.Item>
          <Form.Item {...formItemLayout} label='Buy'>
            {this.state.role ==='2' && (
              <Button type='primary' onClick={this.buy}>
                Support {this.state.isOnline ? this.state.onlinePrice : this.state.fundingPrice} ETH
              </Button>
            )}
            {
              (this.state.role ==='1' || this.state.role === '0' ) && (
                <Button type='primary' disabled>
                  Already Have Access
                </Button>
              )
            }
          </Form.Item>
        </Form>
      </Col>
    </Row>
  }
}

export default Detail