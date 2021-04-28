import React from 'react';
import { connect } from 'react-redux';

import * as actions from '../../store/actions';
import classes from './Profile.module.css';
import emptyProfilePic from '../../assets/persona.png';

import Spinner from '../../components/UI/Spinner/Spinner';
import Modal from '../../components/UI/Modal/Modal';
import Button from '../../components/UI/Button/Button';
import EditProfile from '../EditProfile/EditProfile';
import CreateArtwork from '../CreateArtwork/CreateArtwork';
import KanbanArtworks from '../KanbanArtworks/KanbanArtworks';

class Profile extends React.Component {

    state = {
        showCreatedTokens: true,
        showPurchasedTokens: false,
        creatingArtwork: false, 
        editingProfile: false
    }

    componentDidMount = async () => {
        // web3Objects
        if ( !this.props.loadingWeb3 && (!this.props.web3 || !this.props.contract) ) {
            await this.props.onGetWeb3Objects();
        }
        if (this.props.web3 && !this.props.loadingAccounts && !this.props.accounts) {
            await this.props.onGetWeb3Accounts(this.props.web3);
        }

        // profile info for fetching firebase
        let userId = this.props.userId;
        let userAddress;
        if ( this.props.match.path === '/profile' ) {
            userId = this.props.userId;
            if ( this.props.accounts && this.props.accounts.length !== 0 ) {
                userAddress = this.props.accounts[0];
            }
        } else if ( this.props.match.params.id ) {
            // userId = 
            userAddress = this.props.match.params.id;
        }

        // firebase
        if ( 
            (!this.props.loadingFirebase && !this.props.profileInfo) 
            &&
            (userId && this.props.idToken)
        ) {
            await this.props.onFetchProfile(userId, this.props.idToken);
        }

        // web3 address
        if ( 
            (this.props.web3 && !this.props.loadingAddress && this.props.contract) && 
            (!this.props.artworks || this.props.address !== userAddress)
        ) {
            await this.props.onFetchAddressInfo(
                this.props.web3,
                userAddress,
                this.props.contract.methods
            );
        }
    }

    followButtonHandler = ( ) => {
        this.props.onFollowUser(
            this.props.userId, 
            this.props.match.params.id, 
            this.props.idToken
        );
    }

