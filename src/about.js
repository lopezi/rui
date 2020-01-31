/*global chrome*/

import React from 'react'
import { withRouter } from 'react-router-dom'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Header from './header'
import {FormattedMessage} from 'react-intl'

class AboutPage extends React.Component {

  constructor(props) {
    super(props)
    this.state = { pass1: '', pass2: '', showModal1: false, showModal2: false, showModal3: false}
    this.handleInputChange = this.handleInputChange.bind(this)
    this.reg = this.reg.bind(this)
  }

  handleInputChange(event) {
     
  }

  reg(event) {

}

  render() {
    return (
      <div>

        <Header />
        <img src={require('./rui37.png')} style={{ marginTop: 25,float: 'center' }} alt="rui_logo" />
        <div   style={{ marginTop: 25, padding: 10, backgroundColor: '#F6F6F8', opacity: 0.8 }} >        
               <p>&nbsp;</p>
               <p> Rui锐 Wallet  </p>
               <p> 版本 Version: 0.9.1  </p>
               <p> 免责声明：  本软件永久开源免费，遵守MIT开源协议。用户自行承担使用风险，开发者不负任何责任。</p>
               <p> Disclaimer：  Rui is under the MIT open source software license. You agree that your use of the software is at your sole risk. The developer shall not be responsible for any damage or loss caused by the use of this software.</p>
               <p> 联系方式 Email：dimworm@tokenjar.io   </p>
               <p></p>
        </div>

      </div>
    )
  }
}

export default withRouter(AboutPage)



