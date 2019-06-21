import React from 'react'
import { Form, Avatar, Spin, Badge, Input, Row, Col, message, Button, Comment, Modal, Tooltip } from 'antd';
import moment from 'moment'

import { web3, saveJsonOnIpfs, courseListContract, readJsonFromIpfs } from '../config'

class Qa extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      title:'',
      questions:[],
      content:'',
      account:'',
      ansIndex:0,
      showModal:false,
      answer:'',
      coverStatus: false,
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
    // console.log(questions)
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
    this.setState({
      coverStatus: true
    })
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
          content:'',
          coverStatus: false,
        })
      }).on('error', console.error)
  }
  showInfoModal(index) {
    this.setState({
      ansIndex: index,
      showModal: true
    })
  }
  handleAnsChange = (e) => {
    this.setState({
      answer: e.target.value
    })
  }
  handleCancel = (e) => {
    this.setState({
      showModal:false,
      answer:''
    })
  }
  handleOk = async (e) => {
    let item = this.state.questions[this.state.ansIndex]
    // TODO: 这里在回答中可加入回答者名字
    item.answers.push({
      text:this.state.answer,
    })
    this.setState({
      showModal:false,
      coverStatus: true,
    })
    const hash = await saveJsonOnIpfs(item)
    let hash1 = web3.utils.utf8ToHex(hash.slice(0,23))
    let hash2 = web3.utils.utf8ToHex(hash.slice(23))
    await courseListContract.methods.updateQa(this.state.ansIndex,hash1,hash2)
      .send({
        from:this.state.account,
        gas:'5000000'
      }).on('confirmation', (confirmationNumber, receipt)=>{
        this.init()
        this.setState({
          answer:'',
          coverStatus: false,
        })
      }).on('error', console.error)
  }
  render(){
    
    return <Spin spinning={this.state.coverStatus}>
    <Row style={{marginTop:"30px"}} justify='center' type='flex'>
      <Col span={20}>
        {
          this.state.questions.map((item, index) => {
            return <Comment
              key={index}
              actions={[<span onClick={()=>this.showInfoModal(index)}>Reply</span>]}
              author={item.title}
              content={item.content}
              avatar={<Badge count={index+1} />}
            >
              {item.answers.map((ans,index) => {
                return <Comment
                  key={index}
                  author={<a>anonym</a>}
                  avatar={
                    <Avatar
                      src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                      alt='anonym'
                    />
                  }
                  content={ans.text}
                  datetime={
                    <Tooltip title={moment().format('YYYY-MM-DD HH:mm:ss')}>
                      <span>{moment().fromNow()}</span>
                    </Tooltip>
                  }
                />
              })}
            </Comment>
          })
        }
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
        <Modal
          title='Reply'
          visible={this.state.showModal}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Input value={this.state.answer} onChange={this.handleAnsChange} />
        </Modal>
      </Col>
    </Row>
    </Spin>
  }
}

export default Qa