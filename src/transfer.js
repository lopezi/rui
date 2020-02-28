/*global chrome*/

import React from 'react'
import { withRouter } from 'react-router-dom'
import {CopyToClipboard} from 'react-copy-to-clipboard';
import grpcWeb from 'grpc-web'
import basicKey from './bk'
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

const { rnodeDeploy, rnodePropose, signDeploy, verifyDeploy } = require('@tgrospic/rnode-grpc-js')

// Generated files with rnode-grpc-js tool
const protoSchema = require('../rnode-grpc-gen/js/pbjs_generated.json')
// Import generated protobuf types (in global scope)
require('../rnode-grpc-gen/js/DeployServiceV1_pb')
require('../rnode-grpc-gen/js/ProposeServiceV1_pb')

const add_5 = ["address1","address2","address3","address4","address5"]
// const http = `https://testnet-2.grpc.rchain.isotypic.com`
const http = `http://proxy.wenode.io:44401`
// const http = `http://173.249.48.71:44401`

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

const sendDeploy = async (rnodeUrl, code, privateKey) => {
  const { DoDeploy, propose, getBlock } = rnode(rnodeUrl)
const url = "http://35.220.140.14:40403/api/last-finalized-block"
const num = await fetch(url, { method:'get' })
        .then((str) => str.json()).then( x => x.blockInfo.blockNumber )
console.log("num: ", num)

  const deployData = {
    term: code, phlolimit: 100e6, phloprice: 1,
    validafterblocknumber: num+1
  }
  const deploy = signDeploy(privateKey, deployData)
  // const isValidDeploy = verifyDeploy(deploy)
  try {
    const { result } = await DoDeploy(deploy)
    console.log('DoDeploy: ', result)
    return result
  } catch (error) { return error }



  try {
    const resPropose = await propose()
    console.log('PROPOSE', resPropose)
  } catch (error) { console.log("Propose Error: ",error) }

  // const data = await getDataForDeploy(rnodeUrl, deploy.sig)
  // console.log('data: ', data)
  // return data
}

