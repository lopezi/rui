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

class KeytoolsPage extends React.Component {

  constructor(props) {
    super(props)
    this.state = {sk: null,
                  pass1: null,
                  pass2: null,
                  tab: "key2keystore",
                  keystore: null,
                  showModal1: false,
                  showModal2: false,
                  showModal3: false,
                  showModal4: false,
                  display1: 'block',
                  display2: 'none',
                  showSpinner: false
                 }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.toKeystore = this.toKeystore.bind(this)
  }

  handleInputChange(event) {
       var pass = event.target.value
       var reg = /^[A-Za-z0-9]+$/
       var test = reg.test(pass)
       const name = event.target.name
       if (test || pass.length === 0) {
          this.setState({[name]: event.target.value})
       }else{
         // alert('only alphanumeric')
         this.setState({showModal4: true})
       }      
  }

  async toKeystore() {
    this.setState({showSpinner: true})
    try {
      if(this.state.pass1.length < 6) {
        // alert('must >6')
        this.setState({showModal3: true, showSpinner: false})
        return
      } else  {
        if ( this.state.pass1 === this.state.pass2 ){
          var Wallet = require('ethereumjs-wallet')
          var key = Buffer.from(this.state.sk, 'hex')
          var wallet = Wallet.fromPrivateKey(key)

      // this.setState({showSpinner: true}, ()=>{temp = wallet.toV3String(this.state.pass1).toString()})


          const temp = await wallet.toV3String(this.state.pass1).toString()
          this.setState({keystore: temp, display1: 'none', display2: 'block', showSpinner: false,showModal1: false}, ()=>{})
        }else{
          // alert("再次输入的密码不一致")   
          this.setState({showModal2: true, showSpinner: false})
          return
        }
      }
    }
    catch(err) {
      this.setState({showModal1: false, showSpinner: false})
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
                <input type="text" name="sk" value={this.state.sk} onChange={this.handleInputChange} className="Rui_input form-control form-control-lg" />
                <p></p>
                <Button variant="outline-light" size="lg" onClick={()=>{this.setState({showModal1: true})}} ><FormattedMessage id='confirm' /> </Button>
              </div>
              <div style={{ display: this.state.display2, paddingTop: '40px' }}>
                <label><FormattedMessage id='save_text' /></label>
                <textarea style={{resize:'none', color: '#5e6064', fontSize:'12px'}} name="body" rows='16' cols='36' value={this.state.keystore}/>
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
      </div>
    )
  }
}

export default withRouter(KeytoolsPage)

