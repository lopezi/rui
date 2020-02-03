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
import {FormattedMessage} from 'react-intl'

const { rnodeDeploy, rnodePropose, signDeploy, verifyDeploy } = require('@tgrospic/rnode-grpc-js')

// Generated files with rnode-grpc-js tool
const protoSchema = require('../rnode-grpc-gen/js/pbjs_generated.json')
// Import generated protobuf types (in global scope)
require('../rnode-grpc-gen/js/DeployServiceV1_pb')
require('../rnode-grpc-gen/js/ProposeServiceV1_pb')

const add_5 = ["address1","address2","address3","address4","address5"]
const http = `http://proxy.wenode.io:44401`

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
  const { DoDeploy, propose } = rnode(rnodeUrl)
  const deployData = {
    term: code, phlolimit: 100e6, phloprice: 1,
    validafterblocknumber: 1
  }
  const deploy = signDeploy(privateKey, deployData)
  // const isValidDeploy = verifyDeploy(deploy)
  try {
    const { result } = await DoDeploy(deploy)
    // console.log('DoDeploy: ', result)

  } catch (error) { return error }

  try {
    const resPropose = await propose()
    // console.log('PROPOSE', resPropose)
  } catch (error) { console.log(error) }

  const data = await getDataForDeploy(rnodeUrl, deploy.sig)
  console.log('data: ', data)
  return data

}

const getDataForDeploy = async (rnodeUrl, deployId) => {
  const { listenForDataAtName } = rnode(rnodeUrl)
  const { payload: { blockinfoList }  } = await listenForDataAtName({
    depth: -1,
    name: { unforgeablesList: [{gDeployIdBody: {sig: deployId}}] },
  })
console.log("blockinfoList.length: ", blockinfoList.length)
  return blockinfoList.length &&
    blockinfoList[0].postblockdataList[0].exprsList[0].gInt ||
    blockinfoList[0].postblockdataList[0].exprsList[0].gString
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
                  showModal1: false,
                  showModal2: false,
                  showModal3: false,
                  showModal4: false,                  
                  showModal5: false,
                  showModal6: false 
                }

    this.handleInputChange = this.handleInputChange.bind(this)
    this.queryBalance = this.queryBalance.bind(this)
    this.transfer = this.transfer.bind(this)
    this.renderOptions = this.renderOptions.bind(this)
    this.handleInputPass = this.handleInputPass.bind(this)
  }

  handleInputChange(event) {
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
              this.setState({revAddress: result[i], revAddress2: tempC, keyfile: res})
            }
            this.setState({
              addrList:[...this.state.addrList, {v:result[i], s:tempC, k: res }]
            })
          }.bind(this))  
        }
      }.bind(this))
    })
  }

  async handleInputPass(item, http, code){ 
    item ==="check balance" 
    ? this.setState({showModal1: false})
    : this.setState({showModal2: false})
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
              this.setState({showModal3: true})
              return
            }  
            this.setState({ sk: tempP}, () => {
              try {
                sendDeploy(http, code, this.state.sk).then( (response) => {
                  console.log("Response: ", response)
                  item ==="check balance" 
                    ? this.setState({balance: response})
                    : response === 'dui' 
                      // ? alert("转账成功Transfer Succeeded") 
                      ? this.setState({showModal4: true})
                      // : alert("转账失败Transfer Failed") 
                      : this.setState({showModal5: true})
                  return response
                })
              }
              catch(err) {
                // alert("操作失败 The operation failed")
                this.setState({showModal6: true})
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
    const code =`
      new
      rl(\`rho:registry:lookup\`), RevVaultCh,
      vaultCh, balanceCh,
      deployId(\`rho:rchain:deployId\`)
      in {
        rl!(\`rho:rchain:revVault\`, *RevVaultCh) |
        for (@(_, RevVault) <- RevVaultCh) {
          match "${this.state.revAddress}" {
            revAddress => {
              @RevVault!("findOrCreate", revAddress, *vaultCh) |
              for (@(true, vault) <- vaultCh) {
                @vault!("balance", *balanceCh) |
                for (@balance <- balanceCh) {
                  deployId!(balance)
                }
              }
            }
          }
        }
      }
    `
    await this.handleInputPass("check balance", http, code)
  }

  async transfer(event) {
    event.preventDefault()
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
    await this.handleInputPass("transfer", http, code)
  }

  renderOptions() {
    return (this.state.addrList.map((i) => {
      return <Dropdown.Item eventKey={i.v} onSelect = {
        (e) => {
          var tempC= e.substring(0,8) +"........"+ e.substring(e.length-7,e.length+1)
          this.setState({revAddress: e,
                         revAddress2: tempC
                        })
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
            <form >
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

            <DropdownButton variant="secondary" id="dropdown-basic" title={this.state.revAddress2 === null ? "尚未导入私钥 No keys found." : this.state.revAddress2 }  >
              {this.renderOptions()}
            </DropdownButton>
          </div>

          <div className="Rui_balance">    
             <div > <label><FormattedMessage id='balance' /></label></div>
             <div > <label className="Rui_balance_num">{(this.state.balance/100000000).toFixed(4)} REV </label></div>
             <div > <Button variant="outline-light" size="lg" onClick={()=>{this.setState({showModal1: true})}}><FormattedMessage id='check' /></Button></div>
          </div>
        </div> 

        <Modal size="sm" show = {this.state.showModal1} onHide={this.queryBalance}>
          <Modal.Body>
            <FormattedMessage id='key_pass' />
            <input type="password" name="PKpass" value={this.state.PKpass} onChange={this.handleInputChange} className="Rui_input form-control form-control-lg" />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.queryBalance}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>

        <div className="Rui_transfer">
              <form  >
                <label><FormattedMessage id='to_address' /></label>
                <input type="text" name="toAddr" value={this.state.toAddr} onChange={this.handleInputChange} className="Rui_input form-control form-control-lg" />
                <label><FormattedMessage id='amount' /></label>
                <input type="number" name="amount" value={this.state.amount} onChange={this.handleInputChange}  className="Rui_input form-control form-control-lg" />
              </form>
              <p></p>
              <Button variant="outline-light" size="lg" onClick={()=>{this.setState({showModal2: true})}}><FormattedMessage id='transfer' /></Button>
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
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal4: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal size="sm" show = {this.state.showModal5} onHide={()=>this.setState({showModal5: false})}>
          <Modal.Body>
            <FormattedMessage id='transfer_failed' />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal5: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>
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



