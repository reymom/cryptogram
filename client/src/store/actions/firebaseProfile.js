import axios from 'axios';
import axiosProfile from '../../axios-profiles';

import * as actionTypes from './actionTypes';

import { getWeb3Objects } from './web3Objects';

// REGISTER WALLET
export const registerWalletStart = ( ) => {
    return { type: actionTypes.REGISTER_WALLET_START, };
};

export const registerWalletSuccess = ( userId, address ) => {
    return { 
        type: actionTypes.REGISTER_WALLET_SUCCESS, 
        userId: userId,
        address: address
    };
};

export const registerWalletFail = ( error ) => {
    return { type: actionTypes.REGISTER_WALLET_FAIL, error: error, };
};

export const registerWallet = ( seeds, address, userId, idToken ) => {
    return dispatch => {
        // console.log('[registerWallet]');
        dispatch(registerWalletStart());
        const publicPatch = axiosProfile.patch(
            '/profile/' + userId + '/publicInfo.json?auth=' + idToken, 
            { address: address }  
        )
        const privatePatch = axiosProfile.patch(
            '/profile/' + userId + '/privateInfo.json?auth=' + idToken, 
            { seeds: seeds }
        );
        axios.all([publicPatch, privatePatch]).then(axios.spread((...responses) => {
            // console.log('response publicPatch = ', responses[0]);
            // console.log('response privatePatch = ', responses[1]);
            dispatch( registerWalletSuccess( userId, address ) );
        })).catch(errors => {
            console.log('errors = ', errors);
            dispatch( registerWalletFail( errors ) );
        })
    };
};

// FETCH GAS STATION
export const fetchGasSuccess = ( gasStation ) => {
    return {
        type: actionTypes.FETCH_GAS_SUCCESS,
        gasStation: gasStation
    }
}

export const fetchGasFail = () => {
    return { type: actionTypes.FETCH_GAS_FAIL }
}

export const fetchGas = ( idToken ) => {
    return dispatch => {
        axiosProfile.get( '/gasStation.json?auth=' + idToken)
            .then( response => {
                let gasStation = response.data;
                dispatch( fetchGasSuccess( gasStation ) );
            } )
            .catch( error => {
                console.log('error = ', error);
                dispatch( fetchGasFail() );
            } );
    };
}

// FETCH ACTIVE USER DATA
export const fetchActiveUserDataStart = ( ) => {
    return { type: actionTypes.FETCH_ACTIVE_USER_DATA_START };
}

export const fetchActiveUserDataSuccess = ( userId, publicInfo, privateInfo ) => {
    return {
        type: actionTypes.FETCH_ACTIVE_USER_DATA_SUCCESS,
        userId: userId,
        publicInfo: publicInfo,
        privateInfo: privateInfo
    }
}

export const fetchActiveUserDataFail = ( error ) => {
    return { type: actionTypes.FETCH_ACTIVE_USER_DATA_FAIL, error: error }
}

export const fetchActiveUserData = ( userId, idToken ) => {
    return dispatch => {
        dispatch( fetchActiveUserDataStart( userId ) );
        dispatch( fetchGas(idToken) );
        const getPubicData = axiosProfile.get(
            '/profile/' + userId + '/publicInfo.json?auth=' + idToken
        );
        const getPrivateData = axiosProfile.get(
            '/profile/' + userId + '/privateInfo.json?auth=' + idToken
        );
        axios.all([getPubicData, getPrivateData]).then(axios.spread((...responses) => {
            // console.log('response getPubicData = ', responses[0]);
            // console.log('response getPrivateData = ', responses[1]);
            dispatch( fetchActiveUserDataSuccess( userId, responses[0].data, responses[1].data ) );
            
            let web3mode = 'custom';
            if ( responses[1].data.myEthereum === 'browser' ) { web3mode = 'browser'; }
            let seeds = responses[1].data.seeds;
            dispatch( getWeb3Objects( web3mode, true, seeds ) );
        })).catch(errors => {
            console.log('errors = ', errors);
            dispatch( fetchActiveUserDataFail( errors ) );
        })
    };
}

export const clearActiveUserData = () => {
    return { type: actionTypes.CLEAR_ACTIVE_USER_DATA, }
}

// GET USERID FROM ADDRESS
export const getUserIdFromAddressSuccess = ( userId, userName, imageSrc, userAddress ) => {
    return { 
        type: actionTypes.GET_USERID_FROM_ADDRESS_SUCCESS, 
        userId: userId,
        userName: userName,
        imageSrc: imageSrc,
        userAddress: userAddress
    };
};

export const getUserIdFromAddressFail = ( error ) => {
    return { type: actionTypes.GET_USERID_FROM_ADDRESS_FAIL, error: error };
};

