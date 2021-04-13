import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../utility';

const initialState = {
    address: '',
    balances: 0,
    tokenBalance: 0,
    numTokensCreated: 0,
    numTokensBought: 0,
    artworks: [],
    listSupporters: [],
    loading: false
}

const fetchAddressInfoStart = ( state, action ) => {
    return updateObject( state, { loading: true } );
};

const fetchAddressInfoSuccess = ( state, action ) => {
    return updateObject( state, {
        address: action.address,
        balances: {
            tokenBalance: action.tokenBalance,
            numTokensCreated: action.numTokensCreated,
            numTokensBought: action.numTokensBought,
        },
        artworks: action.artworks,
        listSupporters: action.listSupporters,
        loading: false
    } );
};

const fetchAddressInfoFail = ( state, action ) => {
    return updateObject( state, { loading: false } );
};

const reducer = ( state = initialState, action ) => {
    switch ( action.type ) {
        case actionTypes.FETCH_ADDRESSINFO_START: return fetchAddressInfoStart( state, action );
        case actionTypes.FETCH_ADDRESSINFO_SUCCESS: return fetchAddressInfoSuccess( state, action );
        case actionTypes.FETCH_ADDRESSINFO_FAIL: return fetchAddressInfoFail( state, action );
        default: return state;
    }
};

export default reducer;