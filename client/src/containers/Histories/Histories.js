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
        currentCreationId: null,
        currentCreation: null,
        currentPurchaseId: null,
        currentPurchase: null
    };

    componentDidMount() {
        // console.log('[componentDidMount]');
        if ( 
            this.props.contract && 
            this.props.activeUserInfo.public.following && 
            Object.keys(this.props.activeUserInfo.public.following).length > 0
        ) {
            let followingObject = this.props.activeUserInfo.public.following;
            let followingList = Object.values(followingObject);
            this.props.onFetchEvents(
                this.props.contract, followingList, 'newArtwork'
            );
            this.props.onFetchEvents(
                this.props.contract, followingList, 'artworkBought'
            );
        }
    };

    componentWillUnmount() { clearInterval(this.artworkInterval); }

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
            currentCreationId: null,
            currentCreation: null,
            currentPurchaseId: null,
            currentPurchase: null
        });
    }

    changeVisitingArtwork = () => {
        console.log('[changeVisitingArtwork]');
        let eventType;
        let listArtworks;
        let currentArtworkId;
        if ( this.state.currentCreationId !== null ) {
            eventType = 'Creation';
            listArtworks = this.props.newCreations;
            currentArtworkId = parseInt(this.state.currentCreationId);
        } else if ( this.state.currentPurchase !== null ) {
            eventType = 'Purchase';
            listArtworks =  this.props.newPurchases;
            currentArtworkId = parseInt(this.state.currentPurchaseId);
        }

        console.log('listArtworks = ', listArtworks);
        console.log('currentArtworkId = ', currentArtworkId);

        if ( currentArtworkId === listArtworks.length - 1 ) {
            clearInterval( this.artworkInterval );
            this.hideModal();
        } else {
            let nextArtwork;
            let remainingIds = listArtworks.length - currentArtworkId;
            let nextId = 0;
            for (let i = 0; i < remainingIds; i++) {
                let nextArtworkToCheck = listArtworks[currentArtworkId + i];
                if (nextArtworkToCheck.visited === false) {
                    nextArtwork = nextArtworkToCheck;
                    break;
                }
                nextId += 1;
            }

            if ( !nextArtwork ) {
                clearInterval( this.artworkInterval );
                this.hideModal();
            } else {
                this.props.onSetEventVisited( eventType, nextArtwork.index );
                if ( eventType === 'Creation' ) {
                    this.setState({ 
                        currentCreationId: currentArtworkId + nextId,
                        currentCreation: nextArtwork
                    });
                } else if (eventType === 'Purchase') {
                    this.setState({ 
                        currentPurchaseId: currentArtworkId + nextId,
                        currentPurchase: nextArtwork
                    });
                }
            }
        }
    }

    imageClickedHandler = ( artwork, type ) => {
        console.log('clicked artwork.index = ', artwork.index);
        console.log('listIndex = ', artwork.listIndex);
        if (type === 'Creation') {
            this.setState({
                visitingArtworks: true, 
                currentCreationId: artwork.listIndex, 
                currentCreation: artwork
            });
        } else if (type === 'Purchase') {
            this.setState({
                visitingArtworks: true, 
                currentPurchaseId: artwork.listIndex, 
                currentPurchase: artwork
            });
        }

        if ( artwork.visited === true ) {
            setTimeout(() => { this.hideModal(); }, 5000);
        } else {
            this.props.onSetEventVisited( type, artwork.index );
            this.artworkInterval = setInterval( this.changeVisitingArtwork, 5000 );
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
                        () => { this.imageClickedHandler(artwork, 'Creation') }
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
        
        if (
            !this.props.fetchingEvents && 
            this.props.activeUserInfo.public.following && 
            this.props.activeUserInfo.public.following.length > 0
        ) {
            renderedNewCreations = <div className={classes.EmptyHistories}>
                Follow some profiles to see events.
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
                if ( artwork.visited ) {
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
        
        if (
            !this.props.fetchingEvents && 
            this.props.activeUserInfo.public.following && 
            this.props.activeUserInfo.public.following.length > 0
        ) {
            renderedNewCreations = <div className={classes.EmptyHistories}>
                Follow some profiles to see events.
            </div>
        }

        let modal;
        if ( this.state.visitingArtworks ) {
            modal = <Modal 
                show={ this.state.visitingArtworks } 
                modalClosed={this.hideModal}>
                <LoadedHistory 
                    type={this.state.currentCreationId !== null ? 'Creation' : 'Purchase'} 
                    artwork={
                        this.state.currentCreationId !== null
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
        activeUser: state.firebaseProfile.activeUser,
        activeUserInfo: state.firebaseProfile.activeUserInfo,
        fetchingActiveUser: state.firebaseProfile.fetchingActiveUser,
        errorFetchingActiveUser: state.firebaseProfile.errorFetchingActiveUser,
        // events
        newCreations: state.contractEvents.newCreations,
        newPurchases: state.contractEvents.newPurchases,
        fetchingEvents: state.contractEvents.fetchingEvents
    };
};

const mapDispatchToProps = dispatch => ({
    onFetchEvents: ( contract, following, eventType ) => dispatch(
        actions.fetchEvents(contract, following, eventType)
    ),
    onSetEventVisited: ( eventType, artworkId ) => dispatch(
        actions.setEventVisited(eventType, artworkId)
    )
});

export default connect( mapStateToProps, mapDispatchToProps )( Histories );