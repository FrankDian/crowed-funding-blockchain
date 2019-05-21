const fs = require('fs')

const path = require('path')

const solc = require('solc')

const contractPath = path.resolve(__dirname, '../contracts/Imooc.sol')

// Get the content of contract file
const source = fs.readFileSync(contractPath,'utf-8')

//Compile the content
const ret = solc.compile(source)

if(Array.isArray(ret.errors) && ret.errors.length > 0) {
  // Error happens
  console.log(ret.errors[0])
} else {
  Object.keys(ret.contracts).forEach(name=>{
    const contractName = name.slice(1)
    const filePath = path.resolve(__dirname, `../src/compiled/${contractName}.json`)
    fs.writeFileSync(filePath,JSON.stringify(ret.contracts[name]))
    console.log(`${filePath} bingo`)
  })
}



