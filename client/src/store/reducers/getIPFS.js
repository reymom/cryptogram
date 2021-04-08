import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../utility';

const initialState = {
    IPFSInstance: null,
    loadingIPFS: false,
}

const getIPFSStart = ( state, action ) => {
    return updateObject( state, { loadingIPFS: true } );
};

const getIPFSSuccess = ( state, action ) => {
    return updateObject( state, {
        IPFSInstance: action.IPFSInstance,
        loadingIPFS: false
    } );
};

const getIPFSFail = ( state, action ) => {
    return updateObject( state, { loadingIPFS: false } );
};

const reducer = ( state = initialState, action ) => {
    switch ( action.type ) {
        case actionTypes.GET_IPFS_START: return getIPFSStart( state, action );
        case actionTypes.GET_IPFS_SUCCESS: return getIPFSSuccess( state, action );
        case actionTypes.GET_IPFS_FAIL: return getIPFSFail( state, action );
        default: return state;
    }
};

export default reducer;