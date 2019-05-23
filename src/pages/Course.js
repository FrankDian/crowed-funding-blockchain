import React from 'react'
import { Form, Input, Row, Col, Badge, Button } from 'antd';
import { Link } from 'react-router-dom'
import { ipfsPrefix, web3, courseListContract, getCourseContract } from '../config'
import address from "../address";

// Todo: 2019.5.23 删除页面未自动刷新


class Course extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      detailList:[],
      addressList:[],
      account:'',
      isCeo:false
    }
    this.init()
  }
  init = async ()=>{
    const [account] = await web3.eth.getAccounts()
    const isCeo = await courseListContract.methods.isCeo().call({
      from: account
    })
    console.log('是不是CEO',isCeo)
    const addressList = await courseListContract.methods.getCourse().call({
      from: account
    })
    const detailList = await Promise.all(
      addressList.map(address=>{
        return getCourseContract(address).methods.getDetail().call({
          from: account
        })
      })
    )
    this.setState({
      detailList,
      addressList,
      account,
      isCeo
    })
    // console.log(detailList)
  }
  
  async removeCourse(index) {
    await courseListContract.methods.removeCourse(index)
      .send({
        from: this.state.account,
        gas:"5000000"
    })
    this.init()
  }
  render(){
    return <Row style={{marginTop:"30px"}} gutter={16}>
        {this.state.detailList.map((detail,index) =>{
          const address = this.state.addressList[index]
          let [name, content, target, fundingPrice, onlinePrice,img, video, count, isOnline, role] = Object.values(detail)
          target = web3.utils.fromWei(target.toString())
          fundingPrice = web3.utils.fromWei(fundingPrice.toString())
          onlinePrice = web3.utils.fromWei(onlinePrice.toString())
          let buyPrice = isOnline?onlinePrice:fundingPrice
          return (
            <Col key={name+img} span={6}>
              <div className='content'>
              <p>
                <span>{name} </span>
                <span>
                  {
                    isOnline
                      ? <Badge count="Already Online" style={{backgroundColor:"#52c41a"}}/>
                      : <Badge count="Fund Raising"/>
                  }
                </span>
              </p>
              <img className="item" src={`${ipfsPrefix}${img}`} alt=""/>
              <div className="center">
                <p>
                  {`Target ${target} ETH`}
                </p>
                <p>
                  {`Already got ${count} support`}
                </p>
                <p>
                  {
                    isOnline
                      ? <Badge count={`Onling Price: ${onlinePrice}ETH`} style={{backgroundColor:"#52c41a"}}/>
                      : <Badge count={`Funding Price: ${fundingPrice}ETH`}/>
                  }
                </p>
                <Button type='primary' block style={{marginBottom:'10px'}}>
                  <Link to={`/detail/${address}`}>查看详情</Link>
                </Button>
                {
                  this.state.isCeo ? <Button onClick={()=>this.removeCourse(index)} type='primary' block>Delete</Button> : null
                }
              </div>
              </div>
            </Col>
          )
        })}
        
          
          {/*<Form onSubmit={this.handleSubmit}>*/}
            {/*<Form.Item label='Course Name'>*/}
              {/*<Input name='name' onChange={this.onChange} />*/}
            {/*</Form.Item>*/}
            {/*<Form.Item label='Course Content'>*/}
              {/*<Input.TextArea row={6} name='content' onChange={this.onChange} />*/}
            {/*</Form.Item>*/}
            {/*<Form.Item label='Course Structure'>*/}
              {/*<Upload*/}
                {/*beforeUpload={this.handleUpload}*/}
                {/*showUploadList={false}*/}
              {/*>*/}
                {/*{*/}
                  {/*this.state.img? <img height='100px' src={`${ipfsPrefix}${this.state.img}`} alt=""/>*/}
                    {/*:(<Button type='primary'>Upload Image</Button>)*/}
                {/*}*/}
              {/*</Upload>*/}
            {/*</Form.Item>*/}
        {/**/}
            {/*<Form.Item label='Target Price'>*/}
              {/*<Input name='target' onChange={this.onChange} />*/}
            {/*</Form.Item>*/}
            {/*<Form.Item label='Funding Price'>*/}
              {/*<Input name='fundingPrice' onChange={this.onChange} />*/}
            {/*</Form.Item>*/}
            {/*<Form.Item label='Online Price'>*/}
              {/*<Input name='onlinePrice' onChange={this.onChange} />*/}
            {/*</Form.Item>*/}
            {/*<Form.Item label='Submit'>*/}
              {/*<Button type='primary' htmlType="submit" >Begin Crowed Funding</Button>*/}
            {/*</Form.Item>*/}
          {/*</Form>*/}
      </Row>
    
  }
}

export default Course