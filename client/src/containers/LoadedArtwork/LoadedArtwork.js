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
import emptyProfilePic from '../../assets/persona.png';

import Aux from '../../hoc/Aux/Aux';
import Spinner from '../../components/UI/Spinner/Spinner';
import GasFeeModal from '../../hoc/GasFeeModal/GasFeeModal';

class LoadedArtwork extends React.Component {
    state = { 
        showGasFeeModal: false,
        expirationTime: 30,
        supporting: false,
        supportError: false,
        supportErrorMessage: '',
        purchasing: false,
        purchaseError: false,
        purchaseErrorMessage: ''
    }

    componentDidMount() { 
        this.props.onFetchArtwork( 
            this.props.match.params.id, 
            this.props.contract.methods 
        );
    }

    componentDidUpdate( prevProps ) {
        if ( prevProps.fetchingArtwork && !this.props.fetchingArtwork ) {
            this.props.onGetUserIdFromAddress( 
                this.props.loadedArtwork.owner, 
                this.props.idToken
            );
        }
    }

    componentWillUnmount() { 
        this.props.onClearSupportState(); 
        this.props.onClearPurchaseState();
    }

    decimalCount = num => {
        // Convert to String
        const numStr = String(num);
        // String Contains Decimal
        if (numStr.includes('.')) {
           return numStr.split('.')[1].length;
        };
        // String Does Not Contain Decimal
        return 0;
    }

    renderedDate = unixDate => {
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = unixDate.getFullYear();
        var month = months[unixDate.getMonth()];
        var date = unixDate.getDate();
        var hour = unixDate.getHours();
        var min = unixDate.getMinutes() < 10 ? '0' + unixDate.getMinutes() : unixDate.getMinutes();
        var sec = unixDate.getSeconds() < 10 ? '0' + unixDate.getSeconds() : unixDate.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
        return time;
    }

    clearErrors() {
        this.setState({ 
            supportError: false,
            supportErrorMessage: '',
            purchaseError: false,
            purchaseErrorMessage: ''
        });
    }

    loadProfileHandler = ( ) => {
        let pathname = '/user/' + this.props.nextProfile.userId;
        if ( this.props.loadedArtwork.owner === this.props.activeUser.userAddress ) {
            pathname = '/profile';
        }
        this.props.history.push({ 
            pathname: pathname
        });
    }

    goBackHandler() { this.props.history.goBack(); }

    hideGasFeeModal = () => {
        this.setState({ 
            showGasFeeModal: false, 
            supporting: false, 
            purchasing: false 
        });
    }

    supportArtworkClicked = () => {
        let isSupporter = false;
        this.props.loadedArtwork.supporters.forEach(supporter => {
            if (supporter.toLowerCase() === this.props.activeAddress.toLowerCase()) {
                isSupporter = true;
                this.setState({ 
                    supportError: true,
                    purchaseError: false,
                    supportErrorMessage: "You are already a supporter of this artwork."
                });
                setTimeout(() => { this.clearErrors(); }, this.state.expirationTime*1000);
            }
        });

        let isOwner = false;
        if (this.props.loadedArtwork.owner.toLowerCase() === this.props.activeAddress.toLowerCase()) {
            isOwner = true;
            this.setState({ 
                supportError: true,
                purchaseError: false,
                supportErrorMessage: "You are the owner of this artwork!"
            });
            setTimeout(() => { this.clearErrors(); }, this.state.expirationTime*1000);
        }

        let hasEther = true;
        if ( this.props.balancesActive.ethBalance <= 0 ) {
            hasEther = false;
            this.setState({ 
                supportError: true,
                purchaseError: false,
                supportErrorMessage: "You have not enough funds"
            });
            setTimeout(() => { this.clearErrors(); }, this.state.expirationTime*1000);
        }

        if ( !isSupporter && !isOwner && hasEther ) {
            if ( this.props.web3mode === 'custom' ) {
                this.setState({ showGasFeeModal: true, supporting: true });
            } else if ( this.props.web3mode === 'browser' ) {
                this.supportArtworkHandler();
            }
        }
    }

