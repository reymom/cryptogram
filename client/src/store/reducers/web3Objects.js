import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../utility';

const initialState = {
    web3: null,
    accounts: null,
    contract: null,
    loading: false,
}

const getWeb3ObjectsStart = ( state, action ) => {
    return updateObject( state, { loading: true } );
};

const getWeb3ObjectsSuccess = ( state, action ) => {
    return updateObject( state, {
        web3: action.web3,
        accounts: action.accounts,
        contract: action.contract,
        loading: false
    } );
};

const getWeb3ObjectsFail = ( state, action ) => {
    return updateObject( state, { loading: false } );
};

const reducer = ( state = initialState, action ) => {
    switch ( action.type ) {
        case actionTypes.GET_WEB3OBJECTS_START: return getWeb3ObjectsStart( state, action );
        case actionTypes.GET_WEB3OBJECTS_SUCCESS: return getWeb3ObjectsSuccess( state, action );
        case actionTypes.GET_WEB3OBJECTS_FAIL: return getWeb3ObjectsFail( state, action );
        default: return state;
    }
};

export default reducer;