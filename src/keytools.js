/*global chrome*/

import React from 'react'
import { withRouter } from 'react-router-dom'
import Header from './header'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Button from "react-bootstrap/Button"
import Modal from 'react-bootstrap/Modal'
import {FormattedMessage} from 'react-intl'
import Spinner from 'react-bootstrap/Spinner'
import { getAddrFromEth } from './getAddress.js'

class KeytoolsPage extends React.Component {

  constructor(props) {
    super(props)
    this.state = {sk: null,
                  pass1: null,
                  pass2: null,
                  tab: "key2keystore",
                  keystore: "",
                  revAddress: "",
                  addList: [],
                  blankAddress: '',
                  basicKey: '',
                  showModal1: false,  // setup password
                  showModal2: false,  // password inconsistency
                  showModal3: false,  // at least 6 alpphabets
                  showModal4: false,  // only alphabet allowed
                  showModal5: false,  // more than 5 addresses found                  
                  showModal6: false,  // import successfully
                  showModal7: false,  // already imported
                  display1: 'block',
                  display2: 'none',
                  showSpinner: false,
                  alreadyIn: false
                 }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.toKeystore = this.toKeystore.bind(this)
    this.getKeystore = this.getKeystore.bind(this)
    this.importKeystore = this.importKeystore.bind(this)
  }

  handleInputChange(event) {
       var pass = event.target.value
       var reg = /^[A-Za-z0-9]+$/
       var test = reg.test(pass)
       const name = event.target.name
       if (test || pass.length === 0) { // || pass.length === 0 because you cannot delete the last alphabet
          this.setState({[name]: event.target.value})
       }else{
         // alert('only alphanumeric')
         this.setState({[name]: null,showModal4: true})
         return
       }      
  }

  async componentDidMount() {
    const addr =["address1","address2","address3","address4","address5"]
    var addressOccupied = []
    for ( const i of addr) {
      await chrome.storage.local.get([i], function(result) {
        if (result.hasOwnProperty(i) === false) {
          this.setState({blankAddress: i})
        }else{
          addressOccupied.push(result[i])
        }
      }.bind(this))
    }
    this.setState({addList: addressOccupied})
  }

  async toKeystore() {
      try {
        if(this.state.pass1.length < 6) {
          // alert('must >6')
          this.setState({showModal3: true})
          return
        } else  {
          if ( this.state.pass1 === this.state.pass2 ){
            this.setState({showSpinner: true}, ()=>{
              setTimeout(()=>{this.getKeystore()},500)
            })  
          }else{
            // alert("再次输入的密码不一致")   
            this.setState({showModal2: true})
            return
          }
        }
      }
      catch(err) {
        this.setState({showModal1: false})
        return
      } 
  }

  async getKeystore() {    
    var Wallet = require('ethereumjs-wallet')
    var key = Buffer.from(this.state.sk, 'hex')
    var wallet = Wallet.fromPrivateKey(key)
    const keystore =  wallet.toV3String(this.state.pass1).toString()
    this.setState({keystore: keystore, display1: 'none', display2: 'block', showSpinner: false,showModal1: false}, ()=>{})
  }
      
  async importKeystore() {
    if (this.state.addList.length === 5) {
          this.setState({showModal5: true})
          return
    }      

    var Wallet = require('ethereumjs-wallet')
    var key = Buffer.from(this.state.sk, 'hex')
    var wallet = Wallet.fromPrivateKey(key)
    const rAdd = getAddrFromEth(wallet.getAddress().toString('hex'))
    // this.setState({revAddress: rAdd})
    for (const i of this.state.addList) {
      if (rAdd === i) {
        this.setState({showModal7: true, alreadyIn: true},()=>{})
        return
      }
    }    
    if(this.state.alreadyIn ===false){
      const c_addr = this.state.blankAddress
      const passworder = require('browser-passworder')
      chrome.runtime.sendMessage({ cmd: 'GET_BASICKEY' }, response => {this.setState({basicKey: response.basicKey}) })

      passworder.encrypt(this.state.basicKey, this.state.keystore)
      .then(function(blob) {      
        chrome.storage.local.set({[ rAdd + "_keyfile"]: blob}, function() {})
      })

      chrome.storage.local.set({[c_addr]: rAdd}, function() { })
      // alert("导入成功Import Succeed")
      this.setState({showModal6: true})
    }

  }  

