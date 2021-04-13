import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../utility';

const initialState = {
    loading: false,
    profileInfo: null,
    errorFollow: null,
    errorEdit: null
};

const followUserStart = ( state, action ) => {
    return updateObject( state, { loading: true } );
};

const followUserSuccess = ( state, action ) => {
    return updateObject( state, { loading: false } );
};

const followUserFail = ( state, action ) => {
    return updateObject( state, { loading: false, errorFollow: action.errorFollow } );
};

const editProfileStart = ( state, action ) => {
    return updateObject( state, { loading: true } );
};

const editProfileSuccess = ( state, action ) => {
    return updateObject( state, { loading: false } );
};

const editProfileFail = ( state, action ) => {
    return updateObject( state, { loading: false, errorEdit: action.errorEdit } );
};

const fetchProfileStart = ( state, action ) => {
    return updateObject( state, { loading: true } );
};

const fetchProfileSuccess = ( state, action ) => {
    return updateObject( state, {
        loading: false,
        profileInfo: action.profileInfo
    } );
};

const fetchProfileFail = ( state, action ) => {
    return updateObject( state, { loading: false } );
};

const reducer = ( state = initialState, action ) => {
    switch ( action.type ) {
        case actionTypes.FOLLOW_USER_START: return followUserStart( state, action );
        case actionTypes.FOLLOW_USER_SUCCESS: return followUserSuccess( state, action );
        case actionTypes.FOLLOW_USER_FAIL: return followUserFail( state, action );
        case actionTypes.EDIT_PROFILE_START: return editProfileStart( state, action );
        case actionTypes.EDIT_PROFILE_SUCCESS: return editProfileSuccess( state, action );
        case actionTypes.EDIT_PROFILE_FAIL: return editProfileFail( state, action );
        case actionTypes.FETCH_PROFILE_START: return fetchProfileStart( state, action );
        case actionTypes.FETCH_PROFILE_SUCCESS: return fetchProfileSuccess( state, action );
        case actionTypes.FETCH_PROFILE_FAIL: return fetchProfileFail( state, action );
        default: return state;
    }
};

export default reducer;