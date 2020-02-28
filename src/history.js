/*global chrome*/

import React from 'react'
import { withRouter } from 'react-router-dom'
import Header from './header'
import {CopyToClipboard} from 'react-copy-to-clipboard';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import CopyIcon from './Icons/Copy.js'
import {FormattedMessage} from 'react-intl'
import Spinner from 'react-bootstrap/Spinner'
import ListGroup from 'react-bootstrap/ListGroup'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import RIcon from './Icons/R.js'



class History extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
                  history: []
                 }
  }

  async componentDidMount() { 

    var trans 
    var newTrans=[]
    // const trans = this.state.history
    // const url = "http://104.197.246.182:40403/api/deploy/"  // mainnet
    // const url = "http://207.180.230.84:40403/api/deploy/"    // my contabo 30G
    const url = "http://35.220.140.14:40403/api/deploy/" 
    await chrome.storage.local.get(['History'], function(result) {
        trans = result.History     
        trans.map((i) => {
      if (i['status'] ==="Pending") {
        fetch(url + i['deployId'], { method:'get' })
        .then((str) => {
              // console.log("str: ",str)
          // if (str.status === 400) {
            str.json().then(temp =>{
               // console.log("This........: ", JSON.stringify(temp).substring(2,11))               
               if (JSON.stringify(temp).substring(2,11) ==="blockHash") {
                  i['status'] = "Confirmed"
                  // console.log("confirmed: ",i)

                }else{ console.log("time stamp: ",  Date.now() - i['time'])
                  if (Date.now() - i['time'] > 24*60*60*1000) {
                    i['status'] = "Failed"  
                    // console.log("Failure: ",i)

                  }
                }
           })
          // }
        })
        .catch(function() {
        })
      }
      newTrans.push(i)        

    })

    })

setTimeout(function(){
             this.setState({history: newTrans},()=>{
        chrome.storage.local.set({'History': this.state.history})
        // console.log("newTrans: ",newTrans)
      }) 
        }.bind(this),1000)

  }  

  render() {

    const add = this.state.history

    const renderTooltip = props => (
      <div
        {...props}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          padding: '2px 10px',
          color: 'white',
          borderRadius: 3,
          ...props.style,
        }}
      >
        <FormattedMessage id='copy' />
      </div>
    )


    return (
      <div >
        <Header />
        <h4>
          <FormattedMessage id='history' />
        </h4>  
      <div style={{ paddingTop: '4px', paddingLeft: '1px', overflowY: 'visible' }}>
          <ListGroup variant="flush" style={{ backgroundColor: '#606163', opacity:0.8 }}>
            { 
              add.slice(0).reverse().map((i) => 
                  <ListGroup.Item  >
                    <Container style={{ paddingTop: '4px', paddingLeft: '1px' }}>
                      <Row style={{ color: '#5e6064', fontSize: '12px', paddingTop: '8px', textAlign: 'left'  }} >
                        <Col>{new Date(i['time']).toLocaleString()}</Col>
                      </Row>
                      <Row>
                        <Col xs={1} ><RIcon width="28px" height="28px" /></Col>
                        <Col style={{ color: '#24272A', fontSize: '18px', paddingTop: '4px', textAlign: 'left'  }}>{i['status']}</Col>
                        <Col>{i['amount']} REV</Col>
                      </Row>
                      <Row>
                        <Col xs={5} style={{ color: '#5e6064', backgroundColor: '#EAFAD7',fontSize: '12px', paddingTop: '8px', textAlign: 'left'  }}>{i['to'].substring(0,10)+"......"}</Col>
                        <Col xs={7} style={{ color: '#5e6064', backgroundColor: '#EAFAD7',fontSize: '12px', paddingTop: '8px', textAlign: 'left'  }}>{"DeployID:" +  i['deployId'].substring(0,10)+"..."}
                         <OverlayTrigger
                            placement="right-start"
                            delay={{ show: 2000, hide: 150 }}
                            overlay={renderTooltip}
                          >
                            <CopyToClipboard text={i['deployId']}
                              onCopy={() => this.setState({copied: true})}>
                              <CopyIcon width="14px" height="14px" cursor="pointer" color='#5e6064'/>
                            </CopyToClipboard>
                          </OverlayTrigger>
                        </Col>
                      </Row>
                    </Container>
                  </ListGroup.Item>

            )}
          </ListGroup>
 
    </div>
    </div>
    )
  }
}

export default withRouter(History)



