/*global chrome*/

import React from 'react'
import { withRouter } from 'react-router-dom'
import bcrypt from 'bcryptjs'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Header from './header'
import basicKey from './bk'
import {FormattedMessage} from 'react-intl'

const passworder = require('browser-passworder')

class PassPage extends React.Component {

  constructor(props) {
    super(props)
    this.state = {  oldP: '', 
                    p1: '', 
                    p2: '', 
                    showModal1: false, 
                    showModal2: false, 
                    showModal3: false, 
                    showModal4: false, 
                    showModal5: false
                  }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.newPass = this.newPass.bind(this)
    this.changeStore = this.changeStore.bind(this)
  }

  handleInputChange(event) {
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState({
      [name]: value
    })
  }

  async changeStore() {
    const addr =["address1","address2","address3","address4","address5"]
    for ( const i of addr) {
      await chrome.storage.local.get([i], function(result) {
          if (result.hasOwnProperty(i) === true) {
            chrome.storage.local.get([result[i] + "_keyfile"], function(res) {
              passworder.decrypt(this.state.oldP, res[result[i] + "_keyfile"])
                .then(function(blob) {
                   passworder.encrypt(this.state.p1, blob)
                    .then(function(blob2) {
                      chrome.storage.local.set({[result[i] + "_keyfile"]: blob2}, function() {})
                    })
                }.bind(this))
            }.bind(this))
          }
      }.bind(this))
    }
  }              

  async newPass() {
      await chrome.storage.local.get(['userPass'], function(result) {
      if (this.state.oldP ==="") {
        // alert("请输入旧密码Input old password")
        this.setState({showModal1: true})
      }
      else{
        bcrypt.compare(this.state.oldP, result.userPass, function(err, res) {
          if (res === true){
             if (this.state.p1 ==="") {
                // alert("新密码不能为空New password cannot be blank")
                this.setState({showModal2: true})
             }
             else{   
                if ( this.state.p1 === this.state.p2 ){
                  var salt = bcrypt.genSaltSync(10)
                  var hash = bcrypt.hashSync(this.state.p1, salt)
                  chrome.storage.local.set({'userPass': hash}, function() {})
                  this.changeStore()
                  basicKey.hash =  this.state.p1
                  // alert("密码修改成功Succeed")
                  this.setState({showModal3: true})
                  this.props.history.push('/transfer')
                  
                }else{
                  // alert("两次输入的密码不一致Not identical")
                  this.setState({showModal4: true})
                }
            }
          }    
          else{
                // alert("旧密码输入错误The old password is wrong")
                this.setState({showModal5: true})
              }
  
        }.bind(this))
      }  
    }.bind(this))
  }    

  render() {

    return (
      <div>
        <Header />
        <div className="Rui_newPass">      
          <form>
            <label>
              <FormattedMessage id='old_pass' />
            </label>
            <input type="password" name="oldP" value={this.state.oldP} onChange={this.handleInputChange} className="Rui_input form-control form-control-lg" />
            <p></p>
            <label>
              <FormattedMessage id='new_pass' />
            </label>
            <input type="password" name="p1" value={this.state.p1} onChange={this.handleInputChange} className="Rui_input form-control form-control-lg" />
            <p></p>
            <label>
              <FormattedMessage id='pass_twice' />
            </label>
              <input type="password" name="p2" value={this.state.p2} onChange={this.handleInputChange} className="Rui_input form-control form-control-lg" />
            <p></p>
            <Button variant="outline-light" size="lg" onClick={this.newPass} ><FormattedMessage id='confirm' /></Button>
          </form>                 
        </div>

        <Modal size="sm" show = {this.state.showModal1} onHide={()=>this.setState({showModal1: false})}>
          <Modal.Body>
            <FormattedMessage id='old_pass2' />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal1: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal size="sm" show = {this.state.showModal2} onHide={()=>this.setState({showModal2: false})}>
          <Modal.Body>
            <FormattedMessage id='null_pass' />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal2: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal size="sm" show = {this.state.showModal3} onHide={()=>this.setState({showModal3: false})}>
          <Modal.Body>
            <FormattedMessage id='pass_success' />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal3: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal size="sm" show = {this.state.showModal4} onHide={()=>this.setState({showModal4: false})}>
          <Modal.Body>
            <FormattedMessage id='inconsistency' />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal4: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal size="sm" show = {this.state.showModal5} onHide={()=>this.setState({showModal5: false})}>
          <Modal.Body>
            <FormattedMessage id='wrong_old' />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal5: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default withRouter(PassPage)



