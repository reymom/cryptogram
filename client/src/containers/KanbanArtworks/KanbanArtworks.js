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
            this.props.page === 'activeProfile' && this.props.artworksProfileActive
        ) {
            artworks = this.props.artworksProfileActive;
        } else if (
            this.props.page === 'profile' && this.props.artworksProfile
        ) {
            artworks = this.props.artworksProfile;
        }

        if ( artworks ) {

            kanbanArtworks = artworks.map(artwork => {
                if ( this.props.showMode ) {
                    let ownerAddress = this.props.activeAddress;
                    if ( this.props.page === 'profile' ) {
                        ownerAddress = this.props.externalAddress;
                    }

                    if (this.props.showMode === 'creations') {
                        if (artwork.creator.toUpperCase() !== ownerAddress.toUpperCase()) {
                            return '';
                        }
                    } else if (this.props.showMode === 'purchases') {
                        if (artwork.creator.toUpperCase() === ownerAddress.toUpperCase()) {
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
                        // initialPrice={ this.props.web3.utils.fromWei(artwork.initialPrice) }
                        currentPrice={ this.props.web3.utils.fromWei(artwork.currentPrice) }
                        ethereumToEuro={ this.props.ethereumInfo.conversion.euro }
                        // ethereumToDolar={ this.props.ethereumInfo.conversion.dolar }
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
        /* -----------------
          FIREBASE PROFILE
        ----------------- */
        ethereumInfo: state.firebaseProfile.ethereumInfo,
        /* -------------
          WEB3 OBJECTS
        ------------- */
        web3: state.web3Objects.web3,
        contract: state.web3Objects.contract,
        /* -------------
          WEB3 ADDRESS
        ------------- */
        // ACTIVE USER INFO
        activeAddress: state.web3Address.addressActive,
        artworksProfileActive: state.web3Address.artworksActive,
        // EXTERNAL USER INFO
        externalAddress: state.web3Address.address,
        artworksProfile: state.web3Address.artworks,

        /* ----------------
          ARTWORKS GENERAL
        ------------------ */
        homeArtworks: state.artwork.artworks,
        fetchingArtworks: state.artwork.fetchingArtworks
    };
};

const mapDispatchToProps = dispatch => ({
    onFetchArtworks: ( methods ) => dispatch( actions.fetchArtworks( methods ) )
});

export default connect( mapStateToProps, mapDispatchToProps )( withRouter(KanbanArtworks) );