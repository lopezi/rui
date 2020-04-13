/*global chrome*/

import React from 'react'
import bcrypt from 'bcryptjs'
import { Link, withRouter } from 'react-router-dom'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from "react-bootstrap/Button"
import Modal from 'react-bootstrap/Modal'
import Auth from './auth'
import {FormattedMessage} from 'react-intl'

class LoginPage extends React.Component {

  constructor(props) {
    super(props)
    this.state = { pass: "",
                   isReged: false,
                   showModal1: false
                 }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.checkPass = this.checkPass.bind(this)
  }

  async componentDidMount() {
    await chrome.storage.local.get(['userPass'], function(result) {
      if(result.userPass.length >0){
        this.setState({ isReged: true })
      }
    }.bind(this))

    this.renderRedirect()

  }

  handleInputChange(event) {
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState({
      [name]: value
    })
  }

  async checkPass(event) {
    event.preventDefault();
    await chrome.storage.local.get(['userPass'], function(result) {
      bcrypt.compare(this.state.pass, result.userPass, function(err, res) {
        if (res === true){
          Auth.login()
          // basicKey.hash=this.state.pass         
          chrome.runtime.sendMessage({ cmd: 'SET_BASICKEY', basicKey: this.state.pass })
          this.props.history.push('/transfer')   
        }  else{
          // alert("密码错")
          this.setState({showModal1: true})
        }
      }.bind(this)) 
    }.bind(this))
  }

  renderRedirect () {
    let jump
    chrome.runtime.sendMessage({ cmd: 'GET_TIME' }, response => {
      if (response.time) {
        const time = new Date(response.time)
        // console.log("time.getTime() - Date.now(): ", time.getTime() - Date.now())
        if ((time.getTime() - Date.now())> 0) {
          jump = 1
        }else{
          jump = 0   
        }
      }
      if (response.time === undefined) {
        jump = 0  
      }
      if (jump ===1) {
        Auth.login()
        this.props.history.push('/transfer')
      }
    })
  }

  render() {
    return (
      <div >
        <Row style={{ paddingTop: '60px' }}>
          <Col md={{ span: 4, offset: 4 }}>
            <img src={require('./rui.png')} alt="rui" />
            <h2>RChain Wallet</h2>     <p></p>
          </Col>
        </Row>
        <div className="Rui_pass">      
          <form>
            <label>
              <FormattedMessage id='input_pass' />
            </label>
              <input type="password" name="pass" value={this.state.pass} onChange={this.handleInputChange} className="Rui_input form-control form-control-lg" />
            <p></p>
            <Button variant="outline-light" size="lg" onClick={this.checkPass} ><FormattedMessage id='login' /> </Button>
            <lable style={{ paddingLeft: '20px' }} >
            { !this.state.isReged ?  <Link to="/register"><FormattedMessage id='register' /></Link> : null }     
            </lable>   
          </form>
        </div>

        <Modal size="sm" show = {this.state.showModal1} onHide={()=>this.setState({showModal1: false})}>
          <Modal.Body>
            <FormattedMessage id='wrong_pass' />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal1: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
      </Modal>
      </div>
    )
  }
}

export default withRouter(LoginPage)



