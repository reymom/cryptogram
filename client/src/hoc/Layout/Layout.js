import React from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';

import * as actions from '../../store/actions';
import classes from './Layout.module.css';

import Aux from '../Aux/Aux';
import Toolbar from '../../components/Navigation/Toolbar/Toolbar';
// import Footer from '../../components/Navigation/Footer/Footer';
import Button from '../../components/UI/Button/Button';
import Modal from '../../components/UI/Modal/Modal';
import Notifications from '../../components/Notifications/Notifications';
import emptyProfilePic from '../../assets/persona.png';

class Layout extends React.Component {
    state = { 
        showNotifications: false, 
        showDropdown: false,
        showGasFeeModal: false,
        gasFee: {
            elementType: 'select',
            elementConfig: { 
                type: 'select',
                options: [
                    { value: 'fastest', displayValue: 'Fastest' },
                    { value: 'fast', displayValue: 'Fast' },
                    { value: 'safeLow', displayValue: 'Cheapest' }
                ]
            },
            value: 'fast',
        },
    }

    notificationsClickedHandler = () => {
        console.log('[notificationsClickedHandler]');
        this.setState( ( prevState ) => {
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
        console.log('[closeNotificationsHandler]');
        this.setState({ showNotifications: false });
    }

    profileImgClickedHandler = () => {
        this.setState( ( prevState ) => {
            return { showDropdown: !prevState.showDropdown };
        } );
    }

    closeDropdownHandler = () => { this.setState({ showDropdown: false }); }

    claimRewardsClicked = () => {
        if ( this.props.web3mode === 'custom' ) {
            this.setState({ showGasFeeModal: true });
        } else if ( this.props.web3mode === 'browser' ) {
            this.claimRewardsHandler();
        }
    }

    claimRewardsHandler = async() => {
        console.log('[claimRewardsHandler]');

        let gas = 21000; // before 6721975
        let gasPrice = this.props.gasStation.fast.gasPrice; // before 10000000000
        let gasLimit = 865000;
        if ( this.props.web3mode === 'custom' ) {
            if ( this.state.gasFee.value === 'fastest' ) {
                // gas = 6721975;
                gasPrice = this.props.gasStation.fastest.gasPrice;
            } else if ( this.state.gasFee.value === 'safeLow') {
                // gas = 6721975;
                gasPrice = this.props.gasStation.safeLow.gasPrice;
            }
        }

        await this.props.onClaimRewards(
            this.props.activeAddress, 
            this.props.contract, 
            this.props.web3mode === 'custom', 
            this.props.web3,
            this.props.wallet, 
            gas, gasPrice, gasLimit 
        );
        await this.props.onGetBalance(
            this.props.activeAddress,
            this.props.web3
        );
    }

    render () {
        let claimRewardsError;
        if ( this.props.errorClaimFunds ) {
            claimRewardsError = <div className={classes.ClaimRewardError}>
                {this.props.errorClaimFunds}
            </div>
        }

        let profileImgSrc = emptyProfilePic;
        if (
            !this.props.fetchingActiveUser && this.props.activeUserInfo &&
            this.props.activeUserInfo.public && this.props.activeUserInfo.public.imageSrc
        ) {
            profileImgSrc = 'https://ipfs.io/ipfs/' + this.props.activeUserInfo.public.imageSrc
        }

        let notificationsSideDrawer;
        if (
            this.props.balancesActive && this.props.availableFunds && profileImgSrc &&
            this.props.activeUserInfo &&  this.props.activeUserInfo.public
        ) {
            notificationsSideDrawer = 
                <Notifications
                    clicked={ this.claimRewardsClicked }
                    profileImgSrc={ profileImgSrc }
                    profileInfo={ this.props.activeUserInfo.public }
                    ethBalance={ this.props.balancesActive.ethBalance }
                    availableFunds={ this.props.availableFunds }
                    open={ this.state.showNotifications }
                    closed={ this.closeNotificationsHandler }>
                        { claimRewardsError }
                </Notifications>
        }

        let noWeb3InfoBar;
        if ( 
            this.props.isAuthenticated && !this.props.loadingWeb3 
            && !this.props.errorWeb3 && this.props.web3 &&
            !this.props.activeAddress
        ) {
            noWeb3InfoBar = 
                <div className={ classes.NoWeb3InfoBarContainer }>
                    No ethereum address configured, &nbsp;
                    <NavLink to="/settings">
                        please create or select one to fully enjoy the app.
                    </NavLink>
                </div>
        }

        let gasFeeModal;
        if ( this.state.showGasFeeModal ) {
            let formElement = this.state.gasFee;
            gasFeeModal = 
                <Modal 
                    show={ this.state.showGasFeeModal }
                    modalClosed={this.hideGasFeeModal}>
                        <h1 style={{textAlign:"center"}}>Gas price</h1>
                        <div>
                            <div className={classes.GasFeeModalOptions}>
                                {formElement.elementConfig.options.map(option => (
                                    <div 
                                        key={option.value} 
                                        value={option.value}
                                        className={
                                            [
                                                classes.GasFeeOption,
                                                formElement.value === option.value ?
                                                classes.GasFeeOptionActive : ''
                                            ].join(" ")
                                        }
                                        onClick={ () => this.inputChangedHandler( option.value ) }
                                    >
                                        <h1>{ option.displayValue }</h1>
                                        <div className={classes.OptionDetails}>
                                            <p>
                                                {
                                                    parseInt(this.props.gasStation[option.value].gasPrice) / 1000000000 
                                                } Gwei
                                            </p>
                                            <p>{ this.props.gasStation[option.value].time } seconds on average</p>
                                        </div>   
                                    </div>
                                ))}
                            </div>

                            <div className={classes.CenterButtons}>
                                <Button 
                                    btnType="Success"
                                    clicked={
                                        this.state.supporting ? 
                                        this.supportArtworkHandler : 
                                        (this.state.purchasing && this.buyArtworkHandler)
                                    }
                                >
                                    ACCEPT
                                </Button>
                                <Button 
                                    type="button" 
                                    btnType="Danger" 
                                    clicked={this.hideGasFeeModal}>
                                        CANCEL
                                </Button>
                            </div>
                        </div>
                </Modal>
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
                { gasFeeModal }
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
        gasStation: state.firebaseProfile.gasStation,
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
        balancesActive: state.web3Address.balancesActive,
        // artworksActive: state.web3Address.artworksActive,
        fetchingInfoActive: state.web3Address.fetchingInfoActive,
        // FUNDS
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