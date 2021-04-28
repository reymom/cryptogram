import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utility';

const initialState = {
    address: '',
    // balances
    balances: null,
    artworks: null,
    loading: false,
    // funds
    availableFunds: null,
    processingGetFunds: false,
    errorGetFunds: null
}

// address info
const fetchAddressInfoStart = ( state, ) => {
    return updateObject( state, { loading: true } );
};

const fetchAddressInfoSuccess = ( state, action ) => {
    return updateObject( state, {
        address: action.address,
        balances: {
            ethBalance: action.ethBalance,
            tokenBalance: action.tokenBalance,
            numTokensCreated: action.numTokensCreated,
            numTokensBought: action.numTokensBought,
        },
        artworks: action.artworks,
        loading: false
    } );
};

const fetchAddressInfoFail = ( state, ) => {
    return updateObject( state, { loading: false } );
};

// available funds
const fetchAvailableFundsStart = ( state, ) => {
    return updateObject( state, { loading: true } );
};

const fetchAvailableFundsSuccess = ( state, action ) => {
    return updateObject( state, {
        loading: false,
        availableFunds: action.availableFunds,
    } );
};

const fetchAvailableFundsFail = ( state, ) => {
    return updateObject( state, { loading: false } );
};

// balance
const getBalanceSuccess = ( state, action ) => {
    return updateObject( state, { 
        balances: {...state.balances, ethBalance: action.ethBalance}
    } );
};

// claim rewards
const claimRewardsStart = ( state, ) => {
    return updateObject( state, { processingGetFunds: true } );
};

const claimRewardsSuccess = ( state, ) => {
    return updateObject( state, { 
        processingGetFunds: false,
        availableFunds: 0
    } );
};

const claimRewardsFail = ( state, action ) => {
    return updateObject( state, { 
        processingGetFunds: false,
        errorGetFunds: action.errorGetFunds
    } );
};

// reducer
const reducer = ( state = initialState, action ) => {
    switch ( action.type ) {
        // address info
        case actionTypes.FETCH_ADDRESSINFO_START: return fetchAddressInfoStart( state, action );
        case actionTypes.FETCH_ADDRESSINFO_SUCCESS: return fetchAddressInfoSuccess( state, action );
        case actionTypes.FETCH_ADDRESSINFO_FAIL: return fetchAddressInfoFail( state, action );
        // get available funds
        case actionTypes.FETCH_AVAILABLE_FUNDS_START: return fetchAvailableFundsStart( state, action );
        case actionTypes.FETCH_AVAILABLE_FUNDS_SUCCESS: return fetchAvailableFundsSuccess( state, action );
        case actionTypes.FETCH_AVAILABLE_FUNDS_FAIL: return fetchAvailableFundsFail( state, action );
        // get balance
        case actionTypes.GET_BALANCE: return getBalanceSuccess( state, action );
        // claim rewards
        case actionTypes.CLAIM_REWARDS_START: return claimRewardsStart( state, action );
        case actionTypes.CLAIM_REWARDS_SUCCESS: return claimRewardsSuccess( state, action );
        case actionTypes.CLAIM_REWARDS_FAIL: return claimRewardsFail( state, action );
        default: return state;
    }
};

export default reducer;