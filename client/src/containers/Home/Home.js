import React from 'react';
import { connect } from 'react-redux';

import classes from './Home.module.css';

import Histories from '../Histories/Histories';
import KanbanArtworks from '../KanbanArtworks/KanbanArtworks';

class Home extends React.Component {

    render() {
        let histories;
        let kanbanArtworks;
        if (
            !this.props.loadingWeb3 && !this.props.loadingContract &&
            !this.props.fetchingActiveUser && this.props.activeUserInfo
        ) {
            histories = <Histories />;
        }

        if (!this.props.loadingWeb3 && this.props.web3 && this.props.contract) {
            kanbanArtworks = <KanbanArtworks page='home' />;
        }

        return (
            <React.Fragment>
                { histories }
                <div className={classes.KanbanContainer}>
                    { kanbanArtworks }
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    return {
        // auth info
        userId: state.auth.userId,
        idToken: state.auth.idToken,
        // firebase
        activeUser: state.firebaseProfile.activeUser,
        activeUserInfo: state.firebaseProfile.activeUserInfo,
        fetchingActiveUser: state.firebaseProfile.fetchingActiveUser,
        errorFetchingActiveUser: state.firebaseProfile.errorFetchingActiveUser,
        // web3 injection, contract and accounts ( web3Objects )
        web3: state.web3Objects.web3,
        loadingWeb3: state.web3Objects.loadingWeb3,
        errorWeb3: state.web3Objects.errorWeb3,
        contract: state.web3Objects.contract,
        loadingContract: state.web3Objects.loadingContract,
        errorContract: state.web3Objects.errorContract,
        // accounts browser
        accounts: state.web3Objects.accounts,
        loadingAccounts: state.web3Objects.loadingAccounts,
        errorAccounts: state.web3Objects.errorAccounts,
        // accounts custom
        seeds: state.web3Objects.seeds,
        wallet: state.web3Objects.wallet,
        address: state.web3Objects.address,
        gettingAddress: state.web3Objects.gettingAddress,
        errorAddress: state.web3Objects.errorAddress
    };
};

export default connect( mapStateToProps, null )( Home );