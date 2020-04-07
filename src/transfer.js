/*global chrome*/

import React from 'react'
import { withRouter } from 'react-router-dom'
import {CopyToClipboard} from 'react-copy-to-clipboard';
import grpcWeb from 'grpc-web'
import DropdownButton from "react-bootstrap/DropdownButton"
import Dropdown from 'react-bootstrap/Dropdown'
import Button from 'react-bootstrap/Button'
import CopyIcon from './Icons/Copy.js'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Modal from 'react-bootstrap/Modal'
import Header from './header'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import {FormattedMessage} from 'react-intl'
import Spinner from 'react-bootstrap/Spinner'
import { readonly, validator } from './rnode'

const { rnodeDeploy, rnodePropose, signDeploy, verifyDeploy } = require('@tgrospic/rnode-grpc-js')

// Generated files with rnode-grpc-js tool
const protoSchema = require('../rnode-grpc-gen/js/pbjs_generated.json')
// Import generated protobuf types (in global scope)
require('../rnode-grpc-gen/js/DeployServiceV1_pb')
require('../rnode-grpc-gen/js/ProposeServiceV1_pb')

const add_5 = ["address1","address2","address3","address4","address5"]

const rnode = (rnodeUrl) => {
  const options = { grpcLib: grpcWeb, host: rnodeUrl, protoSchema }
  const {
    getBlocks,
    getBlock,
    listenForDataAtName,
    doDeploy
  } = rnodeDeploy(options)

  const { propose } = rnodePropose(options)
  return { DoDeploy: doDeploy, propose, listenForDataAtName, getBlocks, getBlock}
}

// const sendDeploy = async (rnodeUrl, code, privateKey) => {
//   const { DoDeploy, propose, getBlock } = rnode(rnodeUrl)
//   // const url = "http://35.220.140.14:40403/api/last-finalized-block"

//     try {
//       const num = await fetch(readonly[0] + `/api/last-finalized-block`, { method:'get' })
//         .then((str) => str.json()).then( x => x.blockInfo.blockNumber )
//     } catch(err) {
//       try {
//         const num = await fetch(readonly[1] + `/api/last-finalized-block`, { method:'get' })
//           .then((str) => str.json()).then( x => x.blockInfo.blockNumber )
//       } catch(err) {
//         const num = await fetch(readonly[2] + `/api/last-finalized-block`, { method:'get' })
//           .then((str) => str.json()).then( x => x.blockInfo.blockNumber )
//       }
//     }

//   // const num = await fetch(readonly[0] + `/api/last-finalized-block`, { method:'get' })
//   //   .then((str) => str.json()).then( x => x.blockInfo.blockNumber )

//   const deployData = {
//     term: code, phlolimit: 300000, phloprice: 1,
//     validafterblocknumber: num+1
//   }
//   const deploy = signDeploy(privateKey, deployData)
//   // const isValidDeploy = verifyDeploy(deploy)
//   try {
//     const { result } = await DoDeploy(deploy)
//     // console.log('DoDeploy: ', result)
//     return result
//   } catch (error) { return error }

//   try {
//     const { result } = await DoDeploy(deploy)
//     // console.log('DoDeploy: ', result)
//     return result
//   } catch (error) { return error }



//   // try {
//   //   const resPropose = await propose()
//   //   // console.log('PROPOSE', resPropose)
//   // } catch (error) { console.log("Propose Error: ",error) }

//   // const data = await getDataForDeploy(rnodeUrl, deploy.sig)
//   // console.log('data: ', data)
//   // return data
// }

const num = async ()=> {
  let y
  try {
    y = await fetch(readonly[0] + `/api/last-finalized-block`, { method:'get' })
      .then((str) => str.json()).then( x => x.blockInfo.blockNumber )
  } catch(err) {
    try {
      y = await fetch(readonly[1] + `/api/last-finalized-block`, { method:'get' })
        .then((str) => str.json()).then( x => x.blockInfo.blockNumber )
    } catch(err) {
      y = await fetch(readonly[2] + `/api/last-finalized-block`, { method:'get' })
        .then((str) => str.json()).then( x => x.blockInfo.blockNumber )
    }
  }
  return y
}


