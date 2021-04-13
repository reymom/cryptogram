import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import * as actions from '../../store/actions';
import classes from './KanbanArtworks.module.css';

import Spinner from '../../components/UI/Spinner/Spinner';
import Artwork from '../../components/Artwork/Artwork';

class KanbanArtworks extends React.Component {

    componentDidMount = async () => {
        if (!this.props.balances 
            || !this.props.artworks 
            || this.props.address !== this.props.accounts[0] ) {
            await this.props.onFetchAddressInfo(
                this.props.contract.methods,
                this.props.accounts[0]
            );
        }
    }

    artworkSelectedHandler = ( id ) => {
        this.props.history.push({ pathname: '/artworks/' + id });
    }

    render () {
        let kanbanArtworks = <Spinner />;
        if (!this.props.loadingAddress && this.props.artworks) {
            kanbanArtworks = this.props.artworks.map((artwork, id) => (
                <Artwork
                    key={ id }
                    imageSrc={ 'https://ipfs.io/ipfs/' + artwork.IPFShash }
                    creationDate={ artwork.creationDate }
                    lastPurchaseDate={ artwork.lastPurchaseDate }
                    priceSpent={ artwork.priceSpent }
                    description={ artwork.description }
                    tag={ artwork.tag }
                    initialPrice={ artwork.initialPrice }
                    participationPercentage={ artwork.participationPercentage }
                    totalLikes={ artwork.totalLikes }
                    clicked={() => this.artworkSelectedHandler(id)} />
                )
            );
        }

        return (
            <div className={classes.KanbanContainer}>
                { kanbanArtworks }
            </div>
        );
    };
};

const mapStateToProps = state => {
    return {
        // web3 objects
        web3: state.web3Objects.web3,
        accounts: state.web3Objects.accounts,
        contract: state.web3Objects.contract,
        loadingWeb3: state.web3Objects.loading,
        // address info
        address: state.web3Address.address,
        balances: state.web3Address.balances,
        artworks: state.web3Address.artworks,
        listSupporters: state.web3Address.listSupporters,
        loadingAddress: state.web3Address.loading
    };
};

const mapDispatchToProps = dispatch => ({
    onFetchAddressInfo: ( userAddress, methods ) => dispatch( 
        actions.fetchAddressInfo(userAddress, methods)
    )
});

export default connect( mapStateToProps, mapDispatchToProps )( withRouter(KanbanArtworks) );