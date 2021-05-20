import React from 'react';
import { connect } from 'react-redux';
// import { NavLink } from 'react-router-dom';

import * as actions from '../../store/actions';
import classes from './Layout.module.css';
import emptyProfilePic from '../../assets/persona.png';

import Aux from '../Aux/Aux';
import Toolbar from '../../components/Navigation/Toolbar/Toolbar';
// import Footer from '../../components/Navigation/Footer/Footer';
import GasFeeModal from '../GasFeeModal/GasFeeModal';
import Notifications from '../../components/Notifications/Notifications';

class Layout extends React.Component {
    state = { 
        showNotifications: false, 
        showDropdown: false,
        showGasFeeModal: false
    }

    closeDropdownHandler = () => { this.setState({ showDropdown: false }); }

    notificationsClickedHandler = () => {
        // console.log('[notificationsClickedHandler]');
        this.setState( ( prevState ) => {
            // console.log('prevState.showNotifications = ', prevState.showNotifications);
            if (!prevState.showNotifications) {
                this.props.onGetBalance(
                    this.props.activeAddress,
                    this.props.web3
                );
                this.props.onFetchAvailableFunds(
                    this.props.activeAddress,
                    this.props.web3,
                    this.props.contract.methods
                );
            }
            return { showNotifications: !prevState.showNotifications };
        } );
    }

    closeNotificationsHandler = () => { 
        // console.log('[closeNotificationsHandler]');
        this.setState({ showNotifications: false });
    }

    profileImgClickedHandler = () => {
        this.setState( ( prevState ) => {
            return { showDropdown: !prevState.showDropdown };
        } );
    }

    hideGasFeeModal = () => {
        this.setState({ showGasFeeModal: false });
    }

    claimRewardsClicked = () => {
        if ( this.props.availableFunds !== 0 ) {
            if ( this.props.web3mode === 'custom' ) {
                this.setState({ showGasFeeModal: true });
            } else if ( this.props.web3mode === 'browser' ) {
                this.claimRewardsHandler( null );
            }
        }
    }

    claimRewardsHandler = ( gasValue ) => {
        let gas = 21000; // before 6721975
        let gasPrice = this.props.ethereumInfo.gasStation.fast.gasPrice; // before 10000000000
        let gasLimit = 865000;
        if ( this.props.web3mode === 'custom' ) {
            if ( gasValue === 'fastest' ) {
                // gas = 6721975;
                gasPrice = this.props.ethereumInfo.gasStation.fastest.gasPrice;
            } else if ( gasValue === 'safeLow') {
                // gas = 6721975;
                gasPrice = this.props.ethereumInfo.gasStation.safeLow.gasPrice;
            }
        }

        this.props.onClaimRewards(
            this.props.activeAddress, 
            this.props.contract, 
            this.props.web3mode === 'custom', 
            this.props.web3,
            this.props.wallet, 
            gas, gasPrice, gasLimit 
        );

        this.hideGasFeeModal();
    }

