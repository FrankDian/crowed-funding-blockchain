import React from 'react'
import { Form, Input, Row, Col, message, Button } from 'antd';
import { web3, saveJsonOnIpfs, courseListContract, readJsonFromIpfs } from '../config'

class Qa extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      title:'',
      questions:[],
      content:'',
      account:''
    }
    // this.handleChange = this.handleChange.bind(this)
    // this.handleSubmit = this.handleSubmit.bind(this)
    this.init = this.init.bind(this)
    this.init()
  }
  async init(){
    let [account] = await web3.eth.getAccounts()
    const qas = await courseListContract.methods.getQa().call()
    let ret = []
    for(let i = 0; i<qas.length; i+=2){
      ret.push(readJsonFromIpfs(qas[i],qas[i+1]))
    }
    const questions = await Promise.all(ret)
    console.log(questions)
    this.setState({
      account,
      questions
    })
  }
  
  handleChange = (e) => {
    this.setState({
      [e.target.name]:e.target.value
    })
  }
  handleSubmit = async (e)=> {
    e.preventDefault()
    // 1. Concat data
    const obj = {
      title: this.state.title,
      content: this.state.content,
      answers:[]
    }
    const hide = message.loading('Submitting question',0)
    // 2. Store in JSON in IPFS
    const hash = await saveJsonOnIpfs(obj)
    // 3. ipfs hash 上链
    let hash1 = hash.slice(0,23)
    let hash2 = hash.slice(23)
    await courseListContract.methods.createQa(
      web3.utils.utf8ToHex(hash1),
      web3.utils.utf8ToHex(hash2),
    ).send({
        from:this.state.account,
        gas:'5000000'
      }).on('confirmation', (confirmationNumber, receipt)=>{
        hide()
        this.setState({
          title:'',
          content:''
        })
      }).on('error', console.error)
  }
  render(){
    return <Row style={{marginTop:"30px"}} justify='center' type='flex'>
      <Col span={20}>
        <Form onSubmit={this.handleSubmit} style={{marginTop:'20px'}}>
          <Form.Item label='Title'>
            <Input value={this.state.title} name='title' onChange={this.handleChange} />
          </Form.Item>
          <Form.Item label='Question Describe'>
            <Input.TextArea
              rows={6}
              value={this.state.content}
              name='content'
              onChange={this.handleChange} />
          </Form.Item>
          <Form.Item>
            <Button htmlType='submit' type='primary'>Submit Question</Button>
          </Form.Item>
        
        </Form>
      </Col>
    </Row>
    
  }
}

export default Qa