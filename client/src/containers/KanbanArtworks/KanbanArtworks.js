import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import * as actions from '../../store/actions';
import classes from './KanbanArtworks.module.css';

import Spinner from '../../components/UI/Spinner/Spinner';
import Artwork from '../../components/Artwork/Artwork';

class KanbanArtworks extends React.Component {

    componentDidMount () {
        if ( this.props.page === 'home' && this.props.contract ) {
            this.props.onFetchArtworks( this.props.contract.methods );
        }
    }

    artworkSelectedHandler = ( id ) => {
        this.props.history.push({ pathname: '/artworks/' + id });
    }

    render () {

        let kanbanArtworks = [<Spinner key={0}/>];
        let artworks;
        if (
            this.props.page === 'home' && !this.props.fetchingArtworks && this.props.homeArtworks
        ) {
            artworks = this.props.homeArtworks;
        } else if (
            this.props.page === 'profile' &&  !this.props.loadingAddress && this.props.profileArtworks
        ) {
            artworks = this.props.profileArtworks;
        }

        if ( artworks ) {
            console.log('homeArtworks = ', this.props.homeArtworks);
            console.log('profileArtworks = ', this.props.profileArtworks);

            kanbanArtworks = artworks.map(artwork => {
                if (this.props.showMode) {
                    if (this.props.showMode === 'creations') {
                        if (artwork.creator !== this.props.userAddress) {
                            return '';
                        }
                    } else if (this.props.showMode === 'purchases') {
                        if (artwork.creator === this.props.userAddress) {
                            return '';
                        }
                    }
                }

                return (
                    <Artwork
                        key={ artwork.id }
                        imageSrc={ 'https://ipfs.io/ipfs/' + artwork.IPFShash }
                        creationDate={ artwork.creationDate }
                        lastPurchaseDate={ artwork.lastPurchaseDate }
                        priceSpent={ artwork.priceSpent }
                        description={ artwork.description }
                        tag={ artwork.tag }
                        initialPrice={ artwork.initialPrice }
                        participationPercentage={ artwork.participationPercentage }
                        totalLikes={ artwork.totalLikes }
                        clicked={() => this.artworkSelectedHandler(artwork.id)} />
                )
            });
        }

        let kanbanReturned;
        if (kanbanArtworks.join('') !== '') {
            kanbanReturned = <div className={classes.KanbanContainer}>
                { kanbanArtworks }
            </div>
        } else {
            kanbanReturned = <div className={classes.EmptyKanban}>
                0 artworks.
            </div>
        }

        return (
            <React.Fragment>
                { kanbanReturned }
            </React.Fragment>
        );
    };
};

const mapStateToProps = state => {
    return {
        // web3 objects
        contract: state.web3Objects.contract,
        // web3 address
        loadingAddress: state.web3Address.loading,
        userAddress: state.web3Address.address,
        profileArtworks: state.web3Address.artworks,
        // artworks from address
        fetchingArtworks: state.artwork.fetchingArtworks,
        homeArtworks: state.artwork.artworks
    };
};

const mapDispatchToProps = dispatch => ({
    onFetchArtworks: ( methods ) => dispatch( 
        actions.fetchArtworks( methods )
    )
});

export default connect( mapStateToProps, mapDispatchToProps )( withRouter(KanbanArtworks) );