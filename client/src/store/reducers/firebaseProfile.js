import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utility';

const initialState = {
    // WALLET REGISTER
    registering: false,
    registered: false,
    errorRegisterWallet: null,
    // FETCH GAS
    gasStation: null,
    // FETCH ACTIVE USER
    activeUser: null,
    activeUserInfo: null,
    fetchingActiveUser: false,
    errorFetchingActiveUser: null,
    // FETCH EXTERNAL PROFILE
    profile: null,
    profileInfo: null,
    fetchingProfile: false,
    errorFetchInfo: null,
    // PROBABLE NEXT VISIT
    nextProfile: null,
    // FOLLOW AND EDIT
    errorFollow: null,
    errorEdit: null,
};

// WALLET REGISTER
const registerWalletStart = ( state, ) => {
    return updateObject( state, { registering: true } );
};

const registerWalletSuccess = ( state, action ) => {
    return updateObject( state, { 
        registering: false, 
        registered: true,
        activeUser: { userId: action.userId, userAddress: action.address, }
    } );
};

const registerWalletFail = ( state, action ) => {
    return updateObject( state, { 
        registering: false, 
        errorRegisterWallet: action.error
    } );
};

// FETCH GAS
const fetchGasSuccess = ( state, action ) => {
    return updateObject( state, { gasStation: action.gasStation } );
}

const fetchGasFail = ( state, ) => {
    return updateObject( state, { 
        gasStation: {
            fast: { gasPrice: "72000000000"},
            fastest: { gasPrice: "79000000000"},
            safeLow: { gasPrice: "60000000000"}
        }
    } );
}

// FETCH ACTIVE USER DATA
const fetchActiveUserDataStart = ( state, ) => {
    return updateObject( state, { fetchingActiveUser: true } );
}

const fetchActiveUserDataSuccess = ( state, action ) => {
    return updateObject( state, { 
        fetchingActiveUser: false,
        activeUser: { userId: action.userId, userAddress: action.publicInfo.address },
        activeUserInfo: {
            public: action.publicInfo,
            private: action.privateInfo
        }
    } );
}

const fetchActiveUserDataFail = ( state, action ) => {
    return updateObject( state, { 
        fetchingActiveUser: false, 
        errorFetchingActiveUser: action.error
    } );
}

const clearActiveUserData = ( state, ) => {
    return updateObject( state, {
        activeUser: null,
        activeUserInfo: null,
        fetchingActiveUser: false,
        errorFetchingActiveUser: null,
    } );
}

// GET USERID FROM ADDRESS
const getUserIdFromAddressSuccess = ( state, action ) => {
    return updateObject( state, { 
        registered: true,
        nextProfile: { 
            userId: action.userId, 
            userName: action.userName,
            imageSrc: action.imageSrc, 
            userAddress: action.userAddress
        }
    });
}

const getUserIdFromAddressFail = ( state, action ) => {
    return updateObject( state, { 
        registered: false,
        errorFetchInfo: action.error
    } );
}

// FETCH PROFILE
const fetchProfileStart = ( state, ) => {
    return updateObject( state, { fetchingProfile: true } );
};

const fetchProfileSuccess = ( state, action ) => {
    return updateObject( state, {
        fetchingProfile: false,
        profileInfo: action.profileInfo,
        profile: { userId: action.userId, userAddress: action.profileInfo.address }
    } );
};

const fetchProfileFail = ( state, action ) => {
    return updateObject( state, { 
        fetchingProfile: false,
        errorFetchInfo: action.error
    } );
};

// EDIT PROFILE
const editProfileStart = ( state, ) => {
    return updateObject( state, { loading: true } );
};

const editProfileSuccess = ( state, ) => {
    return updateObject( state, { loading: false } );
};

const editProfileFail = ( state, action ) => {
    return updateObject( state, { loading: false, errorEdit: action.errorEdit } );
};

// FOLLOW USER
const followUserStart = ( state, ) => {
    return updateObject( state, { loading: true } );
};

const followUserSuccess = ( state, action ) => {

    let newFollowing;
    let newFollowers;
    if ( !action.unfollow ) {

        newFollowing = {
            ...state.activeUserInfo.public.following, 
            ...action.newFollow
        };
        
        newFollowers = {
            ...state.profileInfo.following,
            ...action.newFollower
        };
    } else if ( action.unfollow ) {
        let following = state.activeUserInfo.public.following;
        newFollowing = Object.keys(following)
            .filter(key => key !== action.newFollow)
            .reduce((object, key) => {
                object[key] = following[key];
                return object;
            }, {});
        let followers = state.profileInfo.followers;
        newFollowers = Object.keys(followers)
            .filter(key => key !== action.newFollower)
            .reduce((object, key) => {
                object[key] = followers[key];
                return object;
            }, {});
    }

    let object = {
        activeUserInfo: {
            ...state.activeUserInfo,
            public: {
                ...state.activeUserInfo.public,
                following: newFollowing
            }
        },
        profileInfo: {
            ...state.profileInfo,
            followers: newFollowers
        },
        loading: false
    }

    return updateObject( state, object );
};

const followUserFail = ( state, action ) => {
    return updateObject( state, { loading: false, errorFollow: action.errorFollow } );
};

// REDUCER
const reducer = ( state = initialState, action ) => {
    switch ( action.type ) {
        // WALLET REGISTER
        case actionTypes.REGISTER_WALLET_START: return registerWalletStart( state, action );
        case actionTypes.REGISTER_WALLET_SUCCESS: return registerWalletSuccess( state, action );
        case actionTypes.REGISTER_WALLET_FAIL: return registerWalletFail( state, action );
        // FETCH GAS
        case actionTypes.FETCH_GAS_SUCCESS: return fetchGasSuccess( state, action );
        case actionTypes.FETCH_GAS_FAIL: return fetchGasFail( state, action );
        // FETCH ACTIVE USER DATA
        case actionTypes.FETCH_ACTIVE_USER_DATA_START: return fetchActiveUserDataStart( state, action );
        case actionTypes.FETCH_ACTIVE_USER_DATA_SUCCESS: return fetchActiveUserDataSuccess( state, action );
        case actionTypes.FETCH_ACTIVE_USER_DATA_FAIL: return fetchActiveUserDataFail( state, action );
        case actionTypes.CLEAR_ACTIVE_USER_DATA: return clearActiveUserData( state, action );
        // GET USERID FROM ADDRESS
        case actionTypes.GET_USERID_FROM_ADDRESS_SUCCESS: 
            return getUserIdFromAddressSuccess( state, action );
        case actionTypes.GET_USERID_FROM_ADDRESS_FAIL: 
            return getUserIdFromAddressFail( state, action );
        // FETCH PROFILE
        case actionTypes.FETCH_PROFILE_START: return fetchProfileStart( state, action );
        case actionTypes.FETCH_PROFILE_SUCCESS: return fetchProfileSuccess( state, action );
        case actionTypes.FETCH_PROFILE_FAIL: return fetchProfileFail( state, action );
        // EDIT PROFILE
        case actionTypes.EDIT_PROFILE_START: return editProfileStart( state, action );
        case actionTypes.EDIT_PROFILE_SUCCESS: return editProfileSuccess( state, action );
        case actionTypes.EDIT_PROFILE_FAIL: return editProfileFail( state, action );
        // FOLLOW USER
        case actionTypes.FOLLOW_USER_START: return followUserStart( state, action );
        case actionTypes.FOLLOW_USER_SUCCESS: return followUserSuccess( state, action );
        case actionTypes.FOLLOW_USER_FAIL: return followUserFail( state, action );
        default: return state;
    }
};

export default reducer;