    supportArtworkHandler = ( gasValue ) => {
        let gas = 21000; // before 6721975
        let gasPrice = this.props.ethereumInfo.gasStation.fast.gasPrice; // before 10000000000
        let gasLimit = 865000; // 
        if ( this.props.web3mode === 'custom' ) {
            if ( gasValue === 'fastest' ) {
                // gas = 6721975;
                gasPrice = this.props.ethereumInfo.gasStation.fastest.gasPrice;
            } else if ( gasValue === 'safeLow') {
                // gas = 6721975;
                gasPrice = this.props.ethereumInfo.gasStation.safeLow.gasPrice;
            }
        }

        this.props.onSupportArtwork(
            this.props.loadedArtwork.id, this.props.contract, this.props.activeAddress,
            this.props.web3mode === 'custom', this.props.web3, this.props.wallet,
            gas, gasPrice, gasLimit
        );

        this.hideGasFeeModal()
    }

    buyArtworkClicked = () => {
        let isOwner = false;
        if (this.props.loadedArtwork.owner.toLowerCase() === this.props.activeAddress.toLowerCase()) {
            isOwner = true;
            this.setState({ 
                supportError: false,
                purchaseError: true,
                purchaseErrorMessage: "You are already the owner of this artwork"
            });
            setTimeout(() => { this.clearErrors(); }, this.state.expirationTime*1000);
        }

        let hasEther = true;
        const currentPrice = this.props.web3.utils.fromWei(this.props.loadedArtwork.currentPrice)
        if ( this.props.balancesActive.ethBalance <= currentPrice ) {
            hasEther = false;
            this.setState({ 
                supportError: false,
                purchaseError: true,
                purchaseErrorMessage: "You have not enough funds"
            });
            setTimeout(() => { this.clearErrors(); }, this.state.expirationTime*1000);
        }

        if ( !isOwner && hasEther ) {
            if ( this.props.web3mode === 'custom' ) {
                this.setState({ showGasFeeModal: true, purchasing: true });
            } else if ( this.props.web3mode === 'browser' ) {
                this.buyArtworkHandler();
            }
        }
    }

    buyArtworkHandler = ( gasValue ) => {
        let gas = 21000; // before 6721975
        let gasPrice = this.props.ethereumInfo.gasStation.fast.gasPrice; // before 10000000000
        let gasLimit = 865000; // 
        if ( this.props.web3mode === 'custom' ) {
            if ( gasValue === 'fastest' ) {
                // gas = 6721975;
                gasPrice = this.props.ethereumInfo.gasStation.fastest.gasPrice;
            } else if ( gasValue === 'safeLow') {
                // gas = 6721975;
                gasPrice = this.props.ethereumInfo.gasStation.safeLow.gasPrice;
            }
        }

        this.props.onPurchaseArtwork(
            this.props.loadedArtwork.id, this.props.contract, this.props.activeAddress,
            this.props.web3mode === 'custom', this.props.web3, this.props.wallet,
            gas, gasPrice, gasLimit
        );

        this.hideGasFeeModal();
    }

