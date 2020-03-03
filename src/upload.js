/*global chrome*/

import React from 'react'
import { withRouter } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Header from './header'
import basicKey from './bk'
import { getAddrFromEth } from './getAddress.js'
import {FormattedMessage} from 'react-intl'

class UploadPage extends React.Component {

  constructor(props) {
    super(props);
    this.state = { 
      pass: '',
      file: null,
      fileContents: '',
      addList: [],
      temp_i: '',
      showModal1: false,   // wrong pass
      showModal2: false,   // import succeeded
      showModal3: false,   // already imported
      showModal4: false    // list is full
    }
    this.handleInputChange = this.handleInputChange.bind(this);
    this.upload = this.upload.bind(this)

  }

  async componentDidMount() {
    const addr =["address1","address2","address3","address4","address5"]
    var tempAdd = []
    for ( const i of addr) {
      await chrome.storage.local.get([i], function(result) {
        // console.log(result.hasOwnProperty(i),i)
        if (result.hasOwnProperty(i) === false) {
          // temp_i= i
          this.setState({temp_i: i})
        }else{
          tempAdd.push(result[i])
        }
      }.bind(this))
    }
    // console.log("tempAdd: ",tempAdd)
    this.setState({addList: tempAdd})
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
    const Wallet = require('ethereumjs-wallet')
    const passworder = require('browser-passworder')
    if ( this.state.addList.length ===5) {
      this.setState({showModal4: true})
      return
    }
    try {
      var temp = Wallet.fromV3(this.state.fileContents, this.state.pass, true)
    }
    catch(err) {
      // alert("密码输入有误，操作失败Password is wrong")
      this.setState({showModal1: true})
      return
    }

    for (const i of this.state.addList) {
      // console.log("temp.get.from.chrome: ", getAddrFromEth(temp.getAddress().toString('hex')))
      if (getAddrFromEth(temp.getAddress().toString('hex')) === i) {
        this.setState({showModal3: true})
        return
      }
    }

    // console.log(temp.getAddress().toString('hex'))
    // const c_addr = temp_i
    const c_addr = this.state.temp_i
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

  // onLoad (event, file) {
  //   this.setState({file: file, fileContents: event.target.result},()=>{console.log(event.target.result)})
  //   console.log("file: ",file)
  //   console.log("fileContents: ",event.target.result)
  // }

  onLoad (event){
    var reader = new FileReader();
    reader.onload = (x) =>{this.setState({fileContents: x.target.result}, () =>{
      // console.log("this.state.fileContents: ", this.state.fileContents) 
    })}
    reader.readAsBinaryString(event.target.files[0])
  }

  render() {
    return (
      <div className="Rui_relative">
        <Header />
        <div className="Rui_upload" > 
          <h4>
            <FormattedMessage id='import' />
          </h4>
         { /* <FileInput
            readAs='binary'
            onLoad= {this.onLoad.bind(this)}
          />    */}
          <input type="file" onChange= {this.onLoad.bind(this)}/>
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

        <Modal size="sm" show = {this.state.showModal3} onHide={()=>this.setState({showModal3: false})}>
          <Modal.Body>
            <FormattedMessage id='already_imported' />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={()=>this.setState({showModal3: false})}>
              <FormattedMessage id='confirm' />
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal size="sm" show = {this.state.showModal4} onHide={()=>this.setState({showModal4: false})}>
          <Modal.Body>
            <FormattedMessage id='list_is_full' />
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

export default withRouter(UploadPage)




