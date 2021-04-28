import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utility';

const initialState = {
    // FETCH PROFILE
    user: null,
    profileInfo: null,
    errorFetchInfo: null,
    loading: false,
    // FOLLOW AND EDIT
    errorFollow: null,
    errorEdit: null,
    // REGISTER WALLET
    registering: false,
    registered: false,
    errorRegisterWallet: null,
};

// REGISTER WALLET
const registerWalletStart = ( state, ) => {
    return updateObject( state, { registering: true } );
};

const registerWalletSuccess = ( state, ) => {
    return updateObject( state, { registering: false, registered: true } );
};

const registerWalletFail = ( state, action ) => {
    return updateObject( state, { 
        registering: false, 
        errorRegisterWallet: action.error
    } );
};

// GET USERID FROM ADDRESS
const getUserIdFromAddressSuccess = ( state, action ) => {
    return updateObject( state, { 
        registered: true,
        user: { userId: action.userId, userAddress: action.userAddress }
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
    return updateObject( state, { loading: true } );
};

const fetchProfileSuccess = ( state, action ) => {
    return updateObject( state, {
        loading: false,
        profileInfo: action.profileInfo
    } );
};

const fetchProfileFail = ( state, action ) => {
    return updateObject( state, { 
        loading: false,
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

const followUserSuccess = ( state, ) => {
    return updateObject( state, { loading: false } );
};

const followUserFail = ( state, action ) => {
    return updateObject( state, { loading: false, errorFollow: action.errorFollow } );
};

// REDUCER
const reducer = ( state = initialState, action ) => {
    switch ( action.type ) {
        // REGISTER WALLET
        case actionTypes.REGISTER_WALLET_START: return registerWalletStart( state, action );
        case actionTypes.REGISTER_WALLET_SUCCESS: return registerWalletSuccess( state, action );
        case actionTypes.REGISTER_WALLET_FAIL: return registerWalletFail( state, action );
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