    render() {
        let profileInfo;
        if ( this.props.nextProfile ) {
            let profile = this.props.nextProfile;
            if ( this.props.loadedArtwork.owner === this.props.activeUser.userAddress ) {
                profile = {
                    imageSrc: this.props.activeUserInfo.public.imageSrc,
                    userName: this.props.activeUserInfo.public.name,
                }
            }

            // User Profile
            let imgClasses = [classes.ProfileImageContainer];
            let profileSrc = emptyProfilePic;
            if ( profile.imageSrc ) {
                profileSrc = 'https://ipfs.io/ipfs/' + profile.imageSrc;
            } else {
                imgClasses.push(classes.EmptyImageBackground);
            }
            let profilePic = <img src={profileSrc} alt={profileSrc} />;

            profileInfo = 
                <React.Fragment>
                    <div 
                        className={ imgClasses.join(' ') }
                        onClick={() => { this.loadProfileHandler() }}>
                            { profilePic }
                    </div>
                    <h2 
                        className={classes.UserName}
                        onClick={() => { this.loadProfileHandler() }}>
                            {profile.userName}
                    </h2>
                </React.Fragment>
        }

        let renderedArtwork;
        if ( !this.props.fetchingArtwork && this.props.loadedArtwork ) {
            // Rendered
            const artwork = this.props.loadedArtwork;
            renderedArtwork =
                <div className={classes.Container}>
                    <div className={classes.Header}>
                        { profileInfo ? profileInfo : ''}
                        { 
                            profileInfo ? 
                            <h2 
                                className={classes.UserAddress}
                                onClick={() => { this.loadProfileHandler() }}>
                                { artwork.owner }
                            </h2> : <h2>{ artwork.owner }</h2>
                        }
                        <h1> "{ artwork.description }" </h1>
                    </div>
                    <div className={classes.ImageInfoContainer}>
                        <div className={classes.ImageContainer}>
                            <img
                                src={ 'https://ipfs.io/ipfs/' + artwork.IPFShash }
                                alt={ artwork.description }
                                className={ classes.Image }
                            />
                        </div>
                        <div>
                            <div className={classes.InformationTable}>
                                <p>Creation Date</p>
                                <div>
                                    <p>
                                        { this.renderedDate(new Date(artwork.creationDate * 1000 )) }
                                    </p>
                                </div>
                                <p>Initial Price</p>
                                <div>
                                    <p>{ 
                                        this.decimalCount(parseFloat(this.props.web3.utils.fromWei(artwork.initialPrice))) > 2 ?
                                        parseFloat(this.props.web3.utils.fromWei(artwork.initialPrice)).toFixed(2) :
                                        this.props.web3.utils.fromWei(artwork.initialPrice)
                                    } eth</p>
                                    <p>
                                        {(parseFloat(this.props.web3.utils.fromWei(artwork.initialPrice)) * 
                                        parseFloat(this.props.ethereumInfo.conversion.euro)).toFixed(2)}€
                                    </p>
                                </div>
                                <p>Current Price</p>
                                <div>
                                    <p>{ 
                                        this.decimalCount(parseFloat(this.props.web3.utils.fromWei(artwork.currentPrice))) > 2 ?
                                        parseFloat(this.props.web3.utils.fromWei(artwork.currentPrice)).toFixed(2) :
                                        this.props.web3.utils.fromWei(artwork.currentPrice)
                                    } eth</p>
                                    <p>
                                        {(parseFloat(this.props.web3.utils.fromWei(artwork.currentPrice)) * 
                                        parseFloat(this.props.ethereumInfo.conversion.euro)).toFixed(2)}€
                                    </p>
                                </div>
                                <p>Share</p>
                                <div>
                                    <p>{ artwork.participationPercentage }%</p>
                                </div>
                            </div>

                            <div className={classes.ListSupporters}>
                                <p style={{ textAlign:"center", fontSize:"14px", fontWeight:"bold"}}>Supporters</p>
                                {
                                    artwork.supporters.map((supporter, key) => {
                                        return <li key={key}>({key + 1}) {supporter}</li>
                                    })
                                }
                            </div>
                        </div>
                    </div>

                    {/* BUTTONS  */}
                    <div className={classes.ButtonsContainer}>
                        <div className={classes.ButtonContainer}>
                            <div 
                                className={classes.Button} 
                                onClick={() => { this.buyArtworkClicked() }}
                            >
                                <FontAwesomeIcon 
                                    icon={faCoins} 
                                    size="3x"
                                    color='green'
                                />
                                <p>{this.props.web3.utils.fromWei(artwork.currentPrice)} eth</p>
                            </div>
                            Buy
                        </div>
                        <div className={classes.ButtonContainer}>
                            <div 
                                className={ classes.Button } 
                                onClick={() => { this.supportArtworkClicked() }}>
                                <FontAwesomeIcon 
                                    icon={faHeart} 
                                    size="3x"
                                    color='rgb(190, 35, 68)'
                                />
                                <p>{artwork.totalLikes}</p>
                            </div>
                            Support
                        </div>
                    </div>
                </div>
        } else if ( this.props.errorFetchArtwork ) {
            renderedArtwork =
                <div className={classes.ArtworkContainer}>
                    UPS! Cannot find details for this artwork.
                </div>
        }

        // PROCESSING SUPPORT OR PURCHASE
        let processingTransaction;
        if ( this.props.processingSupport | this.props.processingPurchase ) {
            processingTransaction = 
                <div className={classes.Processing}>
                    <Spinner/>
                    <div>Verifying transaction, please wait...</div>
                </div>
        }

        // SUPPORT ERRORS
        let supportError;
        if ( this.props.supportError ) {
            supportError = 
                <div className={classes.ErrorContainer}>
                    <FontAwesomeIcon 
                        icon={faExclamationCircle} 
                        size="3x"
                        color='rgb(190, 35, 68)'/>
                    <div>{ this.props.supportError }</div>
                </div>
        } else if (this.state.supportError) {
            supportError =
                <div className={classes.ErrorContainer}>
                    <FontAwesomeIcon 
                        icon={faExclamationCircle} 
                        size="3x"
                        color='rgb(190, 35, 68)'/>
                    <div>{ this.state.supportErrorMessage }</div>
                </div>
        }

        // PURCHASE ERRORS
        let purchaseError;
        if ( this.props.purchaseError ) {
            purchaseError = 
                <div className={classes.ErrorContainer}>
                    <FontAwesomeIcon 
                        icon={faExclamationCircle} 
                        size="3x"
                        color='rgb(190, 35, 68)'/>
                    <div>{ this.props.purchaseError }</div>
                </div>
        } else if ( this.state.purchaseError ) {
            supportError =
            <div className={classes.ErrorContainer}>
                <FontAwesomeIcon 
                    icon={faExclamationCircle} 
                    size="3x"
                    color='rgb(190, 35, 68)'/>
                <div>{ this.state.purchaseErrorMessage }</div>
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
                { 
                    (this.props.ethereumInfo.gasStation && this.state.showGasFeeModal ) ? 
                        <GasFeeModal 
                            submitClicked={ 
                                ( gasValue ) => { 
                                    this.state.supporting ? 
                                    this.supportArtworkHandler( gasValue ) :
                                    (this.state.purchasing && this.buyArtworkHandler(gasValue))
                                }
                            }
                            cancelClicked={ this.hideGasFeeModal }
                            showGasFeeModal={ this.state.showGasFeeModal }
                        /> : ''
                }
                { processingTransaction }
                { supportError }
                { purchaseError }
            </Aux>
        );
    };
};

