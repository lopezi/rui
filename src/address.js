/*global chrome*/

import React from 'react'
import { withRouter } from 'react-router-dom'
import Button from 'react-bootstrap/Button'
import ListGroup from 'react-bootstrap/ListGroup'
import Header from './header'
import ArrowIcon from './Icons/Arrow.js'
import ImportIcon from './Icons/Import.js'
import {FormattedMessage} from 'react-intl'

const add_5 = ["address1","address2","address3","address4","address5"]

class Address extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
                  "address1": null,
                  "address2": null, 
                  "address3": null,
                  "address4": null, 
                  "address5": null                                                    
                 } 
    this.remove = this.remove.bind(this)
    this.toUpload = this.toUpload.bind(this)
  }



  async componentDidMount() {
    add_5.map( i => {
      return chrome.storage.local.get([i], function(result) {
        if (result.hasOwnProperty(i) === true) {
          var tempC= result[i].substring(0,8) +"........"+ result[i].substring(result[i].length-7,result[i].length+1)
          this.setState({[i]: {v:result[i], s:tempC}},()=>{})
        }
      }.bind(this))
    })
  }

  async remove(address) {
    chrome.storage.local.get([address], function(result) {
      chrome.storage.local.remove([result[address] + "_keyfile"], function() {}) 
    })  
    chrome.storage.local.remove([address], function() {}) 
    this.setState({[address]: null })
  }  

  toUpload(event) {
    event.preventDefault()
    this.props.history.push('/upload')
  }

  render() {
    return (  
      <div >
        <Header />
        <div className="Rui_address_page" >    
          <h4>
            <FormattedMessage id='addr_list' />
          </h4>  
          <ListGroup variant="flush" style={{ backgroundColor: '#606163', opacity:0.8 }}>
            { 
              add_5.map((addr) => 
                this.state[addr] !== null ? 
                  <ListGroup.Item  >
                    <ArrowIcon width="20px" height="20px" />
                    { this.state[addr].s  }
                    <Button variant="outline-light" size="sm" onClick={() =>this.remove(addr)}><FormattedMessage id='delete' /></Button>
                  </ListGroup.Item>
                : <ListGroup.Item>
                    <ImportIcon width="20px" height="20px" /><FormattedMessage id='null_addr' />    
                    <Button variant="outline-light" size="sm" onClick={this.toUpload}><FormattedMessage id='import' /></Button>
                  </ListGroup.Item>
            )}
          </ListGroup>
        </div>
      </div>
    )
  }
}

export default withRouter(Address)



