import React from 'react'
import { withRouter} from 'react-router-dom'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import DropdownButton from "react-bootstrap/DropdownButton"
import Dropdown from 'react-bootstrap/Dropdown'
import ArrowIcon from './Icons/Arrow.js'
import ImportIcon from './Icons/Import.js'
import KeyIcon from './Icons/Key.js'
import AddressIcon from './Icons/Address.js'
import MenuIcon from './Icons/Menu.js'
import ChatIcon from './Icons/Chat.js'
import {FormattedMessage} from 'react-intl'

class Header extends React.Component {

  constructor(props) {
    super(props)

    this.toTransfer = this.toTransfer.bind(this)
    this.toUpload = this.toUpload.bind(this)
    this.toPass = this.toPass.bind(this)
    this.toAddress = this.toAddress.bind(this)
    this.toAbout = this.toAbout.bind(this)
  }

  toTransfer(event) {
    event.preventDefault();
    this.props.history.push('/transfer')
  }  
  toUpload(event) {
    event.preventDefault();
    this.props.history.push('/upload')
  }
  toPass(event) {
    event.preventDefault();
    this.props.history.push('/pass')
  }    
  toAddress(event) {
    event.preventDefault();
    this.props.history.push('/address')
  }  
  toAbout(event) {
    event.preventDefault();
    this.props.history.push('/about')
  } 

  render() {
    return (
      <div  style={{ padding: '1px', zIndex: 10, position:'relative' }}>
        <Row style={{ backgroundColor: '#606163', opacity:1 }} >
          <Col xs >
            <img src={require('./rui37.png')} style={{ float: 'left' }} alt="rui_logo" />
          </Col>
          <Col xs  >
            <DropdownButton drop='left' variant="secondary" id="dropdown-basic" title={<MenuIcon width="20px" height="20px" />} style={{ float: 'right', paddingTop: '3px' }}>
              <Dropdown.Item onClick={this.toTransfer}><ArrowIcon width="20px" height="20px" />&nbsp;<FormattedMessage id='transfer' /></Dropdown.Item>
              <Dropdown.Item onClick={this.toUpload}><ImportIcon width="20px" height="20px" />&nbsp;<FormattedMessage id='import' /></Dropdown.Item>
              <Dropdown.Item onClick={this.toPass}><KeyIcon width="20px" height="20px" />&nbsp;<FormattedMessage id='change_pass' /></Dropdown.Item>
              <Dropdown.Item onClick={this.toAddress}><AddressIcon width="20px" height="20px" />&nbsp;<FormattedMessage id='address_man' /></Dropdown.Item>
              <Dropdown.Item onClick={this.toAbout}><ChatIcon width="20px" height="20px" />&nbsp;<FormattedMessage id='about' /></Dropdown.Item>
            </DropdownButton>
          </Col>
        </Row>      
      </div>
    )
  }
}

export default withRouter(Header)



