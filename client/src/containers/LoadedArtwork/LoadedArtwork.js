import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faHeart, 
    faExclamationCircle, 
    faBackward, 
    faCoins
} from '@fortawesome/free-solid-svg-icons';
import * as actions from '../../store/actions';
import classes from './LoadedArtwork.module.css';

import Aux from '../../hoc/Aux/Aux';

class LoadedArtwork extends React.Component {
    state = { artworkSupportId: -1 }

    componentDidMount = async () => {
        await this.props.onGetUserIdFromAddress(
            '0x8F806E70121E04e94Bda323a8d98440f9eC692Df'
        );
        

        // web3Objects
        if ( !this.props.loadingWeb3 && (!this.props.web3 || !this.props.contract) ) {
            await this.props.onGetWeb3Objects();
        }
        if (this.props.web3 && !this.props.loadingAccounts && !this.props.accounts) {
            await this.props.onGetWeb3Accounts(this.props.web3);
        }

        if ( this.props.web3 && this.props.match.params.id.includes('profile') ) {
            if ( this.props.contract && this.props.accounts && !this.props.profileArtworks ) {
                await this.props.onFetchAddressInfo(
                    this.props.web3,
                    this.props.accounts[0],
                    this.props.contract.methods
                );
            }
        } else if ( this.props.contract && !this.props.homeArtworks ) {
            await this.props.onFetchHomeArtworks( this.props.contract.methods );
        }

    }

    componentWillUnmount() {
        this.props.onClearSupportState();
    }

    supportArtworkHandler = ( artworkId ) => {
        console.log('[supportArtworkHandler]');
        this.setState({ artworkSupportId: this.props.match.params.id });
        this.props.onSupportArtwork(
            artworkId, this.props.contract.methods, this.props.accounts[0]
        );
    }

    buyArtworkHandler = async ( artworkId ) => {
        console.log('[buyArtworkHandler]');
        await this.props.onPurchaseArtwork(
            artworkId, this.props.contract.methods, this.props.accounts[0]
        );
        await this.props.onFetchAvailableFunds(
            this.props.accounts[0],
            this.props.web3,
            this.props.contract.methods
        );
    }

    loadProfileHandler = async ( userAddress ) => {
        await this.props.onGetUserIdFromAddress( userAddress );
        this.props.history.push({ pathname: '/user/' + this.props.user.userId });
    }

    goBackHandler() {
        this.props.history.goBack();
    }

    render() {
        let listArtworks;
        if ( 
            this.props.history.location.pathname.includes('profile') &&
            !this.loadingWeb3 && !this.props.loadingAddressInfo &&
            this.props.profileArtworks
        ) { 
            listArtworks = this.props.profileArtworks;
        } else if ( !this.props.fetchingArtworks && this.props.homeArtworks ) {
            listArtworks = this.props.homeArtworks;
        }

        let artwork;
        if ( listArtworks ) {
            artwork = listArtworks.filter(
                obj => obj.id.toString() === this.props.match.params.id.toString()
            )[0];
        }

        let renderedArtwork;
        if ( artwork ) {
            renderedArtwork =
                <div className={classes.ArtworkContainer}>
                    
                    <div className={classes.Header}>
                        <h1>
                            { artwork.description }
                        </h1>
                        <h2 className={classes.UserAddress}
                            onClick={() => { this.loadProfileHandler(artwork.owner) }}>
                            { artwork.owner }
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
                            <ul>
                                <li>Initial price: {this.props.web3.utils.fromWei(artwork.initialPrice)} ethers</li>
                                <li>Current Price: </li>
                                <li>Supporters: { artwork.totalLikes }</li>
                            </ul>
                        </div>
                    </div>
                    <div className={classes.SupportBuyContainer}>
                        <div className={classes.BuyContainer}>
                            <div 
                                className={classes.BuyButton} 
                                onClick={() => { this.buyArtworkHandler(artwork.id) }}>
                                <FontAwesomeIcon 
                                    icon={faCoins} 
                                    size="5x"
                                    color='green'
                                />
                            </div>
                            Buy that shit
                        </div>
                        <div className={classes.Supporters}>
                            <div 
                                className={classes.LikeButtonContainer} 
                                onClick={() => { this.supportArtworkHandler(artwork.id) }}>
                                <FontAwesomeIcon 
                                    icon={faHeart} 
                                    size="5x"
                                    color='rgb(190, 35, 68)'
                                />
                            </div>
                            Join the supporters
                            <ul>
                                {
                                    artwork.supporters.map((supporter, key) => {
                                        return <li key={key}>({key + 1}) {supporter}</li>
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                </div>
        }

        // SUPPORT
        let processingSupport;
        if (this.props.processingSupport) {
            processingSupport = 
                <div className={classes.Processing}>
                    Verifying transaction, please wait...
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

        // PURCHASE
        let processingPurchase;
        if (this.props.processingPurchase) {
            processingPurchase = 
                <div className={classes.Processing}>
                    Verifying transaction, please wait...
                </div>
        }

        let purchaseError;
        if ( this.props.purchaseError ) {
            let sliceIndex = this.props.purchaseError.indexOf('revert');
            let errorMessage = this.props.purchaseError.slice(
                sliceIndex + 7, this.props.purchaseError.length
            );
            purchaseError = 
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

        return (
            <Aux>
                <div className={classes.GoBack} onClick={() => { this.goBackHandler()} }>
                    <FontAwesomeIcon 
                        className={classes.GoBackIcon}
                        icon={faBackward} 
                        size="3x"
                        color='rgb(5, 15, 44)' />
                </div>
                { renderedArtwork }

                { processingSupport }
                { processingPurchase }

                { supportError }
                { purchaseError }
            </Aux>
        )
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
        // address info
        profileArtworks: state.web3Address.artworks,
        loadingAddressInfo: state.web3Address.loading,
        // artworks
        fetchingArtworks: state.artwork.fetchingArtworks,
        homeArtworks: state.artwork.artworks,
        // artwork support
        artworkSupportId: state.artwork.artworkSupportId,
        processingSupport: state.artwork.processingSupport,
        supportError: state.artwork.supportError,
        // artwork purchase
        artworkPurchaseId: state.artwork.artworkPurchaseId,
        processingPurchase: state.artwork.processingPurchase,
        purchaseError: state.artwork.purchaseError,
        // firebase
        idToken: state.auth.idToken,
        user: state.firebaseProfile.user,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onGetWeb3Objects: () => dispatch( actions.getWeb3Objects() ),
        onGetWeb3Accounts: (web3) => dispatch( actions.getWeb3Accounts(web3) ),
        onFetchAddressInfo: ( web3, userAddress, methods ) => dispatch( 
            actions.fetchAddressInfo( web3, userAddress, methods )
        ),
        onFetchHomeArtworks: ( methods ) => dispatch( 
            actions.fetchArtworks( methods )
        ),
        onSupportArtwork: ( artworkId, methods, account ) => dispatch(
            actions.supportArtwork( artworkId, methods, account )
        ),
        onClearSupportState: () => dispatch( actions.clearSupportState() ),
        onPurchaseArtwork: ( artworkId, methods, account ) => dispatch(
            actions.purchaseArtwork( artworkId, methods, account )
        ),
        onFetchAvailableFunds: ( userAddress, web3, methods ) => dispatch( 
            actions.fetchAvailableFunds( userAddress, web3, methods )
        ),
        onGetUserIdFromAddress: ( userAddress, idToken ) => dispatch(
            actions.getUserIdFromAddress( userAddress, idToken )
        )
    };
};

export default connect( mapStateToProps, mapDispatchToProps )( LoadedArtwork );