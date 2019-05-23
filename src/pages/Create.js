import React from 'react'
import { Form, Input, Row, Col, Button, Upload } from 'antd';
import { Redirect } from 'react-router-dom'
import { saveImageToIpfs, ipfsPrefix, web3, courseListContract } from '../config'

// Todo: 2019.05.23 提交后没有自动跳转到首页
// Todo: 2019.05.23 添加点击提交之后的遮罩层(loading)
// Todo: 2019.05.23 课程结构图上传组件优化,改为照片墙形式

class Create extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      toIndex:false,
      name:'',
      img:'',
      content: '',
      target:'',
      fundingPrice:'',
      onlinePrice:''
    }
  }
  handleSubmit = async (e)=>{
    console.log(this.state)
    e.preventDefault()
    const [account] = await web3.eth.getAccounts()
    const arr = [
      this.state.name,
      this.state.content,
      web3.utils.toWei(this.state.target),
      web3.utils.toWei(this.state.fundingPrice),
      web3.utils.toWei(this.state.onlinePrice),
      this.state.img,
    ]
    await courseListContract.methods.createCourse(...arr)
      .send({
        from:account
      })
    // This controls jump back to the index page
    console.log('toIndex 状态已经改变')
    this.setState({
      toIndex: true
    })
  }
  handleUpload = async (file)=> {
    const hash = await saveImageToIpfs(file)
    this.setState({
      img:hash
    })
    return false
  }
  onChange = (e)=>{
    this.setState({
      [e.target.name]:e.target.value
    })
  }
  
  render(){
    if(this.state.toIndex){
      console.log('执行重定向')
      return <Redirect to='/'></Redirect>
    }
    return(
      <Row
        type='flex'
        justify='center'
        style={{marginTop:'30px'}}
      >
        <Col span={20}>
          <Form onSubmit={this.handleSubmit}>
            <Form.Item label='Course Name'>
              <Input name='name' onChange={this.onChange} />
            </Form.Item>
            <Form.Item label='Course Content'>
              <Input.TextArea row={6} name='content' onChange={this.onChange} />
            </Form.Item>
            <Form.Item label='Course Structure'>
              <Upload
                beforeUpload={this.handleUpload}
                showUploadList={false}
              >
                {
                  this.state.img? <img height='100px' src={`${ipfsPrefix}${this.state.img}`} alt=""/>
                    :(<Button type='primary'>Upload Image</Button>)
                }
              </Upload>
            </Form.Item>
        
            <Form.Item label='Target Price'>
              <Input name='target' onChange={this.onChange} />
            </Form.Item>
            <Form.Item label='Funding Price'>
              <Input name='fundingPrice' onChange={this.onChange} />
            </Form.Item>
            <Form.Item label='Online Price'>
              <Input name='onlinePrice' onChange={this.onChange} />
            </Form.Item>
            <Form.Item label='Submit'>
              <Button type='primary' htmlType="submit" >Begin Crowed Funding</Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    )
    
    
  }
}

export default Create