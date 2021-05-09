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
import Button from '../../components/UI/Button/Button';
import Spinner from '../../components/UI/Spinner/Spinner';
import Modal from '../../components/UI/Modal/Modal';

class LoadedArtwork extends React.Component {
    state = { 
        showGasFeeModal: false,
        gasFee: {
            elementType: 'select',
            elementConfig: { 
                type: 'select',
                options: [
                    { value: 'fastest', displayValue: 'Fastest' },
                    { value: 'fast', displayValue: 'Fast' },
                    { value: 'safeLow', displayValue: 'Cheapest' }
                ]
            },
            value: 'fast',
        },
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

    inputChangedHandler = ( value ) => {
        this.setState({  
            gasFee: { ...this.state.gasFee, value: value } 
        });
    }

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

    supportArtworkHandler = () => {
        let gas = 21000; // before 6721975
        let gasPrice = this.props.gasStation.fast.gasPrice; // before 10000000000
        let gasLimit = 865000; // 
        if ( this.props.web3mode === 'custom' ) {
            if ( this.state.gasFee.value === 'fastest' ) {
                // gas = 6721975;
                gasPrice = this.props.gasStation.fastest.gasPrice;
            } else if ( this.state.gasFee.value === 'safeLow') {
                // gas = 6721975;
                gasPrice = this.props.gasStation.safeLow.gasPrice;
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

    buyArtworkHandler = () => {
        console.log('[buyArtworkHandler]');

        let gas = 21000; // before 6721975
        let gasPrice = this.props.gasStation.fast.gasPrice; // before 10000000000
        let gasLimit = 865000; // 
        if ( this.props.web3mode === 'custom' ) {
            if ( this.state.gasFee.value === 'fastest' ) {
                // gas = 6721975;
                gasPrice = this.props.gasStation.fastest.gasPrice;
            } else if ( this.state.gasFee.value === 'safeLow') {
                // gas = 6721975;
                gasPrice = this.props.gasStation.safeLow.gasPrice;
            }
        }

        this.props.onPurchaseArtwork(
            this.props.loadedArtwork.id, this.props.contract, this.props.activeAddress,
            this.props.web3mode === 'custom', this.props.web3, this.props.wallet,
            gas, gasPrice, gasLimit
        );
        this.props.onFetchAvailableFunds(
            this.props.activeAddress,
            this.props.web3,
            this.props.contract.methods
        );

        this.hideGasFeeModal()
    }

    render() {
        let renderedArtwork;
        if ( this.props.nextProfile && !this.props.fetchingArtwork && this.props.loadedArtwork ) {
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
            let profilePic = <img src={profileSrc} alt={profileSrc} />

            // Rendered
            const artwork = this.props.loadedArtwork;
            renderedArtwork =
                <div className={classes.Container}>
                    <div className={classes.Header}>
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
                        <h2 
                            className={classes.UserAddress}
                            onClick={() => { this.loadProfileHandler() }}>
                            { artwork.owner }
                        </h2>
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
                        <div className={classes.InfoContainer}>
                            <ul>
                                <li>Initial price: {this.props.web3.utils.fromWei(artwork.initialPrice)} ethers</li>
                                <li>Current Price: {this.props.web3.utils.fromWei(artwork.currentPrice)} ethers</li>
                                <li>Supporters: { artwork.totalLikes }</li>
                            </ul>
                            <div className={classes.ListSupporters}>
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
                                onClick={() => { this.buyArtworkClicked() }}>
                                <FontAwesomeIcon 
                                    icon={faCoins} 
                                    size="3x"
                                    color='green'
                                />
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

        let gasFeeModal;
        if ( this.state.showGasFeeModal ) {
            let formElement = this.state.gasFee;
            gasFeeModal = 
                <Modal 
                    show={ this.state.showGasFeeModal }
                    modalClosed={this.hideGasFeeModal}>
                        <h1 style={{textAlign:"center"}}>Gas price</h1>
                        <div>
                            <div className={classes.GasFeeModalOptions}>
                                {formElement.elementConfig.options.map(option => (
                                    <div 
                                        key={option.value} 
                                        value={option.value}
                                        className={
                                            [
                                                classes.GasFeeOption,
                                                formElement.value === option.value ?
                                                classes.GasFeeOptionActive : ''
                                            ].join(" ")
                                        }
                                        onClick={ () => this.inputChangedHandler( option.value ) }
                                    >
                                        <h1>{ option.displayValue }</h1>
                                        <div className={classes.OptionDetails}>
                                            <p>
                                                {
                                                    parseInt(this.props.gasStation[option.value].gasPrice) / 1000000000 
                                                } Gwei
                                            </p>
                                            <p>{ this.props.gasStation[option.value].time } seconds on average</p>
                                        </div>   
                                    </div>
                                ))}
                            </div>

                            <div className={classes.CenterButtons}>
                                <Button 
                                    btnType="Success"
                                    clicked={
                                        this.state.supporting ? 
                                        this.supportArtworkHandler : 
                                        (this.state.purchasing && this.buyArtworkHandler)
                                    }
                                >
                                    ACCEPT
                                </Button>
                                <Button 
                                    type="button" 
                                    btnType="Danger" 
                                    clicked={this.hideGasFeeModal}>
                                        CANCEL
                                </Button>
                            </div>
                        </div>
                </Modal>
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

                { gasFeeModal }

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
        gasStation: state.firebaseProfile.gasStation,
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