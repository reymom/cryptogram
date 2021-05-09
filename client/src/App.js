import React from 'react';
import { BrowserRouter, Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import * as actions from './store/actions/index';
import './App.css';

import Layout from './hoc/Layout/Layout';
import Auth from './containers/Auth/Auth';
import Logout from './containers/Auth/Logout/Logout';
import Home from './containers/Home/Home';
import Profile from './containers/Profile/Profile';
import Settings from './containers/Settings/Settings';
import LoadedArtwork from './containers/LoadedArtwork/LoadedArtwork';

class App extends React.Component {
    componentDidMount() { 
        // AUTHENTICATE, then automatically: get web3, contract, accounts
        this.props.onTryAutoSignup(); 
    }

    componentDidUpdate( prevProps ) {
        console.log('[componentDidUpdate] App.js');
        // ACCOUNT INFO
        if ( 
            this.props.isAuthenticated && !prevProps.contract &&
            this.props.web3mode && this.props.web3 && this.props.contract
        ) {
            let account;
            if (this.props.web3mode === 'browser' && this.props.accountsActive) {
                account = this.props.accountsActive[0];
            } else if (this.props.web3mode === 'custom' && this.props.addressActive) {
                account = this.props.addressActive;
            }

            console.log('this.props.addressActive = ', account);

            if ( account ) {
                this.props.onFetchAddressActiveInfo(
                    this.props.web3,
                    account,
                    this.props.contract.methods
                )
                this.props.onFetchAvailableFunds(
                    account,
                    this.props.web3,
                    this.props.contract.methods
                )
            }
        }
    } 

    render() {
        // console.log('[App.js][render] isAuthenticated = ', this.props.isAuthenticated);

        let routes = (
            <Switch>
                <Redirect from="/" to="/login" exact />
                <Route path="/login" component={Auth} />
                <Route path="/register" component={Auth} />
                <Route path="/home" component={ Home } />
            </Switch>
        );

        if ( this.props.isAuthenticated && this.props.web3 ) {
            routes = (
                <Switch>
                    <Redirect from="/" to="/home" exact />
                    <Redirect from="/login" to="/home" exact />
                    <Redirect from="/register" to="/home" exact />
                    <Route
                        exact
                        path='/artworks/:id'
                        component={ LoadedArtwork } 
                    />
                    <Route
                        exact
                        path='/profile/artworks/:id'
                        component={ LoadedArtwork } 
                    />
                    <Route path="/home" component={Home} />
                    <Route
                        path='/user/:id'
                        component={ Profile } 
                    />
                    <Route exact path="/profile" component={Profile} />
                    <Route exact path="/settings" component={Settings} />
                    <Route path="/logout" component={Logout} />
                </Switch>
            )
        }

        return (
            <BrowserRouter>
                <Layout>
                    <main className="App-main-content">
                        { routes }
                    </main>
                </Layout>
            </BrowserRouter>
        );

    }
}

const mapStateToProps = state => {
    return { 
        isAuthenticated: state.auth.idToken !== null,
        /************/
        /*   WEB3   */
        /************/
        web3mode: state.web3Objects.web3mode, 
        web3: state.web3Objects.web3,
        contract: state.web3Objects.contract,
        accountsActive: state.web3Objects.accounts,
        addressActive: state.web3Objects.address,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        // AUTHENTICATE, then automatically: get web3, contract, accounts
        onTryAutoSignup: ( ) => dispatch( actions.authCheckState() ),
        // THEN ACCOUNT INFO
        onFetchAddressActiveInfo: ( web3, userAddress, methods ) => dispatch(
            actions.fetchAddressInfo(web3, userAddress, methods, true)
        ),
        onFetchAvailableFunds: ( userAddress, web3, methods ) => dispatch(
            actions.fetchAvailableFunds(userAddress, web3, methods)
        )

    };
};

export default withRouter( connect( mapStateToProps, mapDispatchToProps )(App) );