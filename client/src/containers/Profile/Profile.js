import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

import * as actions from '../../store/actions';
import classes from './Profile.module.css';

import Spinner from '../../components/UI/Spinner/Spinner';
import Modal from '../../components/UI/Modal/Modal';
import CreateToken from '../CreateToken/CreateToken';

class Profile extends React.Component {
    state = { creatingToken: false }

    componentDidMount = async () => {
        if ( !this.props.web3 || !this.props.accounts || !this.props.contract ) {
            await this.props.onGetWeb3Objects();
        }
        await this.props.onFetchAddressInfo(
            this.props.contract.methods,
            '0x8F806E70121E04e94Bda323a8d98440f9eC692Df'
        );
    }

    showCreateTokenModal = () => {
        this.setState({ creatingToken: true });
    }

    hideCreateTokenModal = () => {
        this.setState({ creatingToken: false });
    }

    clickSubmitNewToken = () => {
        this.hideCreateTokenModal();
    }

    render() {
        let createTokenForm = '';
        if (this.props.web3 && this.props.contract) {
            createTokenForm = <CreateToken
                clickCancel={this.hideCreateTokenModal}
                submitNewToken={this.clickSubmitNewToken}
            />
        }

        let kanban = <Spinner />;
        if (!this.props.loading && this.props.artworks) {
            console.log(this.props.artworks);
            kanban = this.props.artworks.map(artwork => {
                let src = 'https://ipfs.io/ipfs/' + artwork.IPFShash;
                return (
                    <div key={artwork.IPFShash} className={classes.GalleryItem} tabIndex="0">
                        <img src={src} alt={artwork.description} className={classes.GalleryImage}/> 
                        <div className={classes.GalleryItemInfo}>
                            <ul>
                                <li className={classes.GalleryItemLikes}>
                                    <span className={classes.VisuallyHidden}>Likes: </span>
                                    <FontAwesomeIcon className={classes.FontAwesomeIcon} icon={faHeart} size="lg"/>
                                    { artwork.totalLikes }
                                </li>
                            </ul>
                        </div>
                        <p>{ artwork.creator }</p>
                    </div>
                );
            });
        }
        return (
            <div>
                <Modal show={this.state.creatingToken} modalClosed={this.hideCreateTokenModal}>
                    { createTokenForm }
                </Modal>
                <div className={classes.Container}>
                    <div className={classes.Profile}>
                        <div className={classes.ProfileImage}>
                            <img 
                                src="https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?w=500&h=500&fit=crop" 
                                alt="#"
                            />
                        </div>
                        <div className={classes.ProfileUserSettings}>
                            <h1 className={classes.ProfileUserName}>{this.props.address}</h1>
                            <button className={[classes.Btn, classes.ProfileEditBtn].join(' ')}>
                                Edit Profile
                            </button>
                            <button 
                                onClick={this.showCreateTokenModal}
                                className={[classes.Btn, classes.CreateTokenBtn].join(' ')}>
                                Create Token
                            </button>
                        </div>
                        <div className={classes.ProfileStats}>
                            <ul>
                                <li>
                                    <span className={classes.ProfileStatCount}>
                                        <b>{this.props.balances.tokenBalance}</b>
                                    </span> Tokens
                                </li>
                                <li>
                                    <span className={classes.ProfileStatCount}>
                                        <b>{this.props.balances.numTokensCreated}</b>
                                    </span> Created
                                </li>
                                <li>
                                    <span className={classes.ProfileStatCount}>
                                        <b>{this.props.balances.numTokensBought}</b>
                                    </span> Bought
                                </li>
                            </ul>
                        </div>
                        <div className={classes.ProfileBio}>
                            <p>
                                <span className={classes.ProfileDescription}>
                                    Short description stored in firebase.
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className={classes.Container}>
                    <div className={classes.Gallery}>
                        { kanban }
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        web3: state.web3Objects.web3,
        accounts: state.web3Objects.accounts,
        contract: state.web3Objects.contract,
        balances: state.addressInfo.balances,
        artworks: state.addressInfo.artworks,
        listSupporters: state.addressInfo.listSupporters,
        loading: state.addressInfo.loading
    };
};

const mapDispatchToProps = dispatch => ({
    onGetWeb3Objects: () => dispatch( actions.getWeb3Objects() ),
    onFetchAddressInfo: ( userAddress, methods ) => dispatch( 
        actions.fetchAddressInfo(userAddress, methods)
    )
});

export default connect( mapStateToProps, mapDispatchToProps )( Profile );