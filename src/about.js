/*global chrome*/

import React from 'react'
import { withRouter } from 'react-router-dom'
import Header from './header'

class AboutPage extends React.Component {
    
  render() {
    return (
      <div>
        <Header />
        <img src={require('./rui37.png')} style={{ marginTop: 25,float: 'center' }} alt="rui_logo" />
        <div style={{ marginTop: 25, padding: 10, backgroundColor: '#F6F6F8', opacity: 0.8 }} >        
               <p> Rui锐 Wallet  </p>
               <p> 版本 Version: 0.9.12  </p>
               <p style={{ fontSize:'12px', textAlign:'left'}}> 免责声明:  本软件永久开源免费，遵守MIT开源协议。用户自行承担使用风险，开发者不负任何责任。</p>
               <p style={{ fontSize:'12px', textAlign:'left'}}> Disclaimer:  Rui is under the MIT open source software license. You agree that your use of the software is at your sole risk. The developer shall not be responsible for any damage or loss caused by the use of this software.</p>
               <p style={{ fontSize:'12px', textAlign:'left'}}> 联系方式 Email: support@wenode.io   </p>
               <p style={{ fontSize:'12px', textAlign:'left'}}> Donation: </p>
               <input style={{ fontSize:'10px'}} type="text" name="donation" value="111125ufY1754aNBRyDUT63hbejWeLmdQHKQqJHf3w8bm1U9CJqjPd" className="form-control form-control-sm" />
               <p></p>
               <p></p>
        </div>
      </div>
    )
  }
}

export default withRouter(AboutPage)



