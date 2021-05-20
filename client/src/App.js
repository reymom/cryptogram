import React, { Suspense } from 'react';
import { BrowserRouter, Redirect, Route, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

import * as actions from './store/actions/index';
import './App.css';

import Layout from './hoc/Layout/Layout';
import Button from './components/UI/Button/Button';
import Modal from './components/UI/Modal/Modal';
import Spinner from './components/UI/Spinner/Spinner';

// Load these components lazily for optimization
const Auth = React.lazy(() => import('./containers/Auth/Auth'));
const Logout = React.lazy(() => import('./containers/Auth/Logout/Logout'));
const Home = React.lazy(() => import('./containers/Home/Home'));
const Profile = React.lazy(() => import('./containers/Profile/Profile'));
const LoadedArtwork = React.lazy(() => import('./containers/LoadedArtwork/LoadedArtwork'));

class App extends React.Component {
    state = { showAccountChangedModal: false }

    componentDidMount() { 
        // AUTHENTICATE, then automatically: get web3, contract, accounts
        this.props.onTryAutoSignup(); 
    }

    componentDidUpdate( prevProps ) {
        // console.log('[componentDidUpdate] App.js');
        // ACCOUNT INFO
        if ( 
            (
                this.props.isAuthenticated && !prevProps.contract &&
                this.props.web3mode && this.props.web3 && this.props.contract
            )
            ||
            (
                this.props.isAuthenticated && this.props.web3 && this.props.contract &&
                this.props.web3mode === 'browser' && 
                !prevProps.accountsActive && this.props.accountsActive
            )
        ) {
            // console.log('[componentDidUpdate] inside if')
            let account;
            if (this.props.web3mode === 'browser' && this.props.accountsActive) {
                // console.log('[componentDidUpdate] inside custom, accountsActive = ', this.props.accountsActive)
                account = this.props.accountsActive[0];
            } else if (this.props.web3mode === 'custom' && this.props.addressActive) {
                account = this.props.addressActive;
            }

            // console.log('[componentDidUpdate], this.props.addressActive = ', account);

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

        if (prevProps.web3mode && this.props.web3mode && this.props.web3mode === 'browser') {
            window.ethereum.on(
                'accountsChanged', 
                async () => {
                    console.log("on(accountsChanged)");
                    this.metamaskAccountChangedHandler();
                }
            );
        }
    }

    metamaskAccountChangedHandler = async() => {
        // let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if ( window.ethereum.isConnected() && this.props.web3 ){

            let accounts = await this.props.web3.eth.getAccounts();
            if ( !this.props.activeUser ) {
                this.setState({ 
                    showAccountChangedModal: true, 
                    newAccount: accounts[0]
                });
            } else if ( this.props.accountsActive[0].toLowerCase() !== accounts[0].toLowerCase() ) {
                if ( this.props.activeUser.userAddress.toLowerCase() === accounts[0].toLowerCase() ) {
                    this.props.onGetAccountsFromBrowser( 
                        false, accounts[0], false, null, null
                    );
                } else if ( this.props.accountsActive[0].toLowerCase() !== accounts[0].toLowerCase() ) {
                    this.setState({ showAccountChangedModal: true, newAccount: accounts[0] });
                }
            }

        }
    }

    accountChangedSubmit = () => {
        this.props.onGetAccountsFromBrowser(
            false, this.state.newAccount, true, this.props.userId, this.props.idToken
        );
        this.hideAccountChangedModal();
    }

    hideAccountChangedModal = () => {
        this.setState({ showAccountChangedModal: false });
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
                    {/* <Route exact path="/settings" component={Settings} /> */}
                    <Route path="/logout" component={Logout} />
                </Switch>
            );
        }

        let changeMetamaskAccountModal;
        if ( this.props.activeUser && this.state.showAccountChangedModal ) {
            let currentAccount = this.props.activeUser.userAddress
            changeMetamaskAccountModal = 
                <Modal
                    show={this.state.showAccountChangedModal}
                    modalClosed={this.hideAccountChangedModal}
                >
                    <h2 style={ {textAlign:"center"} }>Account changed</h2>
                    <p>Your registered account is:  + { currentAccount }</p>
                    <p>But you switched to: { this.state.newAccount }</p>
                    <p>
                        Do you want to change the register and set this
                        account as your default one?
                    </p>
                    <div style={ {textAlign:"center"} }>
                        <Button 
                            btnType="Success"
                            clicked={ () => this.accountChangedSubmit() }
                        >
                            ACCEPT
                        </Button>
                        <Button 
                            type="button" 
                            btnType="Danger" 
                            clicked={ this.hideAccountChangedModal }>
                                CANCEL
                        </Button>
                    </div>
                </Modal>
        }

        return (
            <BrowserRouter>
                <Layout>
                    <main className="App-main-content">
                        <Suspense fallback={<div style={{margin:"auto"}}><Spinner/></div>}>
                            { routes }
                        </Suspense>
                        { changeMetamaskAccountModal }
                    </main>
                </Layout>
            </BrowserRouter>
        );
    }
}

const mapStateToProps = state => {
    return { 
        isAuthenticated: state.auth.idToken !== null,
        activeUser: state.firebaseProfile.activeUser,
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
        ),
        onGetAccountsFromBrowser: () => dispatch(actions.getAccountsFromBrowser())
    };
};

export default withRouter( connect( mapStateToProps, mapDispatchToProps )(App) );