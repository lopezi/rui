/*global chrome*/

import React from 'react'
import bcrypt from 'bcryptjs'
import { withRouter } from 'react-router-dom'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { FormattedMessage } from 'react-intl'

class RegPage extends React.Component {

  constructor(props) {
    super(props)
    this.state = {  pass1: '', 
                    pass2: '', 
                    showModal1: false, 
                    showModal2: false, 
                    showModal3: false
                  }
    this.handleInputChange = this.handleInputChange.bind(this)
    this.reg = this.reg.bind(this)
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
         this.setState({showModal3: true})
       }      
  }

  reg(event) {
    if(this.state.pass1.length < 6) {
      // alert('must >6')
      this.setState({showModal2: true})
      return
    } else  {
      if ( this.state.pass1 === this.state.pass2 ){
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(this.state.pass1, salt);
        chrome.storage.local.set({'userPass': hash}, function() {return})
        this.props.history.push('/upload')      
      }else{
        // alert("再次输入的密码不一致")   
        this.setState({showModal1: true})
        return
      }
  }
}

  render() {
    return (
      <div>
        <Row style={{ paddingTop: '60px' }}>
          <Col md={{ span: 4, offset: 4 }}>
            <img src={require('./rui.png')} alt="rui"/>
            <h2>RChain Wallet</h2>     <p></p>
          </Col>
        </Row>
        <div className="Rui_reg">      
          <form>
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
            <Button variant="outline-light" size="lg" onClick={this.reg} ><FormattedMessage id='register' /></Button>
          </form>                 
        </div>

        <Modal size="sm" show = {this.state.showModal1} onHide={()=>this.setState({showModal1: false})}>
          <Modal.Body>
            <FormattedMessage id='inconsistency' />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal1: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal size="sm" show = {this.state.showModal2} onHide={()=>this.setState({showModal2: false})}>
          <Modal.Body>
            <FormattedMessage id='more_than_5' />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal2: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal size="sm" show = {this.state.showModal3} onHide={()=>this.setState({showModal3: false})}>
          <Modal.Body>
            <FormattedMessage id='only_alphanumeric' />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal3: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default withRouter(RegPage)



