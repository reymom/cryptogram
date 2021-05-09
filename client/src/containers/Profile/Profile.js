import React from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import * as actions from '../../store/actions';
import classes from './Profile.module.css';
import emptyProfilePic from '../../assets/persona.png';

import Spinner from '../../components/UI/Spinner/Spinner';
import Modal from '../../components/UI/Modal/Modal';
import Button from '../../components/UI/Button/Button';
import EditProfile from './EditProfile/EditProfile';
import CreateArtwork from '../CreateArtwork/CreateArtwork';
import KanbanArtworks from '../KanbanArtworks/KanbanArtworks';

class Profile extends React.Component {

    state = {
        hasActiveAccount: null,
        showCreatedTokens: true,
        showPurchasedTokens: false,
        creatingArtwork: false, 
        editingProfile: false
    }

    componentDidMount = () => {
        // firebase user info
        if ( 
            this.props.match.path !== '/profile' && this.props.idToken && !this.props.fetchingProfile &&
            (
                ( !this.props.profile ) ||
                ( this.props.match.params.id !== this.props.profile.userId )
            )
        ) { 
            
            // console.log('[componentDidMount]');
            // console.log('[onFetchProfile](profile) = ', this.props.profile);

            this.props.onFetchProfile(this.props.match.params.id, this.props.idToken);
            if ( this.props.profile ) {
                this.props.onFetchAddressInfo(
                    this.props.web3, 
                    this.props.profile.userAddress,
                    this.props.contract.methods
                )
            }
        }
    }

    componentDidUpdate( prevProps ) {
        // console.log('[componentDidUpdate]');
        if ( prevProps.fetchingProfile && !this.props.fetchingProfile ) {
            this.props.onFetchAddressInfo( 
                this.props.web3, this.props.profile.userAddress, this.props.contract.methods
            );
        }
        // console.log(
        //     'this.props.activeUserInfo.public = ', 
        //     this.props.activeUserInfo.public
        // );
    }

    followButtonHandler = ( ) => {
        // console.log('[followButtonHandler]');
        // console.log('profile = ', this.props.profile);

        let unfollow = false;
        if ( this.props.activeUserInfo.public.following ) {
            let following = Object.keys(this.props.activeUserInfo.public.following);
            let profileId = this.props.profile.userId;
            if ( following.includes( profileId ) ) {
                unfollow = true;
            }
        }

        // console.log('unfollow = ', unfollow);
    
        this.props.onFollowUser(
            this.props.userId, 
            this.props.activeUser.userAddress,
            this.props.match.params.id, 
            this.props.profile.userAddress,
            this.props.idToken,
            unfollow
        );
    }

    showKanbanHandler = ( kanbanMode ) => {
        if ( kanbanMode === 'purchases' && !this.state.showPurchasedTokens ) {
            this.setState({ showCreatedTokens: false, showPurchasedTokens: true });
        } else if ( kanbanMode === 'creations' && !this.state.showCreatedTokens ) {
            this.setState({ showCreatedTokens: true, showPurchasedTokens: false });
        }
    }

    showModal = ( type ) => {
        if ( type === 'Create Artwork') {
            this.setState({ creatingArtwork: true });
        } else if ( type === 'Edit Profile' ) {
            this.setState({ editingProfile: true });
        }
    }

    hideModal = () => {
        this.setState({ creatingArtwork: false, editingProfile: false });
    }

    clickSubmitted = () => { this.hideModal(); }

