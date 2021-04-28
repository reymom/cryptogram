import React from 'react';
import { connect } from 'react-redux';

import * as actions from '../../store/actions';
import classes from './Home.module.css';

import Histories from '../Histories/Histories';
import KanbanArtworks from '../KanbanArtworks/KanbanArtworks';

class Home extends React.Component {

    componentDidMount = async () => {
        // web3Objects
        if ( !this.props.loadingWeb3 && (!this.props.web3 || !this.props.contract) ) {
            await this.props.onGetWeb3Objects();
        }
        if (this.props.web3 && !this.props.loadingAccounts && !this.props.accounts) {
            await this.props.onGetWeb3Accounts( this.props.web3 );
        }

        // firebase
        if ( 
            (!this.props.loadingFirebase && !this.props.profileInfo) 
            &&
            (this.props.userId && this.props.idToken)
        ) {
            await this.props.onFetchProfile(this.props.userId, this.props.idToken);
        }
    }

    render() {
        let histories;
        let kanbanArtworks;
        if (
            !this.props.loadingWeb3 && !this.props.loadingFirebase && 
            this.props.web3 && this.props.contract && this.props.profileInfo
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
        // auth info
        userId: state.auth.userId,
        idToken: state.auth.idToken,
        // firebase
        loadingFirebase: state.firebaseProfile.loading,
        profileInfo: state.firebaseProfile.profileInfo
    };
};

const mapDispatchToProps = dispatch => ({
    onGetWeb3Objects: () => dispatch( actions.getWeb3Objects() ),
    onGetWeb3Accounts: ( web3 ) => dispatch( actions.getWeb3Accounts( web3 ) ),
    onFetchProfile: ( userAddress, idToken ) => dispatch(
        actions.fetchProfile(userAddress, idToken)
    )
});

export default connect( mapStateToProps, mapDispatchToProps )( Home );