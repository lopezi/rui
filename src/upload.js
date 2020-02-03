/*global chrome*/

import React from 'react'
import { withRouter } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Header from './header'
import basicKey from './bk'
import { getAddrFromEth } from './getAddress.js'
import {FormattedMessage} from 'react-intl'

const FileInput = require('react-simple-file-input').default
const Wallet = require('ethereumjs-wallet')
const passworder = require('browser-passworder')
var temp_i = ""

class UploadPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = { 
      pass: '',
      file: null,
      fileContents: '',
      pointer: null,
      showModal1: false,
      showModal2: false
    }
    this.handleInputChange = this.handleInputChange.bind(this);
    this.upload = this.upload.bind(this)
  }

  async componentDidMount() {
    const addr =["address1","address2","address3","address4","address5"]
    for ( const i of addr) {
      await chrome.storage.local.get([i], function(result) {
        // console.log(result.hasOwnProperty(i),i)
        if (result.hasOwnProperty(i) === false) {
          temp_i= i
          return
        }
      })
    }
  }

  handleInputChange(event) {
    const target = event.target
    const value = target.value
    const name = target.name
    this.setState({
      [name]: value
    })
  }

  upload(event) {
    event.preventDefault()
    try {
      var temp = Wallet.fromV3(this.state.fileContents, this.state.pass, true)
    }
    catch(err) {
      // alert("密码输入有误，操作失败Password is wrong")
      this.setState({showModal1: true})
      return
    }
    // console.log(temp.getAddress().toString('hex'))
    const c_addr = temp_i
    passworder.encrypt(basicKey.hash, this.state.fileContents)
    .then(function(blob) {
      chrome.storage.local.set({[ getAddrFromEth(temp.getAddress().toString('hex')) + "_keyfile"]: blob}, function() {})
      passworder.decrypt(basicKey.hash, blob)
    })

    chrome.storage.local.set({[c_addr]: getAddrFromEth(temp.getAddress().toString('hex'))}, function() {})
    // alert("导入成功Import Succeed")
    this.setState({showModal2: true})
    this.props.history.push('/transfer')
  }

  onLoad (event, file) {
    this.setState({file: file, fileContents: event.target.result})
  }

  render() {
    return (
      <div className="Rui_relative">
        <Header />
        <div className="Rui_upload" > 
          <label>
            <FormattedMessage id='import' />
          </label>
          <FileInput
            readAs='binary'
            onLoad= {this.onLoad.bind(this)}
          />    
          <div className="Rui_upload" > 
            <form>
              <label>
                <FormattedMessage id='key_pass' />
              </label>
              <input type="password" name="pass" value={this.state.pass} onChange={this.handleInputChange} className="Rui_input form-control form-control-lg" />
              <p></p>
              <p></p>
            </form>
            <Button variant="outline-light" size="lg" onClick={this.upload}><FormattedMessage id='import' /></Button>
          </div>
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

        <Modal size="sm" show = {this.state.showModal2} onHide={()=>this.setState({showModal2: false})}>
          <Modal.Body>
            <FormattedMessage id='import_success' />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal2: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default withRouter(UploadPage)




