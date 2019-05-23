/**
 * @author:FrankDian
 * @date:2019.5.23
 * Info:
 * 1.封装ipfs相关的API,上传下载,访问等
 * 2.检测浏览器对MetaMask的支持
 * 3.提示/loading组件封装
 * 4.根据地址获取合约
 */
import ipfsAPI from 'ipfs-api'

import { notification, message } from 'antd'
import Web3 from 'web3'
import Course from './compiled/Course'
import CourseList from './compiled/CourseList'
import address from './address'

let ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})

let ipfsPrefix = "https://ipfs.infura.io:5001/api/v0/cat?arg=";

let web3
if(window.web3){
  web3 = new Web3(window.web3.currentProvider)
}else{
  notification.error({
    message:'Not Find the MetaMask Plugin',
    description:"Please Install or activate the MetaMask Plugin"
  })
}

let courseListContract = new web3.eth.Contract(JSON.parse(CourseList.interface),address)
// Get the contract from specific address
let getCourseContract = (addr) => new web3.eth.Contract(JSON.parse(Course.interface),addr)

// Save images
function saveImageToIpfs(file){
  const hide = message.loading('Uploading...')
  return new Promise((resolve,reject) => {
    let reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = async () => {
      const buffer = Buffer.from(reader.result)
      const res = await ipfs.add(buffer)
      console.log(res)
      hide()
      resolve(res[0].hash)
    }
  })
}


export {ipfs, ipfsPrefix , saveImageToIpfs, web3, courseListContract, getCourseContract}