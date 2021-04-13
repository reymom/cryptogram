import React from 'react';
import { connect } from 'react-redux';

import * as actions from '../../store/actions';
import classes from './Home.module.css';

import Spinner from '../../components/UI/Spinner/Spinner';
// import CreateArtwork from '../CreateArtwork/CreateArtwork';
import Histories from '../Histories/Histories';
import KanbanArtworks from '../KanbanArtworks/KanbanArtworks';

class Home extends React.Component {

    componentDidMount = async () => {
        if ( !this.props.web3 || !this.props.accounts || !this.props.contract ) {
            await this.props.onGetWeb3Objects();
        }
    }

    render() {
        let historiesNewCreations;
        let kanbanArtworks = <Spinner />;
        if (!this.props.loading && this.props.web3 && this.props.contract) {
            historiesNewCreations = <Histories 
                web3={this.props.web3} 
                contract={this.props.contract}
            />;
        }

        if (!this.props.loading && this.props.web3 && this.props.contract) {
            kanbanArtworks = <KanbanArtworks />;
        }

        return (
            <div className={classes.Home}>
                {/* { historiesNewCreations } */}
                {/* { historiesNewCreations } historiesNewPurchases */}
                { kanbanArtworks }
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        web3: state.web3Objects.web3,
        accounts: state.web3Objects.accounts,
        contract: state.web3Objects.contract,
        loading: state.web3Objects.loading
    };
};

const mapDispatchToProps = dispatch => ({
    onGetWeb3Objects: () => dispatch( actions.getWeb3Objects() ),
});

export default connect( mapStateToProps, mapDispatchToProps )( Home );