  render() {
    return (
      <div>
        <Header />
        <div className="keytools">
          <Tabs id="controlled-tab-example" activeKey={this.state.tab } onSelect={(t) => {this.setState({tab: t})}}>
            <Tab eventKey="key2keystore" title="Key to Keystore">
              <div style={{ display: this.state.display1, paddingTop: '40px'}} >
                <label><FormattedMessage id='paste_key' /></label>
                <label><FormattedMessage id='key_format' /></label>
                <input type="text" name="sk" value={this.state.sk} onChange={this.handleInputChange} className="Rui_input form-control form-control-lg" />
                <p></p>
                <Button variant="outline-light" size="lg" onClick={()=>{this.setState({showModal1: true})}} ><FormattedMessage id='confirm' /> </Button>
              </div>
              <div style={{ display: this.state.display2, paddingTop: '40px' }}>
                <label><FormattedMessage id='save_text' /></label>
                <textarea style={{resize:'none', color: '#5e6064', fontSize:'12px'}} name="body" rows='12' cols='48' value={this.state.keystore}/>
                <Button variant="outline-light" size="lg" onClick={this.importKeystore} ><FormattedMessage id='import' /> </Button>
              </div>
            </Tab>
            <Tab eventKey="seed2keystore" title="Seed to Keystore" disabled>
            </Tab>            
          </Tabs>
        </div>
          <Modal size="sm" show = {this.state.showModal1} onHide={this.toKeystore}>
            <Modal.Body>
            <label>
              <FormattedMessage id='input_pass' />
            </label>
            <input type="password" name="pass1" value={this.state.pass1} onChange={this.handleInputChange} className="form-control form-control-lg" />
            <p></p>
            <label>
              <FormattedMessage id='pass_twice' />
            </label>
            <input type="password" name="pass2" value={this.state.pass2} onChange={this.handleInputChange} className="form-control form-control-lg" />
            <p></p>
            </Modal.Body>
            <Modal.Footer>
              { !this.state.showSpinner 
              ? <Button variant="primary" size="lg" onClick={this.toKeystore}><FormattedMessage id='confirm' /></Button>
              : <Button variant="primary" size="lg" disabled>
                  <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
                  Encrypting...
                </Button>
              }  
            </Modal.Footer>
          </Modal>


        <Modal size="sm" show = {this.state.showModal2} onHide={()=>this.setState({showModal2: false})}>
          <Modal.Body>
            <FormattedMessage id='inconsistency' />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal2: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal size="sm" show = {this.state.showModal3} onHide={()=>this.setState({showModal3: false})}>
          <Modal.Body>
            <FormattedMessage id='more_than_5' />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal3: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>

          <Modal size="sm" show = {this.state.showModal4} onHide={()=>this.setState({showModal4: false})}>
            <Modal.Body>
              <FormattedMessage id='only_alphanumeric' />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={()=>this.setState({showModal4: false})}>
                <FormattedMessage id='confirm' />
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal size="sm" show = {this.state.showModal5} onHide={()=>this.setState({showModal5: false})}>
            <Modal.Body>
              <FormattedMessage id='list_is_full' />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={()=>this.setState({showModal5: false})}>
                <FormattedMessage id='confirm' />
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal size="sm" show = {this.state.showModal6} onHide={()=>this.setState({showModal6: false})}>
            <Modal.Body>
              <FormattedMessage id='import_success' />
            </Modal.Body>
            <Modal.Footer>
              <Button variant="primary" onClick={()=>this.setState({showModal6: false})}>
                <FormattedMessage id='confirm' />
              </Button>
            </Modal.Footer>
          </Modal>       
          <Modal size="sm" show = {this.state.showModal7} onHide={()=>this.setState({showModal7: false})}>
            <Modal.Body>
              <FormattedMessage id='already_imported' />
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

export default withRouter(KeytoolsPage)

