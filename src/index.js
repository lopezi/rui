/*global chrome*/

import ReactDom from "react-dom"
import React, { Component } from 'react';
import { BrowserRouter, Switch, Route, Redirect} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import Container from "react-bootstrap/Container"
import "./app.css";
import LoginPage from './login'
import RegPage from './register'
import UploadPage from './upload'
import Transfer from './transfer'
import PassPage from './pass'
import AddressPage from './address'
import AboutPage from './about'
import Auth from './auth'
import {IntlProvider} from "react-intl"
import CN from './lang/CN'
import EN from './lang/EN'  

const ProtectedRoute = ({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    Auth.authenticated ===true
      ? <Component {...props} />
      : <Redirect to='/login' />
  )} />
)

var did =false


const chooseLocale = () => {
    switch(navigator.language.split('_')[0]){
        case 'en':
            return EN
        case 'zh':
            return CN
        default:
            return EN
    }
}

class App extends Component {

  async componentDidMount() {
    await chrome.storage.local.get(['userPass'], function(result) {
      if(result.userPass.length >0){
        did = true
      }
		}) 
  }


  render(){
    return(
      <Container >
        <Switch>
          <Route  path="/login" render={(props) => <LoginPage {...props} isReged={did} /> } />
          <Route  path="/register" component={ RegPage } />           
          <ProtectedRoute  path="/upload" component={ UploadPage } />
          <ProtectedRoute  path="/transfer" component={ Transfer } />
          <ProtectedRoute  path="/pass" component={ PassPage } />
          <ProtectedRoute  path="/address" component={ AddressPage } />          
          <ProtectedRoute  path="/about" component={ AboutPage } />    
          <Redirect  to="/login" />
        </Switch>
      </Container >   
    )
  }
}
ReactDom.render(<BrowserRouter><IntlProvider locale={navigator.language} messages={chooseLocale()}><App /></IntlProvider></BrowserRouter> , document.getElementById("root"))
// ReactDom.render(<BrowserRouter><IntlProvider locale='en' messages={CN}><App /></IntlProvider></BrowserRouter> , document.getElementById("root"))



