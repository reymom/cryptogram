import React from 'react';
import { connect } from 'react-redux';

import * as actions from '../../store/actions';
import classes from './Home.module.css';

import Spinner from '../../components/UI/Spinner/Spinner';
// import CreateToken from '../CreateToken/CreateToken';
import Histories from '../Histories/Histories';
import KanbanTokens from '../../components/Tokens/KanbanTokens/KanbanTokens';

class Home extends React.Component {

    componentDidMount = async () => {
        if ( !this.props.web3 || !this.props.accounts || !this.props.contract ) {
            await this.props.onGetWeb3Objects();
        }
        await this.props.onFetchAddressInfo(
            this.props.contract.methods,
            '0x8F806E70121E04e94Bda323a8d98440f9eC692Df'
        );
    }

    render() {
        let historiesNewCreations;
        let kanbanTokens = <Spinner />;
        if (this.props.web3 && this.props.contract) {
            historiesNewCreations = <Histories 
                web3={this.props.web3} 
                contract={this.props.contract}
            />;
        }
        if (!this.props.loading && this.props.artworks) {
            kanbanTokens = <KanbanTokens 
                artworks={ this.props.artworks }
            />;
        }

        return (
            <div className={classes.Home}>
                { historiesNewCreations }
                { historiesNewCreations } {/* historiesNewPurchases */}
                { kanbanTokens }
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        web3: state.web3Objects.web3,
        accounts: state.web3Objects.accounts,
        contract: state.web3Objects.contract,
        balances: state.addressInfo.balances,
        artworks: state.addressInfo.artworks,
        listSupporters: state.addressInfo.listSupporters,
        loading: state.addressInfo.loading
    };
};

const mapDispatchToProps = dispatch => ({
    onGetWeb3Objects: () => dispatch( actions.getWeb3Objects() ),
    onFetchAddressInfo: ( userAddress, methods ) => dispatch( 
        actions.fetchAddressInfo(userAddress, methods)
    )
});

export default connect( mapStateToProps, mapDispatchToProps )( Home );