    render() {
        // MODALS
        let createArtworkForm;
        if ( this.props.web3 && this.props.contract && this.props.activeAddress ) {
            createArtworkForm = <CreateArtwork
                clickCancel={ this.hideModal }
                clickSubmitNewArtwork={ this.clickSubmitted }
            />
        }

        let editProfileForm;
        if ( !this.props.errorFetchingActiveUser && this.props.activeUserInfo ) {
            editProfileForm = 
                <EditProfile 
                    clickCancel={ this.hideModal } 
                    clickSubmitProfileEdit={ this.clickSubmitted }
                    profileImageSrc={ this.props.activeUserInfo.public.imageSrc }
                    profileUserName={ this.props.activeUserInfo.public.name }
                    profileDescription={ this.props.activeUserInfo.public.description }
                />
        }

        // EDIT BUTTONS
        let profileButtons;
        if ( this.props.match.path === '/profile' ) {
                profileButtons =
                    <React.Fragment>
                        <Button 
                            clicked={() => { this.showModal('Edit Profile')} }
                            btnType="EditProfile">
                                EDIT PROFILE
                        </Button>
                        <Button
                            clicked={() => { this.showModal('Create Artwork')} }
                            btnType="CreateArtwork"
                            disabled={ !this.props.activeAddress }>
                                NEW ARTWORK
                            </Button>
                    </React.Fragment>
        } else if ( 
            !this.props.fetchingInfo && this.props.profile &&
            this.props.activeUserInfo && this.props.activeUserInfo.public
        ) {
            let buttonClass = 'Follow';
            if ( this.props.activeUserInfo.public.following ) {
                let following = Object.keys(this.props.activeUserInfo.public.following);
                let profileId = this.props.profile.userId;
                if ( following.includes( profileId ) ) {
                    buttonClass = 'Unfollow';
                }
            }

            profileButtons =
                <React.Fragment>
                    <Button 
                        clicked={() => { this.followButtonHandler() } }
                        btnType={ buttonClass }>
                            { buttonClass.toUpperCase() }
                    </Button>
                </React.Fragment>
        }

        // PROFILE SECTION
        let profileDict;
        let balancesDict;
        if ( this.props.match.path === '/profile' ) {
            if (this.props.activeUserInfo && this.props.activeUserInfo.public) {
                profileDict = this.props.activeUserInfo.public;
            }
            if (this.props.balancesActive) {
                balancesDict = this.props.balancesActive;
            }
        } else if ( this.props.match.path !== '/profile' ) {
            if ( !this.props.fetchingInfo && this.props.profileInfo ) {
                profileDict = this.props.profileInfo;
            }
            if ( !this.props.fetchingInfo ) {
                balancesDict = this.props.balances;
            }
        }

        let profileInfo;
        if ( profileDict ) {
            let imgClasses = [ classes.ProfileImageContainer ];
            let profileSrc = emptyProfilePic;
            if ( profileDict.imageSrc ) {
                profileSrc = 'https://ipfs.io/ipfs/' + profileDict.imageSrc;
            } else {
                imgClasses.push(classes.EmptyImageBackground);
            }
            let profilePic = <img src={profileSrc} alt={profileSrc} />

            profileInfo = (
                <React.Fragment>
                    <div className={[classes.InfoWrapper, classes.LeftColumn].join(' ')}>
                        <b>
                            { 
                                profileDict.followers
                                ? Object.keys(profileDict.followers).length
                                : 0
                            }
                        </b>
                        <span>Followers</span>
                        <b>
                            {
                                profileDict.following
                                ? Object.keys(profileDict.following).length
                                : 0
                            }
                        </b>
                        <span>Following</span>
                    </div>
                    <div className={classes.ProfileCenter}>
                        <div className={imgClasses.join(' ')}>
                            { profilePic }
                        </div>
                        <h1>{ profileDict.name }
                        </h1>
                        <div className={classes.ProfileAddress}>
                            { this.props.address }
                        </div>
                        <div className={classes.ProfileDescription}>
                            { profileDict.description }
                        </div>
                        <div className={classes.ButtonsContainer}>
                            { profileButtons }
                        </div>
                    </div>
                    {
                        balancesDict ?
                        <div className={[classes.InfoWrapper, classes.RigthColumn].join(' ')}>
                            Artworks
                            <span className={classes.ProfileStatCount}>
                                <b>{balancesDict.tokenBalance}</b>
                            </span>
                            Created
                            <span className={classes.ProfileStatCount}>
                                <b>{balancesDict.numTokensCreated}</b>
                            </span>
                            Bought
                            <span className={classes.ProfileStatCount}>
                                <b>{balancesDict.numTokensBought}</b>
                            </span>
                        </div> : ''
                    }
                </React.Fragment>
            )
        }

        let creatingArtworkMessage;
        if (this.props.match.path === '/profile' && this.props.creatingArtwork) {
            creatingArtworkMessage = 
                <div className={classes.CreatingArtworkMessage}>
                    Creating artwork, we are verifying it is added to a new block...
                    <Spinner/>
                </div>
        } else if (this.props.match.path === '/profile' && this.props.creationError) {
            creatingArtworkMessage = 
                <div className={classes.CreatingArtworkMessage}>
                    Something went wrong: could not create the artwork.
                </div>
        }

        // KANBAN
        let kanbanArtworks = <Spinner />;
        if ( this.props.artworksActive ) {
            kanbanArtworks = 
                <KanbanArtworks 
                    page={this.props.match.path === '/profile' ? 'activeProfile' : 'profile'}
                    showMode={ this.state.showCreatedTokens ? 'creations' : 'purchases' }
                />;
        }

        let redirectToProfile;
        if ( 
            this.props.match.path !== '/profile' &&
            this.props.match.params.id === this.props.activeUser.userId 
        ) {
            redirectToProfile = <Redirect to="/profile" exact />
        }
        return (
            <div className={classes.ProfileContainer}>
                { redirectToProfile }
                <Modal 
                    show={this.state.creatingArtwork || this.state.editingProfile}
                    modalClosed={this.hideModal}>
                        { this.state.creatingArtwork ? createArtworkForm : editProfileForm}
                </Modal>
                <div className={classes.ProfileHeaderContainer}>
                    { profileInfo }
                </div>
                { creatingArtworkMessage }
                <div className={classes.KanbanModeContainer}>
                    <ul className={classes.KanbanMode}>
                        <li 
                            className={this.state.showCreatedTokens ? classes.ActiveMode : ''}
                            onClick={() => { this.showKanbanHandler('creations')} }>
                            MY CREATIONS
                        </li>
                        <li 
                            className={this.state.showPurchasedTokens ? classes.ActiveMode : ''}
                            onClick={() => { this.showKanbanHandler('purchases')} }>
                            MY COLLECTION
                        </li>
                    </ul>
                </div>
                <div className={classes.KanbanContainer}>
                    { kanbanArtworks }
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        /* -----------
          AUTH INFO
        ----------- */
        userId: state.auth.userId,
        idToken: state.auth.idToken,

        /* -----------------
          FIREBASE PROFILE
        ----------------- */
        // FETCH ACTIVE USER
        activeUser: state.firebaseProfile.activeUser,
        activeUserInfo: state.firebaseProfile.activeUserInfo,
        fetchingActiveUser: state.firebaseProfile.fetchingActiveUser,
        errorFetchingActiveUser: state.firebaseProfile.errorFetchingActiveUser,
        // FETCH EXTERNAL PROFILE
        profile: state.firebaseProfile.profile,
        profileInfo: state.firebaseProfile.profileInfo,
        fetchingProfile: state.firebaseProfile.fetchingProfile,
        errorFetchInfo: state.firebaseProfile.errorFetchInfo,
        // FOLLOW AND EDIT
        errorFollow: state.firebaseProfile.errorFollow,
        errorEdit: state.firebaseProfile.errorEdit,

        /* -------------
          WEB3 OBJECTS
        ------------- */
        // web3mode: state.web3Objects.web3mode,
        // WEB3 AND CONTRACT INJECTION
        web3: state.web3Objects.web3,
        loadingWeb3: state.web3Objects.loadingWeb3,
        errorWeb3: state.web3Objects.errorWeb3,
        contract: state.web3Objects.contract,
        loadingContract: state.web3Objects.loadingContract,
        errorContract: state.web3Objects.errorContract,
        // ACTIVE USER ACCOUNTS
        // if browser mode
        // accountsActive: state.web3Objects.accounts,
        // loadingAccountsActive: state.web3Objects.loadingAccounts,
        // errorAccountsActive: state.web3Objects.errorAccounts,
        // if custom mode
        // seeds: state.web3Objects.seeds,
        // wallet: state.web3Objects.wallet,
        // addressActive: state.web3Objects.address,
        // gettingAddressActive: state.web3Objects.gettingAddress,
        // errorAddressActive: state.web3Objects.errorAddress,

        /* -------------
          WEB3 ADDRESS
        ------------- */
        // ACTIVE USER INFO
        activeAddress: state.web3Address.addressActive,
        balancesActive: state.web3Address.balancesActive,
        artworksActive: state.web3Address.artworksActive,
        fetchingInfoActive: state.web3Address.fetchingInfoActive,
        // EXTERNAL USER INFO
        externalAddress: state.web3Address.address,
        balances: state.web3Address.balances,
        artworks: state.web3Address.artworks,
        fetchingInfo: state.web3Address.fetchingInfo,

        /* ---------
          ARTWORKS
        --------- */
        creatingArtwork: state.artwork.creatingArtwork,
        creationError: state.artwork.creationError
    };
};

const mapDispatchToProps = dispatch => ({
    // FIREBASE PROFILE
    onFetchProfile: ( userId, idToken ) => dispatch(
        actions.fetchProfile(userId, idToken)
    ),
    // FIREBASE FOLLOW
    onFollowUser: ( 
        fromUserId, fromAddress, toUserId, toAddress, idToken, unfollow 
    ) => dispatch(
        actions.followUser(
            fromUserId, fromAddress, toUserId, toAddress, idToken, unfollow
        )
    ),
    // USER INFO
    onFetchAddressInfo: ( web3, userAddress, methods ) => dispatch( 
        actions.fetchAddressInfo(web3, userAddress, methods, false)
    ),
});

export default connect( mapStateToProps, mapDispatchToProps )( Profile );