const apiDeploy = async ( code, privateKey) => {
  
  // console.log("num + 1 :", await num()+1)
  const deployData = {
    term: code, phlolimit: 300000, phloprice: 1,
    validafterblocknumber: await num()+1
  }
  const deploy = signDeploy(privateKey, deployData)
  // const isValidDeploy = verifyDeploy(deploy)
  const da = {
    data: {
      term: deploy.term,
      timestamp: deploy.timestamp,
      phloPrice: deploy.phloprice,
      phloLimit: deploy.phlolimit,
      validAfterBlockNumber: deploy.validafterblocknumber
    },
    sigAlgorithm: deploy.sigalgorithm,
    signature: bytesToHex(deploy.sig),
    deployer: bytesToHex(deploy.deployer)
  }

  const req = {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(da)
  }

  try {
    const b = await fetch(validator[0]+`/api/deploy`, req).then(r => r.json()).then(x =>  x)
    return b
  } catch(err) {
    try {
      const b = await fetch(validator[1]+`/api/deploy`, req).then(r => r.json()).then(x =>  x)
      return b
    } catch(err) {
      const b = await fetch(validator[2]+`/api/deploy`, req).then(r => r.json()).then(x =>  x)
      return b
    }
  }

}


const bytesToHex = (bytes) => {
  const hex = []
  for (let i = 0; i < bytes.length; i++) {
    hex.push((bytes[i] >>> 4).toString(16));
    hex.push((bytes[i] & 0xf).toString(16));
  }
  return hex.join('')
}

const fetchBalance = async (req) => {
  let b
  try {
    b = await fetch(readonly[0]+`/api/explore-deploy`, req).then(r => r.json()).then(x => x.expr[0].ExprInt.data)
  } catch(err) {
    try {
      b = await fetch(readonly[1]+`/api/explore-deploy`, req).then(r => r.json()).then(x => x.expr[0].ExprInt.data)
    } catch(err) {
      b = await fetch(readonly[2]+`/api/explore-deploy`, req).then(r => r.json()).then(x => x.expr[0].ExprInt.data)
    }
  }
  return b
}


