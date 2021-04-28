import React from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';

import * as actions from '../../store/actions';
import classes from './Layout.module.css';

import Aux from '../Aux/Aux';
import Toolbar from '../../components/Navigation/Toolbar/Toolbar';
// import Footer from '../../components/Navigation/Footer/Footer';
import Notifications from '../../components/Notifications/Notifications';
import emptyProfilePic from '../../assets/persona.png';

class Layout extends React.Component {
    state = { showNotifications: false, showDropdown: false }

    notificationsClickedHandler = () => {
        this.setState( ( prevState ) => {
            if (!prevState.showNotifications) {
                this.props.onGetBalance(
                    this.props.accounts[0],
                    this.props.web3
                );
                this.props.onFetchAvailableFunds(
                    this.props.accounts[0],
                    this.props.web3,
                    this.props.contract.methods
                );
            }
            return { showNotifications: !prevState.showNotifications };
        } );
    }

    closeNotificationsHandler = () => {
        this.setState({ showNotifications: false });
    }

    profileImgClickedHandler = () => {
        this.setState( ( prevState ) => {
            return { showDropdown: !prevState.showDropdown };
        } );
    }

    closeDropdownHandler = () => {
        this.setState({ showDropdown: false });
    }

    claimRewardsHandler = async() => {
        console.log('[claimRewardsHandler]');
        await this.props.onClaimRewards(
            this.props.accounts[0], 
            this.props.contract.methods
        );
        await this.props.onGetBalance(
            this.props.accounts[0],
            this.props.web3
        );
    }

    render () {
        let claimRewardsError;
        if ( this.props.errorGetFunds ) {
            claimRewardsError = <div className={classes.ClaimRewardError}>
                {this.props.errorGetFunds}
            </div>
        }

        let profileImgSrc = emptyProfilePic;
        if (
            !this.props.loadingFirebase && 
            this.props.profileInfo && this.props.profileInfo.imageSrc
        ) {
            profileImgSrc = 'https://ipfs.io/ipfs/' + this.props.profileInfo.imageSrc
        }

        let notificationsSideDrawer;
        if (
            this.props.balances && this.props.availableFunds && 
            this.props.profileInfo && profileImgSrc
        ) {
            notificationsSideDrawer = 
                <Notifications
                    clicked={this.claimRewardsHandler}
                    profileImgSrc={profileImgSrc}
                    profileInfo={this.props.profileInfo}
                    ethBalance={this.props.balances.ethBalance}
                    availableFunds={this.props.availableFunds}
                    open={this.state.showNotifications}
                    closed={this.closeNotificationsHandler}>
                    { claimRewardsError }
                </Notifications>
        }

        let noWeb3InfoBar;
        if ( 
            this.props.isAuthenticated && 
            !this.props.loadingWeb3 && !this.props.errorWeb3 && this.props.web3 &&
            (
                !this.props.loadingAccounts && 
                (
                    (!this.props.accounts || this.props.errorAccounts) || 
                    (this.props.accounts.length === 0)
                )
            )
        ) {
            noWeb3InfoBar = 
                <div className={ classes.NoWeb3InfoBarContainer }>
                    No ethereum address configured, &nbsp;
                    <NavLink to="/settings">
                        please create or select one to fully enjoy the app.
                    </NavLink>
                </div>
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
        // firebase
        loadingFirebase: state.firebaseProfile.loading,
        profileInfo: state.firebaseProfile.profileInfo,
        // Web3Objects
        // inject web3 and contract
        web3: state.web3Objects.web3,
        contract: state.web3Objects.contract,
        loadingWeb3: state.web3Objects.loadingWeb3,
        errorWeb3: state.web3Objects.errorWeb3,
        // get accounts
        accounts: state.web3Objects.accounts,
        loadingAccounts: state.web3Objects.loadingAccounts,
        errorAccounts: state.web3Objects.errorAccounts,
        // balances
        balances: state.web3Address.balances,
        availableFunds: state.web3Address.availableFunds,
        // get funds
        processingGetFunds: state.web3Address.processingGetFunds,
        errorGetFunds: state.web3Address.errorGetFunds
    };
};

const mapDispatchToProps = dispatch => ({
    onFetchAvailableFunds: ( userAddress, web3, methods ) => dispatch( 
        actions.fetchAvailableFunds( userAddress, web3, methods )
    ),
    onGetBalance: ( userAddress, web3 ) => dispatch(
        actions.getBalance( userAddress, web3 )
    ),
    onClaimRewards: ( userAddress, methods ) => dispatch(
        actions.claimRewards( userAddress, methods )
    )
});

export default connect( mapStateToProps, mapDispatchToProps )( Layout );