// const getDataForDeploy = async (rnodeUrl, deployId) => {
//   const { listenForDataAtName } = rnode(rnodeUrl)
//   const { payload: { blockinfoList }  } = await listenForDataAtName({
//     depth: -1,
//     name: { unforgeablesList: [{gDeployIdBody: {sig: deployId}}] },
//   })
// console.log("blockinfoList.length: ", blockinfoList.length)
//   return blockinfoList.length &&
//     blockinfoList[0].postblockdataList[0].exprsList[0].gInt ||
//     blockinfoList[0].postblockdataList[0].exprsList[0].gString
// }

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
                  showModal1: false, // password input when checking balance
                  showModal2: false, // password input when transferring
                  showModal3: false, // wrong password when transferring or checking balance
                  showModal4: false, // transfer_success
                  showModal5: false, // transfer_failed
                  showModal6: false, // wrong_opt
                  showModal7: false, // cannot get keystore from storage
                  showModal8: false, // only alphabets allowed
                  showSpinner: false,
                  deployId: null 
                }

    this.handleInputChange = this.handleInputChange.bind(this)
    // this.queryBalance = this.queryBalance.bind(this)
    this.checkBalance = this.checkBalance.bind(this)
    this.transfer = this.transfer.bind(this)
    this.renderOptions = this.renderOptions.bind(this)
    this.handleInputPass = this.handleInputPass.bind(this)
    this.storeHistory = this.storeHistory.bind(this)    
  }

  handleInputChange(event) {
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
  // time, this.state.revAddress, this.state.deployId, this.state.amount, this.state.to, "pending"
    const d = Date.now()
    chrome.storage.local.get(["History"], function(result) {
      var newOne = result.History
      newOne.push({time: d, address: this.state.revAddress, deployId: this.state.deployId, amount: this.state.amount, to: this.state.toAddr, status: "Pending"})
      chrome.storage.local.set({'History': newOne}, function() {return})
    }.bind(this))
  }  

  async handleInputPass(item, http, code){ 
    // item ==="check balance" 
    // ? this.setState({showModal1: false})
    // : this.setState({showModal2: false})
    // this.setState({showModal2: false, showSpinner: true})
    var Wallet = require('ethereumjs-wallet')
    var passworder = require('browser-passworder')
    const c_key = this.state.revAddress + "_keyfile"
    var tempP
    chrome.storage.local.get([c_key], function(result) {
      try {
        passworder.decrypt(basicKey.hash, result[c_key])
        .then(function(blob) {
          this.setState({fileContents:  blob }, () => {
            try {
              tempP = Wallet.fromV3(this.state.fileContents, this.state.PKpass, true).getPrivateKeyString().slice(2) 
            }
            catch(err) {
              // alert("Keystore密码错Wrong Password")
              this.setState({showModal3: true, showSpinner: false })
              return
            }  
            this.setState({ sk: tempP }, () => {
              try {
                sendDeploy(http, code, this.state.sk).then( (response) => {
                  console.log("Response: ", response)
                  try {
                    if (response.substring(0,8) ==="Success!") {
                      this.setState({deployId: response.substring(22,164), showModal4: true, showSpinner: false})
                      this.storeHistory()
                      // item ==="check balance" 
                      //   ? this.setState({balance: response})
                      //   : response === 'dui' 
                      //     // ? alert("转账成功Transfer Succeeded") 
                      //     ? this.setState({showModal4: true, showSpinner: false})
                      //     // : alert("转账失败Transfer Failed") 
                      //     : this.setState({showModal5: true, showSpinner: false})
                      // return response
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

  async queryBalance() {
    // const code =`
    //   new
    //   rl(\`rho:registry:lookup\`), RevVaultCh,
    //   vaultCh, balanceCh,
    //   deployId(\`rho:rchain:deployId\`)
    //   in {
    //     rl!(\`rho:rchain:revVault\`, *RevVaultCh) |
    //     for (@(_, RevVault) <- RevVaultCh) {
    //       match "${this.state.revAddress}" {
    //         revAddress => {
    //           @RevVault!("findOrCreate", revAddress, *vaultCh) |
    //           for (@(true, vault) <- vaultCh) {
    //             @vault!("balance", *balanceCh) |
    //             for (@balance <- balanceCh) {
    //               deployId!(balance)
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    // `
    // await this.handleInputPass("check balance", http, code)
  }

  async checkBalance () {
    // const url = 'http://104.197.246.182:40403/api/explore-deploy'  // mainnet
    // const url = 'http://207.180.230.84:40403/api/explore-deploy'  // my contabo 30G
    // const url = 'http://34.66.209.49:40403/api/explore-deploy'  //testnet
    const url = "http://35.220.140.14:40403/api/explore-deploy" 

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

    const b = await fetch(url, req).then(r => r.json()).then(x => x.expr[0].ExprInt.data)
    this.setState({balance: b}, ()=>{console.log("Balance: ",this.state.balance)})
  }


  async transfer() {
    // event.preventDefault()
    const code =`
      new
        rl(\`rho:registry:lookup\`), RevVaultCh,
      deployId(\`rho:rchain:deployId\`),stdout(\`rho:io:stdout\`)
      in {
        rl!(\`rho:rchain:revVault\`, *RevVaultCh)|
        for (@(_, RevVault) <- RevVaultCh) {
           match ("${this.state.revAddress}", "${this.state.toAddr}", ${this.state.amount*100000000}) {
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
      this.setState({showModal2: false, showSpinner: true})
    await this.handleInputPass("transfer", http, code)
  }

  renderOptions() {
    return (this.state.addrList.map((i) => {
      return <Dropdown.Item eventKey={i.v} onSelect = {
        (e) => {
          var tempC= e.substring(0,8) +"........"+ e.substring(e.length-7,e.length+1)
          this.setState({revAddress: e,
                         revAddress2: tempC
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
            { /* <form >
             <label>
                <FormattedMessage id='address' />
              </label>
 
              <OverlayTrigger
                placement="right-start"
                delay={{ show: 250, hide: 400 }}
                overlay={renderTooltip}
              >
                <CopyToClipboard text={this.state.revAddress}
                  onCopy={() => this.setState({copied: true})}>
                  <CopyIcon width="20px" height="20px" />
                </CopyToClipboard>
              </OverlayTrigger>
            </form>
         */ } 
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
          { /*    <div > <label><FormattedMessage id='balance' /></label></div> */ }
           <Row style={{ paddingTop: '10px' }}>
          <Col md={{ span: 4, offset: 4 }}>
            <img src={require('./rchain_white.png')} alt="rev" />
          </Col>
        </Row>
             <div > <label className="Rui_balance_num">{(this.state.balance/100000000).toFixed(4)} REV </label></div>
          { /*   <div > <Button variant="outline-light" size="lg" onClick={this.checkBalance}><FormattedMessage id='check' /></Button></div> */ }
          </div>
        </div> 

       { /* <Modal size="sm" show = {this.state.showModal1} onHide={this.checkBalance}>
          <Modal.Body>
            <FormattedMessage id='key_pass' />
            <input type="password" name="PKpass" value={this.state.PKpass} onChange={this.handleInputChange} className="Rui_input form-control form-control-lg" />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.checkBalance}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>  */ }

        <div className="Rui_transfer">
          <form  >
            <label><FormattedMessage id='to_address' /></label>
            <input type="text" name="toAddr" value={this.state.toAddr} onChange={this.handleInputChange} className="Rui_input form-control form-control-lg" />
            <label><FormattedMessage id='amount' /></label>
            <input type="number" name="amount" value={this.state.amount} onChange={this.handleInputChange}  className="Rui_input form-control form-control-lg" />
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
            <input type="password" name="PKpass" value={this.state.PKpass} onChange={this.handleInputChange} className="Rui_input form-control form-control-lg" />
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
      </div>
    )
  }
}

export default withRouter(Transfer)



