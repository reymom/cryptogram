import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utility';

const initialState = {
    web3mode: '', // browser or custom
    // WEB3 INJECTION
    web3: null,
    loadingWeb3: false,
    errorWeb3: null,
    // LOAD CONTRACT
    contract: null,
    loadingContract: false,
    errorContract: null,
    // GET ACCOUNTS FROM BROWSER
    accounts: null,
    loadingAccounts: false,
    errorAccounts: null,
    // GET ADDRESS FROM SEED
    seeds: '',
    wallet: null,
    address: null,
    gettingAddress: false,
    errorAddress: null,
}

const clearWeb3ObjectsState = ( state, ) => {
    return updateObject( state, initialState );
};

// WEB3 INJECTION
const injectWeb3Start = ( state, ) => {
    return updateObject( state, { loadingWeb3: true } );
};

const injectWeb3Success = ( state, action ) => {
    return updateObject( state, { 
        web3: action.web3, 
        web3mode: action.web3mode, 
        loadingWeb3: false
    } );
};

const injectWeb3Fail = ( state, action ) => {
    return updateObject( state, { loadingWeb3: false, errorWeb3: action.error } );
};

// LOAD CONTRACT
const loadContractStart = ( state, ) => {
    return updateObject( state, { loadingContract: true } );
};

const loadContractSuccess = ( state, action ) => {
    return updateObject( state, { contract: action.contract, loadingContract: false } );
};

const loadContractFail = ( state, action ) => {
    return updateObject( state, { loadingContract: false, errorContract: action.error } );
};

// GET ACCOUNTS FROM BROWSER (METAMASK OR EQUIVALENT)
const getAccountsFromBrowserStart = ( state, ) => {
    return updateObject( state, { loadingAccounts: true } );
};

const getAccountsFromBrowserSuccess = ( state, action ) => {
    return updateObject( state, { accounts: action.accounts, loadingAccounts: false } );
};

const getAccountsFromBrowserFail = ( state, action ) => {
    return updateObject( state, { loadingAccounts: false, errorAccounts: action.error } );
};

// GET ADDRESS FROM SEED
const getAddressFromSeedStart = ( state, ) => {
    return updateObject( state, { gettingAddress: true } );
};

const getAddressFromSeedSuccess = ( state, action ) => {
    return updateObject( state, { 
        seeds: action.seeds,
        wallet: action.wallet,
        address: action.address,
        gettingAddress: false
    } );
};

const getAddressFromSeedFail = ( state, action ) => {
    return updateObject( state, { gettingAddress: false, errorAddress: action.error } );
};

// REDUCER
const reducer = ( state = initialState, action ) => {
    switch ( action.type ) {
        case actionTypes.CLEAR_WEB3OBJECTS_STATE: return clearWeb3ObjectsState( state, action );
        // WEB3 INJECTION
        case actionTypes.INJECT_WEB3_START: return injectWeb3Start( state, action );
        case actionTypes.INJECT_WEB3_SUCCESS: return injectWeb3Success( state, action );
        case actionTypes.INJECT_WEB3_FAIL: return injectWeb3Fail( state, action );
        // LOAD CONTRACT
        case actionTypes.LOAD_CONTRACT_START: return loadContractStart( state, action );
        case actionTypes.LOAD_CONTRACT_SUCCESS: return loadContractSuccess( state, action );
        case actionTypes.LOAD_CONTRACT_FAIL: return loadContractFail( state, action );

        // GET ACCOUNTS FROM BROWSER (METAMASK OR EQUIVALENT)
        case actionTypes.GET_ACCOUNTS_FROM_BROWSER_START: 
            return getAccountsFromBrowserStart( state, action );
        case actionTypes.GET_ACCOUNTS_FROM_BROWSER_SUCCESS: 
            return getAccountsFromBrowserSuccess( state, action );
        case actionTypes.GET_ACCOUNTS_FROM_BROWSER_FAIL: 
            return getAccountsFromBrowserFail( state, action );
        // GET ADDRESS FROM SEED
        case actionTypes.GET_ADDRESS_FROM_SEED_START: 
            return getAddressFromSeedStart( state, action );
        case actionTypes.GET_ADDRESS_FROM_SEED_SUCCESS: 
            return getAddressFromSeedSuccess( state, action );
        case actionTypes.GET_ADDRESS_FROM_SEED_FAIL: 
            return getAddressFromSeedFail( state, action );
        default: return state;
    }
};

export default reducer;