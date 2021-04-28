import React from 'react';
import { connect } from 'react-redux';

import * as actions from '../../store/actions';
import classes from './Histories.module.css';

import Spinner from '../../components/UI/Spinner/Spinner';
import Modal from '../../components/UI/Modal/Modal';
import LoadedHistory from '../../components/LoadedHistory/LoadedHistory';

class Histories extends React.Component {
    state = {
        visitingArtworks: false,
        
        currentCreation: null,
        currentPurchase: null
    };

    componentDidMount = async () => {
        if ( 
            this.props.contract && !this.props.loadingFirebase && 
            this.props.profileInfo && 
            this.props.profileInfo.following && this.props.profileInfo.following.length > 0
        ) {
            await this.props.onFetchEvents(
                this.props.contract, 
                this.props.profileInfo.following
            );
        }
    };

    componentWillUnmount() {
        clearInterval(this.artworkInterval);
    }

    orderByVisited = ( dictionary ) => {
        dictionary.sort(function(x, y) {
            return (x.visited === y.visited)? 0 : x.visited ? 1 : -1;
        })
        return dictionary;
    }

    hideModal = () => {
        clearInterval(this.artworkInterval);
        this.setState({ 
            visitingArtworks: false,
            currentCreation: null,
            currentPurchase: null
        });
    }

    changeVisitingArtwork = () => {
        let eventType;
        let listArtworks;
        let currentArtwork;
        if (this.state.currentCreation) {
            eventType = 'Creation';
            currentArtwork = this.state.currentCreation;
            listArtworks = this.props.newCreations;
        } else if (this.state.currentPurchase) {
            eventType = 'Purchase';
            currentArtwork = this.state.currentPurchase;
            listArtworks = this.state.newPurchases;
        }

        if (currentArtwork.index === listArtworks.length - 1) {
            clearInterval(this.artworkInterval);
            this.hideModal();
        } else {
            let nextArtwork;
            let remainingIds = listArtworks.length - currentArtwork.index;
            for (let i = 1; i < remainingIds; i++) {
                let nextArtworkToCheck = listArtworks.filter(
                    artwork => artwork.index === currentArtwork.index + i
                )[0]
                if (nextArtworkToCheck.visited === false) {
                    nextArtwork = nextArtworkToCheck;
                    break;
                }
            }

            if (!nextArtwork) {
                clearInterval(this.artworkInterval);
                this.hideModal();
            } else {
                this.props.onSetEventVisited(eventType, nextArtwork.index);
                if (eventType === 'Creation') {
                    this.setState({ 
                        currentCreation: nextArtwork
                    });
                } else if (eventType === 'Purchase') {
                    this.setState({ 
                        currentPurchase: nextArtwork
                    });
                }
            }
        }
    }

    imageClickedHandler = ( artwork, type ) => {
        // console.log('[imageClickedHandler] artwork = ', artwork);
        // console.log('   type = ', type);

        if (type === 'Creation') {
            this.setState({
                visitingArtworks: true, currentCreation: artwork
            });
        } else if (type === 'Purchase') {
            this.setState({
                visitingArtworks: true, currentPurchase: artwork
            });
        }

        if ( artwork.visited === true ) {
            setTimeout(() => {
                this.hideModal();
            }, 5000);
        } else {
            this.props.onSetEventVisited(type, artwork.index);
            this.artworkInterval = setInterval(this.changeVisitingArtwork, 5000);
        }

    }

    render() {
        // creation events
        let renderedNewCreations = <Spinner />;
        if ( 
            !this.props.fetchingEvents && 
            this.props.newCreations && this.props.newCreations.length > 0
        ) {
            let newCreationsByVisited = this.orderByVisited(this.props.newCreations);
            renderedNewCreations = newCreationsByVisited.map(artwork => {
                let src = 'https://ipfs.io/ipfs/' + artwork.IPFShash;
                let historyClass = classes.NotVisited;
                if (artwork.visited) {
                    historyClass = classes.Visited;
                }
                return (
                    <li key={artwork.index} onClick={
                        () => {this.imageClickedHandler(artwork, 'Creation')}
                    }>
                        <img src={src} alt={artwork.description} className={historyClass}/> 
                    </li>
                )
            });
        } else if (
            !this.props.fetchingEvents &&
            this.props.newCreations && this.props.newCreations.length === 0
        ) {
            renderedNewCreations = <div className={classes.EmptyHistories}>
                No events yet! :(
            </div>
        }

        // purchase events
        let renderedNewPurchases = <Spinner />;
        if ( 
            !this.props.fetchingEvents && 
            this.props.newPurchases && this.props.newPurchases.length > 0
        ) {
            let newPurchasesByVisited = this.orderByVisited(this.props.newPurchases);
            renderedNewPurchases = newPurchasesByVisited.map(artwork => {
                let src = 'https://ipfs.io/ipfs/' + artwork.IPFShash;
                let historyClass = classes.NotVisited;
                if (artwork.visited) {
                    historyClass = classes.Visited;
                }
                return (
                    <li key={artwork.index} onClick={
                        () => {this.imageClickedHandler(artwork, 'Purchase')}
                    }>
                        <img src={src} alt={artwork.description} className={historyClass}/> 
                    </li>
                )
            });
        } else if (
            !this.props.fetchingEvents &&
            this.props.newPurchases && this.props.newPurchases.length === 0
        ) {
            renderedNewPurchases = <div className={classes.EmptyHistories}>
                No events yet! :(
            </div>
        }

        let modal;
        if ( this.state.visitingArtworks ) {
            modal = <Modal 
                show={this.state.visitingArtworks} 
                modalClosed={this.hideModal}
            >
                <LoadedHistory 
                    type={this.state.currentCreation ? 'Creation' : 'Purchase'} 
                    artwork={
                        this.state.currentCreation
                        ? this.state.currentCreation
                        : this.state.currentPurchase
                    }
                />
            </Modal>
        }

        return (
            <React.Fragment>
                { modal }
                <div className={classes.HistoriesBar}>
                    <ul className={classes.BarInfo}>
                        <li>A</li><li>R</li><li>T</li><li>W</li>
                        <li>O</li><li>R</li><li>K</li><li>S</li>
                    </ul>
                    <ul className={classes.BarElements}>
                        { renderedNewCreations }
                    </ul>
                </div>
                <div className={classes.HistoriesBar}>
                    <ul className={classes.BarInfo}>
                        <li>P</li><li>U</li><li>R</li><li>C</li>
                        <li>H</li><li>A</li><li>S</li><li>E</li><li>S</li>
                    </ul>
                    <ul className={classes.BarElements}>
                        { renderedNewPurchases }
                    </ul>
                </div>
            </React.Fragment>
        );
    };
}

const mapStateToProps = state => {
    return {
        // web3 contract
        contract: state.web3Objects.contract,
        // firebase profile info
        loadingFirebase: state.firebaseProfile.loading,
        profileInfo: state.firebaseProfile.profileInfo,
        // events
        newCreations: state.contractEvents.newCreations,
        newPurchases: state.contractEvents.newPurchases,
        fetchingEvents: state.contractEvents.fetchingEvents
    };
};

const mapDispatchToProps = dispatch => ({
    onFetchEvents: ( contract, following ) => dispatch(
        actions.fetchEvents(contract, following)
    ),
    onSetEventVisited: ( eventType, artworkId ) => dispatch(
        actions.setEventVisited(eventType, artworkId)
    )
});

export default connect( mapStateToProps, mapDispatchToProps )( Histories );