import React from 'react'
import { Switch, Row, Col, Badge, Button } from 'antd';
import { Link } from 'react-router-dom'
import { ipfsPrefix, web3, courseListContract, getCourseContract } from '../config'

// Todo: 2019.5.23 删除页面未自动刷新

class Course extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      detailList:[],
      showAll:true,
      addressList:[],
      account:'',
      isCeo:false
    }
    this.onChangeSwitch = this.onChangeSwitch.bind(this)
    this.init = this.init.bind(this)
    this.removeCourse = this.removeCourse.bind(this)
    
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
  }
  async removeCourse(index) {
    await courseListContract.methods.removeCourse(index)
      .send({
        from: this.state.account,
        gas:"5000000"
    }).on('confirmation', (confirmationNumber, receipt) => {
        // This controls jump back to the index page
        this.init()
      }).on('error', console.error)
  }
  async onChangeSwitch(v) {
    this.setState({
      showAll:v
    })
  }
  
  render(){
    return <Row style={{marginTop:"30px"}} gutter={16}>
      <Col span={20}>
        <Switch onChange={this.onChangeSwitch} checkedChildren='All' unCheckedChildren='Online' defaultChecked />
      </Col>
      {this.state.detailList.map((detail,index) =>{
        const address = this.state.addressList[index]
        let [name, content, target, fundingPrice, onlinePrice,img, video, count, isOnline, role] = Object.values(detail)
        if(!this.state.showAll && !isOnline) {
          return null
        }
        target = web3.utils.fromWei(target.toString())
        fundingPrice = web3.utils.fromWei(fundingPrice.toString())
        onlinePrice = web3.utils.fromWei(onlinePrice.toString())
        return (
          <Col key={name+img} span={6}>
            <div className='content'>
            <p>
              <span>{name} </span>
              <span>
                {
                  isOnline
                    ? <Badge count="Online" style={{backgroundColor:"#52c41a"}}/>
                    : <Badge count="Funding"/>
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
                <Link to={`/detail/${address}`}>Detail</Link>
              </Button>
              {
                this.state.isCeo ? <Button onClick={()=>this.removeCourse(index)} type='primary' block>Delete</Button> : null
              }
            </div>
            </div>
          </Col>
        )
      })}
    </Row>
    
  }
}

export default Course