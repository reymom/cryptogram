import axios from 'axios';
import axiosProfile from '../../axios-profiles';

import * as actionTypes from './actionTypes';

// REGISTER WALLET
export const registerWalletStart = ( ) => {
    return { type: actionTypes.REGISTER_WALLET_START, };
};

export const registerWalletSuccess = ( ) => {
    return { type: actionTypes.REGISTER_WALLET_SUCCESS, };
};

export const registerWalletFail = ( error ) => {
    return { type: actionTypes.REGISTER_WALLET_FAIL, error: error, };
};

export const registerWallet = ( seeds, wallet, address, userId, idToken ) => {
    return dispatch => {
        console.log('[registerWallet]');
        dispatch(registerWalletStart());
        const privatePatch = axiosProfile.patch(
            '/profile/' + userId + '/privateInfo.json?auth=' + idToken, 
            { seeds: seeds, wallet: wallet }
        );
        const mappingPatch = axiosProfile.patch(
            '/usersAddresses/mapping.json?auth=' + idToken, 
            { [address]: userId }
        );
        axios.all([privatePatch, mappingPatch]).then(axios.spread((...responses) => {
            console.log('responsePrivate = ', responses[0]);
            console.log('responseMapping = ', responses[1]);
            dispatch(registerWalletSuccess());
        })).catch(errors => {
            console.log('errors = ', errors);
            dispatch(registerWalletFail(errors));
        })
    };
};

// GET USERID FROM ADDRESS
export const getUserIdFromAddressSuccess = ( userId, userAddress ) => {
    return { 
        type: actionTypes.GET_USERID_FROM_ADDRESS_SUCCESS, 
        userId: userId,
        userAddress: userAddress
    };
};

export const getUserIdFromAddressFail = ( error ) => {
    return { type: actionTypes.GET_USERID_FROM_ADDRESS_FAIL, error: error };
};

export const getUserIdFromAddress = ( userAddress, idToken ) => {
    return dispatch => {
        const queryParams = '&equalTo="' + userAddress + '"';
        axiosProfile.get( '/usersAddresses/mapping.json?auth=' + idToken + queryParams)
            .then( response => {
                console.log('response.data = ', response.data);
                dispatch( getUserIdFromAddressSuccess( response.data[userAddress], userAddress ) );
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

export const fetchProfileSuccess = ( profileInfo ) => {
    return { type: actionTypes.FETCH_PROFILE_SUCCESS, profileInfo: profileInfo };
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
                dispatch( fetchProfileSuccess( response.data ) );
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
            } )
            .catch( errorEdit => {
                dispatch( editProfileFail( errorEdit ) );
            } );
    };
};

// FOLLOW USER
export const followUserStart = () => {
    return { type: actionTypes.FOLLOW_USER_START };
};

export const followUserSuccess = () => {
    return { type: actionTypes.FOLLOW_USER_SUCCESS };
};

export const followUserFail = ( errorFollow ) => {
    return { type: actionTypes.FOLLOW_USER_FAIL, errorFollow: errorFollow };
};

export const followUser = ( fromUserId, toUserAddress, idToken ) => {
    return dispatch => {
        dispatch( followUserStart() );
        // add followed in follower
        axiosProfile.patch( '/profile/' + fromUserId + '/publicInfo/following.json?auth=' + idToken, 
            {[toUserAddress]: true}
        )
            .then( followingResponse => {
                console.log('followingResponse = ', followingResponse);
                // add follower in followed
                axiosProfile.patch( '/profile/' + toUserAddress + '/publicInfo/followers.json?auth=' + idToken,
                    {[fromUserId]: true}
                ).then( followerResponse => {
                    dispatch( followUserSuccess( ) );
                    console.log('followerResponse = ', followerResponse);
                })
                .catch( followerError => {
                    dispatch( followUserFail( followerError ) );
                })
            } )
            .catch( errorFollow => {
                dispatch( followUserFail( errorFollow ) );
            } );
    };
};