    showKanbanHandler = ( kanbanMode ) => {
        if ( kanbanMode === 'purchases' && !this.state.showPurchasedTokens ) {
            this.setState({showCreatedTokens: false, showPurchasedTokens: true});
        } else if ( kanbanMode === 'creations' && !this.state.showCreatedTokens ) {
            this.setState({showCreatedTokens: true, showPurchasedTokens: false});
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

    clickSubmitted = () => {
        this.hideModal();
    }

    render() {
        // MODALS
        let createArtworkForm;
        if ( this.props.web3 && this.props.contract && this.props.accounts ) {
            createArtworkForm = <CreateArtwork
                clickCancel={this.hideModal}
                clickSubmitNewArtwork={this.clickSubmitted}
            />
        }

        let editProfileForm;
        if ( this.props.profileInfo ) {
            editProfileForm = 
                <EditProfile 
                    clickCancel={this.hideModal} 
                    clickSubmitProfileEdit={this.clickSubmitted}
                    profileImageSrc={this.props.profileInfo.imageSrc}
                    profileUserName={this.props.profileInfo.name}
                    profileDescription={this.props.profileInfo.description}
                />
        }

        // EDIT BUTTONS
        let profileButtons;
        if (
            !this.props.match.params.id || 
                (
                    this.props.accounts && 
                    ( this.props.match.params.id !== this.props.accounts[0] )
                )
            ) {
                profileButtons =
                    <React.Fragment>
                        <Button 
                            clicked={() => {this.showModal('Edit Profile')}}
                            btnType="EditProfile">
                                EDIT PROFILE
                        </Button>
                        <Button
                            clicked={() => {this.showModal('Create Artwork')}}
                            btnType="CreateArtwork"
                            disabled={this.props.accounts.length === 0 ? false : true}>
                                NEW ARTWORK
                            </Button>
                    </React.Fragment>
        } else {
            profileButtons =
                <React.Fragment>
                    <Button 
                        clicked={() => { this.followButtonHandler() } }
                        btnType="Follow">
                            FOLLOW
                    </Button>
                </React.Fragment>
        }

        // PROFILE SECTION
        let profileInfo;
        if ( !this.props.loadingFirebase ) {
            let imgClasses = [classes.ProfileImageContainer]
            let profileSrc = emptyProfilePic;
            if (this.props.profileInfo && this.props.profileInfo.imageSrc) {
                profileSrc = 'https://ipfs.io/ipfs/' + this.props.profileInfo.imageSrc
            } else {
                imgClasses.push(classes.EmptyImageBackground)
            }
            let profilePic = <img src={profileSrc} alt={profileSrc} />

            profileInfo = (
                <React.Fragment>
                    <div className={[classes.InfoWrapper, classes.LeftColumn].join(' ')}>
                        <b>
                            { 
                                this.props.profileInfo && this.props.profileInfo.followers
                                ? Object.keys(this.props.profileInfo.followers).length
                                : 0
                            }
                        </b>
                        <span>Followers</span>
                        <b>
                            {
                                this.props.profileInfo && this.props.profileInfo.following
                                ? Object.keys(this.props.profileInfo.following).length
                                : 0
                            }
                        </b>
                        <span>Following</span>
                    </div>
                    <div className={classes.ProfileCenter}>
                        <div className={imgClasses.join(' ')}>
                            { profilePic }
                        </div>
                        <h1>{ 
                                this.props.profileInfo && this.props.profileInfo.name
                                ? this.props.profileInfo.name
                                : ''
                            }
                        </h1>
                        <div className={classes.ProfileAddress}>
                            { this.props.address }
                        </div>
                        <div className={classes.ProfileDescription}>
                            {
                                this.props.profileInfo && this.props.profileInfo.description
                                ? this.props.profileInfo.description
                                : ''
                            }
                        </div>
                        <div className={classes.ButtonsContainer}>
                            {
                                this.props.profileInfo
                                ? profileButtons
                                : null
                            }
                        </div>
                    </div>
                    {
                        this.props.address ?
                        <div className={[classes.InfoWrapper, classes.RigthColumn].join(' ')}>
                            Artworks
                            <span className={classes.ProfileStatCount}>
                                <b>{this.props.balances.tokenBalance}</b>
                            </span>
                            Created
                            <span className={classes.ProfileStatCount}>
                                <b>{this.props.balances.numTokensCreated}</b>
                            </span>
                            Bought
                            <span className={classes.ProfileStatCount}>
                                <b>{this.props.balances.numTokensBought}</b>
                            </span>
                        </div> : ''
                    }
                </React.Fragment>
            )
        }

        // kanban
        let kanbanArtworks = <Spinner />;
        kanbanArtworks = '';
        if (
            !this.props.loadingWeb3 && !this.props.loadingAddress && this.props.artworks
        ) {
            kanbanArtworks = <KanbanArtworks page='profile' showMode={
                this.state.showCreatedTokens ? 'creations' : 'purchases'
            }/>;
        }

        return (
            <div className={classes.ProfileContainer}>
                <Modal 
                    show={this.state.creatingArtwork || this.state.editingProfile}
                    modalClosed={this.hideModal}>
                        { this.state.creatingArtwork ? createArtworkForm : editProfileForm}
                </Modal>
                <div className={classes.ProfileHeaderContainer}>
                    { profileInfo }
                </div>
                <div className={classes.KanbanModeContainer}>
                    <ul className={classes.KanbanMode}>
                        <li 
                            className={this.state.showCreatedTokens ? classes.ActiveMode : ''}
                            onClick={() => {this.showKanbanHandler('creations')}}>
                            MY CREATIONS
                        </li>
                        <li 
                            className={this.state.showPurchasedTokens ? classes.ActiveMode : ''}
                            onClick={() => { this.showKanbanHandler('purchases')}}>
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
        // auth info
        userId: state.auth.userId,
        idToken: state.auth.idToken,
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
        loadingAddress: state.web3Address.loading,
        address: state.web3Address.address,
        balances: state.web3Address.balances,
        artworks: state.web3Address.artworks,
        listSupporters: state.web3Address.listSupporters,
        // firebase
        loadingFirebase: state.firebaseProfile.loading,
        profileInfo: state.firebaseProfile.profileInfo,
        errorFollow: state.firebaseProfile.errorFollow
    };
};

const mapDispatchToProps = dispatch => ({
    onGetWeb3Objects: () => dispatch( actions.getWeb3Objects() ),
    onGetWeb3Accounts: (web3) => dispatch( actions.getWeb3Accounts(web3) ),
    onFetchAddressInfo: ( web3, userAddress, methods ) => dispatch( 
        actions.fetchAddressInfo(web3, userAddress, methods)
    ),
    onFetchProfile: ( userAddress, idToken ) => dispatch(
        actions.fetchProfile(userAddress, idToken)
    ),
    onFollowUser: ( fromUserId, toUserAddres, idToken ) => dispatch(
        actions.followUser(fromUserId, toUserAddres, idToken)
    )
});

export default connect( mapStateToProps, mapDispatchToProps )( Profile );