class Transfer extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
                  sk: '',
                  pubKey: '',
                  revAddress: null,
                  revAddress2: null,
                  keyfile: null,
                  amount: '',
                  toAddr: '',
                  balance: null,
                  isChecked: false,
                  isTransfered: false,
                  addrList: [],
                  copied: false,
                  fileContents: null,
                  basicKey: '',
                  showModal1: false, // password input when checking balance
                  showModal2: false, // password input when transferring
                  showModal3: false, // wrong password when transferring or checking balance
                  showModal4: false, // transfer_success
                  showModal5: false, // transfer_failed
                  showModal6: false, // wrong_opt
                  showModal7: false, // cannot get keystore from storage
                  showModal8: false, // only alphabets allowed
                  showModal9: false, // balance is not enough
                  showModal10: false, // address is wrong
                  showSpinner: false,
                  showBalanceSpinner : true,
                  deployId: null 
                }

    this.handleInputChange1 = this.handleInputChange1.bind(this)
    this.handleInputChange2 = this.handleInputChange2.bind(this)
    this.checkBalance = this.checkBalance.bind(this)
    this.transfer = this.transfer.bind(this)
    this.renderOptions = this.renderOptions.bind(this)
    this.handleInputPass = this.handleInputPass.bind(this)
    this.storeHistory = this.storeHistory.bind(this)    
  }

  handleInputChange1(event) {  // for transfer recipient and amount
       var pass = event.target.value
       var reg = /^[A-Za-z0-9.]+$/
       var test = reg.test(pass)
       const name = event.target.name
       if (test || pass.length === 0) {
          this.setState({[name]: event.target.value})
       }else{
         // alert('only alphanumeric')
         // this.setState({showModal8: true})
       }      
  }

  handleInputChange2(event) {  // for keystore with special alphabets
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState({
      [name]: value
    })
  }



  async componentDidMount() { 
    add_5.map( i => {
      return chrome.storage.local.get([i], function(result) {
        if (result.hasOwnProperty(i) === true) {
          var tempC = result[i].substring(0,8) +"........"+ result[i].substring(result[i].length-7,result[i].length+1)
          chrome.storage.local.get([i]+"_keyfile", function(res) {
            if (this.state.revAddress === null){
              this.setState({revAddress: result[i], revAddress2: tempC, keyfile: res}, ()=>{ this.checkBalance ()})
            }
            this.setState({
              addrList:[...this.state.addrList, {v:result[i], s:tempC, k: res }]
            })
          }.bind(this))  
        }
      }.bind(this))
    })

  }

  async storeHistory(){ 
    const d = Date.now()
    chrome.storage.local.get(["History"], function(result) {
      var newOne = result.History
      newOne.push({time: d, address: this.state.revAddress, deployId: this.state.deployId, amount: this.state.amount, to: this.state.toAddr, status: "Pending"})
      chrome.storage.local.set({'History': newOne}, function() {return})
    }.bind(this))
  }  

  async handleInputPass(code){ 
    var Wallet = require('ethereumjs-wallet')
    var passworder = require('browser-passworder')
    const c_key = this.state.revAddress + "_keyfile"
    var tempP
    chrome.runtime.sendMessage({ cmd: 'GET_BASICKEY' }, response => {this.setState({basicKey: response.basicKey}); return true})

    chrome.storage.local.get([c_key], function(result) {
      try {
        passworder.decrypt(this.state.basicKey, result[c_key])
        .then(function(blob) {
          this.setState({fileContents:  blob }, () => {
            try {
              tempP = Wallet.fromV3(this.state.fileContents, this.state.PKpass, true).getPrivateKeyString().slice(2) 
            }
            catch(err) {
              // alert("Keystore密码错Wrong Password")
              this.setState({showModal3: true, showSpinner: false })
              // console.log("here is #194")
              return
            }  
            this.setState({ sk: tempP }, () => {
              try {
                // sendDeploy(http, code, this.state.sk).then( (response) => {
                apiDeploy(code, this.state.sk).then( (response) => {
                  // console.log("Response: ", response)
                  try {
                    if (response.substring(0,8) ==="Success!") {
                      this.setState({deployId: response.substring(22,164), showModal4: true, showSpinner: false})
                      this.storeHistory()
                    }else{
                      // alert("操作失败 The operation failed")
                      this.setState({showModal6: true, showSpinner: false})
                      return
                    }  
                  }
                  catch(err) {
                    // alert("操作失败 The operation failed")
                    this.setState({showModal6: true, showSpinner: false})
                    return
                  }  
                })
              }
              catch(err) {
                // alert("操作失败 The operation failed")
                this.setState({showModal6: true, showSpinner: false})
                return
              }
            })
          })
        }.bind(this))
      }
      catch(err) {
        // alert("密码输入有误，操作失败")
        this.setState({showModal7: true})
        return
      }
    }.bind(this))
  }



  async checkBalance () {
    const req = {
      method: 'POST',
      body: `
              new return, rl(\`rho:registry:lookup\`), RevVaultCh, vaultCh in {
                rl!(\`rho:rchain:revVault\`, *RevVaultCh) |
                for (@(_, RevVault) <- RevVaultCh) {
                  @RevVault!("findOrCreate", "${this.state.revAddress}", *vaultCh) |
                  for (@maybeVault <- vaultCh) {
                    match maybeVault {
                      (true, vault) => @vault!("balance", *return)
                      (false, err)  => return!(err)
                    }
                  }
                }
              }
            `
    }

    const wait = await fetchBalance(req)
    this.setState({balance: wait}, ()=>{ 
      this.setState({showBalanceSpinner: false})
    })
  }



  async transfer() {
    // event.preventDefault()
    var amt 
    if (this.state.balance - this.state.amount * 100000000 < 300000) {
      amt = (this.state.balance  - 300000).toFixed(0)   
      this.setState({amount: ((this.state.balance  - 300000) / 100000000).toFixed(8)})
    }else{
      amt = (this.state.amount * 100000000).toFixed(0)
      this.setState({amount: (amt / 100000000).toFixed(8)})  
    }
    // console.log("amt: ",amt)
    // console.log("amount: ",this.state.amount)
    if (amt <=0) {
        this.setState({showModal9: true, showModal2: false})
        return
    }

    if (this.state.toAddr.length !== 53 && this.state.toAddr.length !== 54){
      this.setState({showModal10: true, showModal2: false})
      return
    }

      const code =`
        new
          rl(\`rho:registry:lookup\`), RevVaultCh,
        deployId(\`rho:rchain:deployId\`),stdout(\`rho:io:stdout\`)
        in {
          rl!(\`rho:rchain:revVault\`, *RevVaultCh)|
          for (@(_, RevVault) <- RevVaultCh) {
             match ("${this.state.revAddress}", "${this.state.toAddr}", ${amt}) {
              (from, to, amount) => {
                new vaultCh, vault2Ch, revVaultkeyCh, deployerId(\`rho:rchain:deployerId\`) in {
                  @RevVault!("findOrCreate", from, *vaultCh) |
                  @RevVault!("findOrCreate", to, *vault2Ch) |
                  @RevVault!("deployerAuthKey", *deployerId, *revVaultkeyCh) |
                  for (@(true, vault) <- vaultCh; _ <- vault2Ch; key <- revVaultkeyCh) {
                    new resultCh in {
                      @vault!("transfer", to, amount, *key, *resultCh) |
                      for (@(result, _ ) <- resultCh) {
                        for (@historySet <- @"TransferHistory1") {
                          @"TransferHistory1"!(historySet.add([from, to, amount, result]))
                        }|  
                        if (result == true) {
                          deployId!("dui")|
                          stdout!("dui")
                        } else {
                          deployId!("cuo")|
                          stdout!("cuo")
                        }  
                      }
                    }
                  }
                }
              }
            }
          }
        }`
        // console.log("code: ", code)
        this.setState({showModal2: false, showSpinner: true})
      await this.handleInputPass(code)

  }

  renderOptions() {
    return (this.state.addrList.map((i) => {
      return <Dropdown.Item eventKey={i.v} onSelect = {
        (e) => {
          var tempC= e.substring(0,8) +"........"+ e.substring(e.length-7,e.length+1)
          this.setState({revAddress: e,
                         revAddress2: tempC,
                         showBalanceSpinner: true
                        },()=> {this.checkBalance ()})
        } 
      } >{i.s}</Dropdown.Item>
    }))
  }

  render() {
    const renderTooltip = props => (
      <div
        {...props}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          padding: '2px 10px',
          color: 'white',
          borderRadius: 3,
          ...props.style,
        }}
      >
        <FormattedMessage id='copy' />
      </div>
    )

    return (
      <div > 
        <Header />
        <div className="Rui_relative">
          <div className="Rui_address">
            <Container style={{ paddingTop: '4px', paddingLeft: '1px' }}>
                <Row >
                  <Col xs={1}> </Col>
                  <Col xs={7} style={{ paddingRight: '1px' }}>
                    <DropdownButton size="sm" variant="secondary" id="dropdown-basic" title={this.state.revAddress2 === null ? "尚未导入私钥 No keys found." : this.state.revAddress2 }  >
                      {this.renderOptions()}
                    </DropdownButton>
                  </Col>
                  <Col xs={2} style={{ paddingLeft: '1px' }}>
                    <OverlayTrigger
                      placement="right-start"
                      delay={{ show: 250, hide: 400 }}
                      overlay={renderTooltip}
                    >
                      <CopyToClipboard text={this.state.revAddress}
                        onCopy={() => this.setState({copied: true})}>
                        <CopyIcon width="20px" height="20px" cursor="pointer" />
                      </CopyToClipboard>
                    </OverlayTrigger>
                  </Col>
                  <Col xs={2}> </Col>
                </Row>
            </Container> 
          </div>

          <div className="Rui_balance">    
           <Row style={{ paddingTop: '10px' }}>
          <Col md={{ span: 4, offset: 4 }}>
            <img src={require('./rchain_white.png')} alt="rev" />
          </Col>
        </Row>
          <div > <label className="Rui_balance_num">
          { this.state.showBalanceSpinner 
            ? <span> <Spinner as="span" animation="grow" size="lg" role="status" aria-hidden="true" />
                REV</span>
            : <span> {(this.state.balance/100000000).toFixed(4)} REV</span>
          }  
          </label></div>
          </div>
        </div> 

        <div className="Rui_transfer">
          <form  >
            <label><FormattedMessage id='to_address' /></label>
            <input type="text" name="toAddr" value={this.state.toAddr} onChange={this.handleInputChange1} className="Rui_input form-control form-control-lg" />
            <label><FormattedMessage id='amount' /></label>
            <input type="number" name="amount" value={this.state.amount} onChange={this.handleInputChange1}  className="Rui_input form-control form-control-lg" />
          </form>
          <p></p>
          { !this.state.showSpinner 
          ? <Button variant="outline-light" size="lg" onClick={()=>{this.setState({showModal2: true})}}><FormattedMessage id='transfer' /></Button>
          : <Button variant="outline-light" size="lg" disabled>
              <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
              Transferring...
            </Button>
          }  
        </div>

        <Modal size="sm" show = {this.state.showModal2} onHide={this.transfer}>
          <Modal.Body>
            <FormattedMessage id='key_pass' />
            <input type="password" name="PKpass" value={this.state.PKpass} onChange={this.handleInputChange2} className="Rui_input form-control form-control-lg" />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.transfer}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal size="sm" show = {this.state.showModal3} onHide={()=>this.setState({showModal3: false})}>
          <Modal.Body>
            <FormattedMessage id='wrong_key_pass' />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal3: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal size="sm" show = {this.state.showModal4} onHide={()=>this.setState({showModal4: false})}>
          <Modal.Body>
            <FormattedMessage id='transfer_success' />
            <input style={{ fontSize:'10px'}} type="text" name="deployId" value={this.state.deployId} className="form-control form-control-sm" />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal4: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>
      { /*  <Modal size="sm" show = {this.state.showModal5} onHide={()=>this.setState({showModal5: false})}>
          <Modal.Body>
            <FormattedMessage id='transfer_failed' />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal5: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>
      */ }  
        <Modal size="sm" show = {this.state.showModal6} onHide={()=>this.setState({showModal6: false})}>
          <Modal.Body>
            <FormattedMessage id='wrong_opt' />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal6: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal size="sm" show = {this.state.showModal7} onHide={()=>this.setState({showModal7: false})}>
          <Modal.Body>
            <FormattedMessage id='wrong_key_pass' />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal7: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>      
        <Modal size="sm" show = {this.state.showModal9} onHide={()=>this.setState({showModal9: false})}>
          <Modal.Body>
            <FormattedMessage id='balance_not_enough' />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal9: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>  
        <Modal size="sm" show = {this.state.showModal10} onHide={()=>this.setState({showModal10: false})}>
          <Modal.Body>
            <FormattedMessage id='wrong_address' />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal10: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>    
      </div>
    )
  }
}

export default withRouter(Transfer)