export const getUserIdFromAddress = ( userAddress, idToken ) => {
    return dispatch => {
        const queryParams = '&orderBy="publicInfo/address"&equalTo="' + userAddress.toLowerCase() + '"';
        console.log('userAddress = ', userAddress);
        axiosProfile.get( '/profile.json?auth=' + idToken + queryParams)
            .then( response => {
                let userId = Object.keys(response.data)[0];
                dispatch( getUserIdFromAddressSuccess( 
                    userId, 
                    response.data[userId].publicInfo.name,
                    response.data[userId].publicInfo.imageSrc, 
                    userAddress 
                ) );
            } )
            .catch( error => {
                console.log('error = ', error);
                dispatch( getUserIdFromAddressFail( error ) );
            } );
    };
};

// FETCH PROFILE
export const fetchProfileStart = () => {
    return { type: actionTypes.FETCH_PROFILE_START };
};

export const fetchProfileSuccess = ( userId, profileInfo ) => {
    return { 
        type: actionTypes.FETCH_PROFILE_SUCCESS, 
        userId: userId, 
        profileInfo: profileInfo 
    };
};

export const fetchProfileFail = ( error ) => {
    return { type: actionTypes.FETCH_PROFILE_FAIL, error: error };
};

export const fetchProfile = ( userId, idToken ) => {
    return dispatch => {
        dispatch( fetchProfileStart() );
        axiosProfile.get( '/profile/' + userId + '/publicInfo.json?auth=' + idToken)
            .then( response => {
                const fetchedProfile = {};
                for ( let key in response.data ) {
                    fetchedProfile.key = response.data[key];
                }
                dispatch( fetchProfileSuccess( userId, response.data ) );
            } )
            .catch( error => {
                dispatch( fetchProfileFail( error ) );
            } );
    };
};

// EDIT PROFILE
export const editProfileStart = () => {
    return { type: actionTypes.EDIT_PROFILE_START };
};

export const editProfileSuccess = () => {
    return { type: actionTypes.EDIT_PROFILE_SUCCESS };
};

export const editProfileFail = ( errorEdit ) => {
    return { type: actionTypes.EDIT_PROFILE_FAIL, errorEdit: errorEdit };
};

export const editProfile = ( fromUserId, idToken, data ) => {
    return dispatch => {
        dispatch( editProfileStart() );
        axiosProfile.patch( '/profile/' + fromUserId + '/publicInfo.json?auth=' + idToken, 
            data
        )
            .then( response => {
                console.log('response = ', response);
                dispatch( editProfileSuccess( ) );
                // refetch changes
                dispatch( fetchActiveUserData( fromUserId, idToken ) );
            } )
            .catch( errorEdit => {
                console.log('errorEdit = ', errorEdit);
                dispatch( editProfileFail( errorEdit ) );
            } );
    };
};

// FOLLOW USER
export const followUserStart = () => {
    return { type: actionTypes.FOLLOW_USER_START };
};

export const followUserSuccess = ( unfollow, newFollow, newFollower ) => {
    return { 
        type: actionTypes.FOLLOW_USER_SUCCESS, 
        unfollow: unfollow, 
        newFollow: newFollow,
        newFollower: newFollower
    };
};

export const followUserFail = ( errorFollow ) => {
    return { type: actionTypes.FOLLOW_USER_FAIL, errorFollow: errorFollow };
};

export const followUser = ( fromUserId, fromAddress, toUserId, toAddress, idToken, unfollow ) => {
    return dispatch => {
        dispatch( followUserStart() );

        if ( !unfollow ) {
            const axiosFollower = axiosProfile.patch(
                '/profile/' + fromUserId + '/publicInfo/following.json?auth=' + idToken, 
                {[toUserId]: toAddress}
            );
            const axiosFollowed = axiosProfile.patch( 
                '/profile/' + toUserId + '/publicInfo/followers.json?auth=' + idToken,
                { [fromUserId]: fromAddress }
            );

            axios.all([axiosFollower, axiosFollowed]).then(axios.spread((...responses) => {
                dispatch( followUserSuccess( unfollow, {[toUserId]: toAddress}, { [fromUserId]: fromAddress } ) );
            })).catch(errors => {
                console.log('errors = ', errors);
                dispatch( followUserFail( errors ) );
            });
        }  else if ( unfollow ) {
            const axiosFollower = axiosProfile.delete( 
                '/profile/' + fromUserId + '/publicInfo/following/' + toUserId + '.json?auth=' + idToken 
            );
            const axiosFollowed = axiosProfile.delete( 
                '/profile/' + toUserId + '/publicInfo/followers/' + fromUserId + '.json?auth=' + idToken 
            );

            axios.all([axiosFollower, axiosFollowed]).then(axios.spread((...responses) => {
                console.log('response[0] = ', responses[0]);
                console.log('response[1] = ', responses[1]);
                dispatch( followUserSuccess( unfollow, toUserId, fromUserId ) );
            })).catch(errors => {
                console.log('errors = ', errors);
                dispatch( followUserFail( errors ) );
            });
        }

    };
};