const mapStateToProps = state => {
    return {
        /* ------------
           AUTH INFO
        ------------ */
        userId: state.auth.userId,
        idToken: state.auth.idToken,

        /* -----------------
          FIREBASE PROFILE
        ----------------- */
        ethereumInfo: state.firebaseProfile.ethereumInfo,
        activeUser: state.firebaseProfile.activeUser,
        activeUserInfo: state.firebaseProfile.activeUserInfo,
        nextProfile: state.firebaseProfile.nextProfile,

        /* -------------
          WEB3 OBJECTS
        ------------- */
        web3mode: state.web3Objects.web3mode,
        web3: state.web3Objects.web3,
        contract: state.web3Objects.contract,
        wallet: state.web3Objects.wallet,

        /* -------------
          WEB3 ADDRESS
        ------------- */
        activeAddress: state.web3Address.addressActive,
        balancesActive: state.web3Address.balancesActive,

        /* -------
          ARTWORK
        ---------- */
        loadedArtwork: state.artwork.loadedArtwork,
        fetchingArtwork: state.artwork.fetchingArtwork,
        errorFetchArtwork: state.artwork.errorFetchArtwork,
        // SUPPORT
        processingSupport: state.artwork.processingSupport,
        supportError: state.artwork.supportError,
        // PURCHASE
        processingPurchase: state.artwork.processingPurchase,
        purchaseError: state.artwork.purchaseError,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        // FETCH ARTWORK
        onFetchArtwork: ( artworkId, methods ) => dispatch(
            actions.fetchArtwork( artworkId, methods )
        ),
        // SUPPORT
        onSupportArtwork: ( 
            artworkId, contract, account, web3isManual, web3, wallet, gas, gasPrice, gasLimit
        ) => dispatch( actions.supportArtwork( 
                artworkId, contract, account, web3isManual, web3, wallet, gas, gasPrice, gasLimit
            )
        ),
        onClearSupportState: () => dispatch( actions.clearSupportState() ),
        // PURCHASE
        onPurchaseArtwork: ( 
            artworkId, methods, account, web3isManual, web3, wallet, gas, gasPrice, gasLimit
        ) => dispatch(
            actions.purchaseArtwork( 
                artworkId, methods, account, web3isManual, web3, wallet, gas, gasPrice, gasLimit
            )
        ),
        onClearPurchaseState: () => dispatch( actions.clearPurchaseState() ),
        // GET USER ID
        onGetUserIdFromAddress: ( userAddress, idToken ) => dispatch(
            actions.getUserIdFromAddress( userAddress, idToken )
        ),
        // FETCH FUNDS
        onFetchAvailableFunds: ( userAddress, web3, methods ) => dispatch( 
            actions.fetchAvailableFunds( userAddress, web3, methods )
        ),
    };
};

export default connect( mapStateToProps, mapDispatchToProps )( LoadedArtwork );