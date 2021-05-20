import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utility';

const initialState = {
    // ACTIVE USER INFO
    addressActive: null,
    isManager: false,
    balancesActive: null,
    artworksActive: null,
    fetchingInfoActive: false,
    // EXTERNAL USER INFO
    address: '',
    balances: null,
    artworks: null,
    fetchingInfo: false,
    // AVAILABLE FUNDS (ACTIVE USER)
    availableFunds: null,
    lockedFunds: 0,
    gettingAvailableFunds: false,
    claimingFunds: false,
    errorClaimFunds: null
}

const clearWeb3AddressData = (state, ) => {
    return updateObject( state, initialState );
};

// USER INFO
const fetchAddressInfoStart = ( state, action ) => {
    let object;
    if ( action.isActiveUser ) { 
        object = { fetchingInfoActive: true };
    } else {
        object = { fetchingInfo: true };
    }
    return updateObject( state, object );
};

const fetchAddressInfoSuccess = ( state, action ) => {
    let object;
    if ( action.isActiveUser ) {
        object = {
            addressActive: action.address,
            isManager: action.isManager,
            balancesActive: {
                ethBalance: action.ethBalance,
                tokenBalance: action.tokenBalance,
                numTokensCreated: action.numTokensCreated,
                numTokensBought: action.numTokensBought,
            },
            artworksActive: action.artworks,
            fetchingInfoActive: false,
        };
    } else {
        object = {
            address: action.address,
            balances: {
                ethBalance: action.ethBalance,
                tokenBalance: action.tokenBalance,
                numTokensCreated: action.numTokensCreated,
                numTokensBought: action.numTokensBought,
            },
            artworks: action.artworks,
            fetchingInfo: false
        };
    }

    return updateObject( state, object );
};

const fetchAddressInfoFail = ( state, action ) => {
    let object;
    if ( action.isActiveUser ) { 
        object = { fetchingInfoActive: false };
    } else {
        object = { fetchingInfo: false };
    }
    return updateObject( state, object );
};

// ETH BALANCE
const getBalanceSuccess = ( state, action ) => {
    let object;
    if ( action.isActiveUser ) { 
        object = { balancesActive: { ...state.balancesActive, ethBalance: action.ethBalance } };
    } else {
        object = { balances: { ...state.balances, ethBalance: action.ethBalance } };
    }
    return updateObject( state, object );
};

// AVAILABLE FUNDS (ACTIVE USER)
const fetchAvailableFundsStart = ( state, ) => {
    return updateObject( state, { gettingAvailableFunds: true } );
};

const fetchAvailableFundsSuccess = ( state, action ) => {
    return updateObject( state, {
        gettingAvailableFunds: false,
        availableFunds: action.availableFunds,
        lockedFunds: action.lockedFunds
    } );
};

const fetchAvailableFundsFail = ( state, ) => {
    return updateObject( state, { gettingAvailableFunds: false } );
};

// ACTIVE USER CLAIM REWARDS
const claimRewardsStart = ( state, ) => {
    return updateObject( state, { claimingFunds: true } );
};

const claimRewardsSuccess = ( state, ) => {
    return updateObject( state, { availableFunds: 0, claimingFunds: false } );
};

const claimRewardsFail = ( state, action ) => {
    return updateObject( state, { 
        errorClaimFunds: action.errorGetFunds, 
        claimingFunds: false 
    } );
};

const withdrawFundsSuccess = ( state, ) => {
    return updateObject( state, { lockedFunds: 0 } );
}

// REDUCER
const reducer = ( state = initialState, action ) => {
    switch ( action.type ) {
        // CLEAR ACTIVE USER DATA
        case actionTypes.CLEAR_WEB3ADDRESS_DATA : return clearWeb3AddressData( state, action );
        // USER INFO
        case actionTypes.FETCH_ADDRESSINFO_START: return fetchAddressInfoStart( state, action );
        case actionTypes.FETCH_ADDRESSINFO_SUCCESS: return fetchAddressInfoSuccess( state, action );
        case actionTypes.FETCH_ADDRESSINFO_FAIL: return fetchAddressInfoFail( state, action );
        // BALANCE
        case actionTypes.GET_BALANCE: return getBalanceSuccess( state, action );
        // AVAILABLE FUNDS (ACTIVE USER)
        case actionTypes.FETCH_AVAILABLE_FUNDS_START: return fetchAvailableFundsStart( state, action );
        case actionTypes.FETCH_AVAILABLE_FUNDS_SUCCESS: return fetchAvailableFundsSuccess( state, action );
        case actionTypes.FETCH_AVAILABLE_FUNDS_FAIL: return fetchAvailableFundsFail( state, action );
        // CLAIM REWARDS (ACTIVE USER)
        case actionTypes.CLAIM_REWARDS_START: return claimRewardsStart( state, action );
        case actionTypes.CLAIM_REWARDS_SUCCESS: return claimRewardsSuccess( state, action );
        case actionTypes.CLAIM_REWARDS_FAIL: return claimRewardsFail( state, action );
        case actionTypes.WITHDRAW_FUNDS_SUCCESS: return withdrawFundsSuccess( state, action );
        default: return state;
    }
};

export default reducer;