    render () {
        // NO WEB3 INFORMATION BAR
        let noWeb3InfoBar;
        if ( 
            this.props.isAuthenticated && !this.props.loadingWeb3 
            && !this.props.errorWeb3 && this.props.web3 && !this.props.activeAddress
        ) {
            noWeb3InfoBar = 
                <div className={ classes.NoWeb3InfoBarContainer }>
                    No ethereum address configured, &nbsp;
                    {/* <NavLink to="/settings">
                        please create or select one to fully enjoy the app.
                    </NavLink> */}
                </div>
        }

        // ACCESS PROFILE
        let profileImgSrc = emptyProfilePic;
        if (
            !this.props.fetchingActiveUser && this.props.activeUserInfo &&
            this.props.activeUserInfo.public && this.props.activeUserInfo.public.imageSrc
        ) {
            profileImgSrc = 'https://ipfs.io/ipfs/' + this.props.activeUserInfo.public.imageSrc
        }

        // ACCESS NOTIFICATIONS
        let notificationsSideDrawer;
        if (
            this.props.balancesActive && this.props.availableFunds && profileImgSrc &&
            this.props.activeUserInfo &&  this.props.activeUserInfo.public
        ) {
            notificationsSideDrawer = 
                <Notifications
                    isManager={ this.props.isManager }
                    lockedFunds={ this.props.lockedFunds }
                    claimRewardsClicked={ this.claimRewardsClicked }
                    profileImgSrc={ profileImgSrc }
                    profileInfo={ this.props.activeUserInfo.public }
                    ethBalance={ this.props.balancesActive.ethBalance }
                    availableFunds={ this.props.availableFunds }
                    claimingFunds={this.props.claimingFunds}
                    errorClaimFunds={this.props.errorClaimFunds}
                    open={ this.state.showNotifications }
                    closed={ this.closeNotificationsHandler }>
                        {/* <div>
                            { this.props.activeAddressPurchase.offers.map(offer => (
                                <div>
                                    { offer.address }
                                    { offer.price }
                                </div>
                            )) }
                        </div> */}
                </Notifications>
        }

        return (
            <Aux>
                <Toolbar 
                    isAuthenticated={this.props.isAuthenticated}
                    notificationsClicked={this.notificationsClickedHandler}
                    profileImgSrc={profileImgSrc}
                    profileImgClicked={this.profileImgClickedHandler}
                    showDropdown={this.state.showDropdown}
                    closeDropdown={this.closeDropdownHandler}
                    navClicked={this.closeDropdownHandler}
                />
                { notificationsSideDrawer }
                { noWeb3InfoBar }
                { 
                    ( 
                        this.props.ethereumInfo && this.props.ethereumInfo.gasStation && this.state.showGasFeeModal 
                    ) ? 
                        <GasFeeModal 
                            submitClicked={ 
                                ( gasValue ) => { this.claimRewardsHandler( gasValue ) }
                            }
                            cancelClicked={ this.hideGasFeeModal }
                            showGasFeeModal={ this.state.showGasFeeModal }
                        /> 
                    : ''
                }
                <main className={ classes.Content }>
                    { this.props.children }
                </main>
                {/* <Footer /> */}
            </Aux>
        );
    }
}

const mapStateToProps = state => {
    return {
        isAuthenticated: state.auth.idToken !== null,
        /* -----------------
          FIREBASE PROFILE
        ----------------- */
        ethereumInfo: state.firebaseProfile.ethereumInfo,
        // FETCH ACTIVE USER
        activeUser: state.firebaseProfile.activeUser,
        activeUserInfo: state.firebaseProfile.activeUserInfo,
        fetchingActiveUser: state.firebaseProfile.fetchingActiveUser,
        errorFetchingActiveUser: state.firebaseProfile.errorFetchingActiveUser,

        /* -------------
          WEB3 OBJECTS
        ------------- */
        web3mode: state.web3Objects.web3mode,
        // WEB3 AND CONTRACT INJECTION
        web3: state.web3Objects.web3,
        loadingWeb3: state.web3Objects.loadingWeb3,
        errorWeb3: state.web3Objects.errorWeb3,
        contract: state.web3Objects.contract,
        loadingContract: state.web3Objects.loadingContract,
        errorContract: state.web3Objects.errorContract,
        // WALLET
        wallet: state.web3Objects.wallet,

        /* -------------
          WEB3 ADDRESS
        ------------- */
        // ACTIVE USER INFO
        activeAddress: state.web3Address.addressActive,
        isManager: state.web3Address.isManager,
        balancesActive: state.web3Address.balancesActive,
        // artworksActive: state.web3Address.artworksActive,
        fetchingInfoActive: state.web3Address.fetchingInfoActive,
        // FUNDS
        lockedFunds: state.web3Address.lockedFunds,
        availableFunds: state.web3Address.availableFunds,
        claimingFunds: state.web3Address.claimingFunds,
        errorClaimFunds: state.web3Address.errorClaimFunds
    };
};

const mapDispatchToProps = dispatch => ({
    onFetchAvailableFunds: ( userAddress, web3, methods ) => dispatch( 
        actions.fetchAvailableFunds( userAddress, web3, methods )
    ),
    onGetBalance: ( userAddress, web3 ) => dispatch(
        actions.getBalance( userAddress, web3 )
    ),
    onClaimRewards: ( 
        userAddress, contract, web3IsManual, web3, wallet, gas, gasPrice, gasLimit 
    ) => dispatch(
        actions.claimRewards( 
            userAddress, contract, web3IsManual, web3, wallet, gas, gasPrice, gasLimit 
        )
    )
});

export default connect( mapStateToProps, mapDispatchToProps )( Layout );