import * as actionTypes from './actionTypes';
import axios from '../../axios-profiles';

export const followUserStart = () => {
    return {
        type: actionTypes.FOLLOW_USER_START
    };
};

export const followUserSuccess = () => {
    return {
        type: actionTypes.FOLLOW_USER_SUCCESS
    };
};

export const followUserFail = ( errorFollow ) => {
    return {
        type: actionTypes.FOLLOW_USER_FAIL,
        errorFollow: errorFollow
    };
};

export const followUser = ( fromUserId, toUserAddress, idToken ) => {
    return dispatch => {
        dispatch( followUserStart() );
        // add followed in follower
        axios.patch( '/profile/' + fromUserId + '/publicInfo/following.json?auth=' + idToken, 
            {[toUserAddress]: true}
        )
            .then( followingResponse => {
                console.log('followingResponse = ', followingResponse);
                // add follower in followed
                axios.patch( '/profile/' + toUserAddress + '/publicInfo/followers.json?auth=' + idToken,
                    {[fromUserId]: true}
                )
                    .then( followerResponse => {
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

export const editProfileStart = () => {
    return {
        type: actionTypes.EDIT_PROFILE_START
    };
};

export const editProfileSuccess = () => {
    return {
        type: actionTypes.EDIT_PROFILE_SUCCESS
    };
};

export const editProfileFail = ( errorEdit ) => {
    return {
        type: actionTypes.EDIT_PROFILE_FAIL,
        errorEdit: errorEdit
    };
};

export const editProfile = ( fromUserId, idToken, data ) => {
    return dispatch => {
        dispatch( editProfileStart() );
        axios.patch( '/profile/' + fromUserId + '/publicInfo.json?auth=' + idToken, data)
            .then( response => {
                console.log('response = ', response);
                dispatch( editProfileSuccess( ) );
            } )
            .catch( errorEdit => {
                dispatch( editProfileFail( errorEdit ) );
            } );
    };
};

export const fetchProfileStart = () => {
    return {
        type: actionTypes.FETCH_PROFILE_START
    };
};

export const fetchProfileSuccess = ( profileInfo ) => {
    return {
        type: actionTypes.FETCH_PROFILE_SUCCESS,
        profileInfo: profileInfo
    };
};

export const fetchProfileFail = () => {
    return {
        type: actionTypes.FETCH_PROFILE_FAIL,
    };
};

export const fetchProfile = ( userAddress, idToken ) => {
    return dispatch => {
        dispatch( fetchProfileStart() );
        axios.get( '/profile/' + userAddress + '/publicInfo.json?auth=' + idToken)
            .then( response => {
                const fetchedProfile = {};
                for ( let key in response.data ) {
                    fetchedProfile.key = response.data[key];
                }
                dispatch( fetchProfileSuccess( response.data ) );
            } )
            .catch( errorEdit => {
                dispatch( fetchProfileFail( errorEdit ) );
            } );
    };
};
