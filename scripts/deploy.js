// Deploy contract to Ropsten test net
const fs = require('fs')
const path = require('path')
const Web3 = require('web3')
const HDWalletProvider = require('truffle-hdwallet-provider')


const contractPath = path.resolve(__dirname, '../src/compiled/CourseList.json')
const {interface, bytecode} = require(contractPath)

const provider = new HDWalletProvider("crumble book pave file speak void call hood voice logic uniform donate", "https://ropsten.infura.io/v3/e67dd0589ed84a38a55d9f0f54cb4428")
const web3 = new Web3(provider);

(async function(){
  console.log('自执行');
  const accounts = await web3.eth.getAccounts();
  console.log(`合约部署的账号:`,accounts);
  // await
  
  console.time('合约部署消耗时间');
  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data:bytecode})
    .send({
      from:accounts[0],
      gas:'5000000'
    })
  console.timeEnd('合约部署消耗时间')
  const contractAddress = result.options.address
  // 查官方文档为什么没有options.address选项
  console.log('合约部署成功',contractAddress)
  console.log('合约查看地址',`https://ropsten.etherscan.io/address/${contractAddress}`)
  
  const addressFile = path.resolve(__dirname,'../src/address.js')
  // In case of the contractAddress being transferred to a variable
  fs.writeFileSync(addressFile,"export default " + JSON.stringify(contractAddress))
  console.log("Address write successfully", addressFile)
  
})();