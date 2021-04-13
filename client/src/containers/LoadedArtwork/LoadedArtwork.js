import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faExclamationCircle, faBackward } from '@fortawesome/free-solid-svg-icons';

import * as actions from '../../store/actions';
import classes from './LoadedArtwork.module.css';

import Aux from '../../hoc/Aux/Aux';

class LoadedArtwork extends React.Component {

    state = { artworkSupportId: -1 }

    componentDidMount = async () => {
        if ( !this.props.accounts || !this.props.contract ) {
            await this.props.onGetWeb3Objects();
        }
        if ( this.props.contract && !this.props.artworks.lenght ) {
            await this.props.onFetchAddressInfo(
                this.props.contract.methods,
                '0x8F806E70121E04e94Bda323a8d98440f9eC692Df'
            );
        }
    }

    componentWillUnmount() {
        this.props.onClearSupportState();
    }

    supportArtworkHandler = ( tokenId ) => {
        console.log('supportArtworkHandler');
        this.setState({ artworkSupportId: this.props.match.params.id });
        this.props.onSupportArtwork(
            tokenId, this.props.contract.methods, this.props.accounts[1]
        );
    }

    loadAddressHandler = ( userAddress ) => {
        this.props.history.push({ pathname: '/address/' + userAddress });
    }

    goBackHandler() {
        this.props.history.goBack();
    }

    render() {
        let loadedArtwork;
        let listSupporters;
        if ( !this.loadingWeb3 && this.props.listSupporters.length ) {
            listSupporters = this.props.listSupporters.join(', ');
            listSupporters = listSupporters.slice(0, listSupporters.lenght - 2);
        }
        if ( !this.props.loadingAddress && this.props.artworks.length ) {
            let artwork = this.props.artworks[this.props.match.params.id];
            // console.log('artwork = ', artwork);
            loadedArtwork =
                <div className={classes.ArtworkContainer}>
                    
                    <div className={classes.Header}>
                        <h1>
                            { artwork.description }
                        </h1>
                        <h2 className={classes.UserAddress}
                            onClick={() => { this.loadAddressHandler(artwork.owner) }}>
                            {artwork.owner}
                        </h2>
                    </div>
                    
                    <div className={classes.ImageInfoContainer}>
                        <div className={classes.ImageContainer}>
                            <img
                                src={ 'https://ipfs.io/ipfs/' + artwork.IPFShash }
                                alt={ artwork.description }
                                className={ classes.Image }
                            />
                        </div>
                        <div className={classes.InfoContainer}>
                            <p>Price: {artwork.initialPrice}</p>
                        </div>
                    </div>
                    <div 
                        className={classes.LikeButtonContainer} 
                        onClick={() => { this.supportArtworkHandler(artwork.id) }}>
                        <FontAwesomeIcon 
                            icon={faHeart} 
                            size="5x"
                            color='rgb(190, 35, 68)'
                        />
                    </div>
                    <div className={classes.Supporters}>
                        <p>{ listSupporters }</p>
                    </div>
                </div>
        }

        let supportError;
        if ( this.props.supportError ) {
            let sliceIndex = this.props.supportError.indexOf('revert');
            let errorMessage = this.props.supportError.slice(
                sliceIndex + 7, this.props.supportError.length
            );
            supportError = 
                <div className={classes.ErrorContainer}>
                    <FontAwesomeIcon 
                        className={classes.ErrorIcon}
                        icon={faExclamationCircle} 
                        size="5x"
                        color='rgb(190, 35, 68)'/>
                    <div className={classes.ErrorMessage}>
                        { errorMessage }
                    </div>
                </div>
        }

        let processingSupport;
        if (this.props.processingSupport) {
            processingSupport = 
                <div className={classes.ProcessingSupport}>
                    Verifying transaction, please wait...
                </div>
        }

        return (
            <Aux>
                <div className={classes.GoBack} onClick={() => {this.goBackHandler()}}>
                    <FontAwesomeIcon 
                        className={classes.GoBackIcon}
                        icon={faBackward} 
                        size="3x"
                        color='rgb(5, 15, 44)'
                    />
                </div>
                { loadedArtwork }
                { processingSupport }
                { supportError }
            </Aux>
        )
    }
}

const mapStateToProps = state => {
    return {
        // web3 objects
        web3: state.web3Objects.web3,
        accounts: state.web3Objects.accounts,
        contract: state.web3Objects.contract,
        loadingWeb3: state.web3Objects.loading,
        // address info
        artworks: state.web3Address.artworks,
        listSupporters: state.web3Address.listSupporters,
        loadingAddressInfo: state.web3Address.loading,
        // artwork support
        artworkSupportId: state.artwork.artworkSupportId,
        processingSupport: state.artwork.processingSupport,
        supportError: state.artwork.supportError
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onGetWeb3Objects: () => dispatch( actions.getWeb3Objects() ),
        onFetchAddressInfo: ( userAddress, methods ) => dispatch( 
            actions.fetchAddressInfo( userAddress, methods )
        ),
        onSupportArtwork: ( tokenId, methods, account ) => dispatch(
            actions.supportArtwork( tokenId, methods, account )
        ),
        onClearSupportState: () => dispatch( actions.clearSupportState() )
    };
};

export default connect( mapStateToProps, mapDispatchToProps )( LoadedArtwork );