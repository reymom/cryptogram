import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utility';

const initialState = {
    // web3 injection, get contract
    web3: null,
    contract: null,
    loadingWeb3: false,
    errorWeb3: null,
    // get accounts
    accounts: null,
    loadingAccounts: false,
    errorAccounts: null,
    // account creation
    seeds: '',
    wallet: null,
    account: null,
    creatingAccount: false,
    errorCreationAccount: null,
}

// inject web3 and get contract
const getWeb3ObjectsStart = ( state, ) => {
    return updateObject( state, { loadingWeb3: true } );
};

const getWeb3ObjectsSuccess = ( state, action ) => {
    return updateObject( state, {
        web3: action.web3,
        contract: action.contract,
        loadingWeb3: false
    } );
};

const getWeb3ObjectsFail = ( state, action ) => {
    return updateObject( state, { loadingWeb3: false, errorWeb3: action.error } );
};

// get accounts
const getWeb3AccountsStart = ( state, ) => {
    return updateObject( state, { loadingAccounts: true } );
};

const getWeb3AccountsSuccess = ( state, action ) => {
    return updateObject( state, { accounts: action.accounts, loadingAccounts: false } );
};

const getWeb3AccountsFail = ( state, action ) => {
    return updateObject( state, { loadingAccounts: false, errorAccounts: action.error } );
};

// create account
const createAccountStart = ( state, ) => {
    return updateObject( state, { creatingAccount: true } );
};

const createAccountSuccess = ( state, action ) => {
    return updateObject( state, { 
        creatingAccount: false,
        seeds: action.seeds,
        wallet: action.wallet,
        account: action.account
    } );
};

const createAccountFail = ( state, action ) => {
    return updateObject( state, { 
        creatingAccount: false, 
        errorCreationAccount: action.error 
    } );
};

//reducer
const reducer = ( state = initialState, action ) => {
    switch ( action.type ) {
        // inject web3 and contract
        case actionTypes.GET_WEB3OBJECTS_START: return getWeb3ObjectsStart( state, action );
        case actionTypes.GET_WEB3OBJECTS_SUCCESS: return getWeb3ObjectsSuccess( state, action );
        case actionTypes.GET_WEB3OBJECTS_FAIL: return getWeb3ObjectsFail( state, action );
        // get accounts
        case actionTypes.GET_WEB3ACCOUNTS_START: return getWeb3AccountsStart( state, action );
        case actionTypes.GET_WEB3ACCOUNTS_SUCCESS: return getWeb3AccountsSuccess( state, action );
        case actionTypes.GET_WEB3ACCOUNTS_FAIL: return getWeb3AccountsFail( state, action );
        // create account
        case actionTypes.CREATE_ACCOUNT_START: return createAccountStart( state, action );
        case actionTypes.CREATE_ACCOUNT_SUCCESS: return createAccountSuccess( state, action );
        case actionTypes.CREATE_ACCOUNT_FAIL: return createAccountFail( state, action );
        default: return state;
    }
};

export default reducer;