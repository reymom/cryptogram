import React from 'react';
import { connect } from 'react-redux';

import * as actions from '../../store/actions';
import classes from './Profile.module.css';
import emptyProfilePic from '../../assets/persona.png';

import Spinner from '../../components/UI/Spinner/Spinner';
import Modal from '../../components/UI/Modal/Modal';
import EditProfile from '../EditProfile/EditProfile';
import CreateArtwork from '../CreateArtwork/CreateArtwork';
import KanbanArtworks from '../KanbanArtworks/KanbanArtworks';

class Profile extends React.Component {
    state = { creatingArtwork: false, editingProfile: false }

    componentDidMount = async () => {

        if ( !this.props.web3 || !this.props.accounts || !this.props.contract ) {
            await this.props.onGetWeb3Objects();
        }

        let userId;
        let userAddress;
        if (this.props.match.path === '/profile' && this.props.accounts) {
            userId = this.props.userId;
            userAddress = this.props.accounts[1];
        } else if (this.props.match.params.id) {
            userAddress = this.props.match.params.id;
        }
        await this.props.onFetchProfile(userId, this.props.idToken);

        if ( this.props.contract && (!this.props.address | this.props.address !== userAddress)) {
            await this.props.onFetchAddressInfo(
                this.props.contract.methods,
                userAddress
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
        if (this.props.web3 && this.props.contract) {
            createArtworkForm = <CreateArtwork
                clickCancel={this.hideModal}
                clickSubmitNewArtwork={this.clickSubmitted}
            />
        }

        let editProfileForm;
        if (this.props.profileInfo) {
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
        if (this.props.accounts) {
            if (!this.props.match.params.id || (this.props.match.params.id !== this.props.accounts[0])) {
                profileButtons =
                    <React.Fragment>
                        <button 
                            onClick={() => {this.showModal('Edit Profile')} }
                            className={[classes.Button, classes.ProfileEditBtn].join(' ')}>
                            Edit Profile
                        </button>
                        <button 
                            onClick={() => {this.showModal('Create Artwork')} }
                            className={[classes.Button, classes.CreateArtworkBtn].join(' ')}>
                            Create Artwork
                        </button>
                    </React.Fragment>
            } else {
                profileButtons =
                    <React.Fragment>
                        <button 
                            onClick={() => { this.followButtonHandler() }}
                            className={[classes.Button, classes.FollowButton].join(' ')}>
                            Follow
                        </button>
                    </React.Fragment>
            }
        }

        // PROFILE SECTION
        let profileInfo;
        if (!this.props.loadingFirebase && this.props.address) {
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
                    </div>
                </React.Fragment>
            )
        }

        // kanban
        let kanbanArtworks = <Spinner />
        if (!this.props.loading && this.props.web3 && this.props.contract) {
            kanbanArtworks = <KanbanArtworks />;
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
        // web3 objects
        web3: state.web3Objects.web3,
        accounts: state.web3Objects.accounts,
        contract: state.web3Objects.contract,
        loadingWeb3: state.web3Objects.loading,
        // address info
        address: state.web3Address.address,
        balances: state.web3Address.balances,
        artworks: state.web3Address.artworks,
        listSupporters: state.web3Address.listSupporters,
        loadingAddress: state.web3Address.loading,
        // firebase
        loadingFirebase: state.firebaseProfile.loading,
        errorFollow: state.firebaseProfile.errorFollow,
        profileInfo: state.firebaseProfile.profileInfo
    };
};

const mapDispatchToProps = dispatch => ({
    onGetWeb3Objects: () => dispatch( actions.getWeb3Objects() ),
    onFetchAddressInfo: ( userAddress, methods ) => dispatch( 
        actions.fetchAddressInfo(userAddress, methods)
    ),
    onFetchProfile: ( userAddress, idToken ) => dispatch(
        actions.fetchProfile(userAddress, idToken)
    ),
    onFollowUser: ( fromUserId, toUserAddres, idToken ) => dispatch(
        actions.followUser(fromUserId, toUserAddres, idToken)
    )
});

export default connect( mapStateToProps, mapDispatchToProps )( Profile );