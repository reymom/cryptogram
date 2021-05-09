// FIREBASE AUTHENTICATION ( auth )
export const AUTH_START = 'AUTH_START';
export const AUTH_SUCCESS = 'AUTH_SUCCESS';
export const AUTH_FAIL = 'AUTH_FAIL';
export const AUTH_LOGOUT = 'AUTH_LOGOUT';

export const SET_AUTH_REDIRECT_PATH = 'SET_AUTH_REDIRECT_PATH';

// FIREBASE DATABASE ( firebaseProfile )
export const REGISTER_WALLET_START = 'REGISTER_WALLET_START';
export const REGISTER_WALLET_SUCCESS = 'REGISTER_WALLET_SUCCESS';
export const REGISTER_WALLET_FAIL = 'REGISTER_WALLET_FAIL';

export const FETCH_GAS_SUCCESS = 'FETCH_GAS_SUCCESS';
export const FETCH_GAS_FAIL= 'FETCH_GAS_FAIL';

export const FETCH_ACTIVE_USER_DATA_START = 'FETCH_ACTIVE_USER_DATA_START';
export const FETCH_ACTIVE_USER_DATA_SUCCESS = 'FETCH_ACTIVE_USER_DATA_SUCCESS';
export const FETCH_ACTIVE_USER_DATA_FAIL = 'FETCH_ACTIVE_USER_DATA_FAIL';

export const CLEAR_ACTIVE_USER_DATA = 'CLEAR_ACTIVE_USER_DATA';

export const GET_USERID_FROM_ADDRESS_SUCCESS = 'GET_USERID_FROM_ADDRESS_SUCCESS';
export const GET_USERID_FROM_ADDRESS_FAIL = 'GET_USERID_FROM_ADDRESS_FAIL';

export const FETCH_PROFILE_START = 'FETCH_PROFILE_START';
export const FETCH_PROFILE_SUCCESS = 'FETCH_PROFILE_SUCCESS';
export const FETCH_PROFILE_FAIL = 'FETCH_PROFILE_FAIL';

export const EDIT_PROFILE_START = 'EDIT_PROFILE_START';
export const EDIT_PROFILE_SUCCESS = 'EDIT_PROFILE_SUCCESS';
export const EDIT_PROFILE_FAIL = 'EDIT_PROFILE_FAIL';

export const FOLLOW_USER_START = 'FOLLOW_USER_START';
export const FOLLOW_USER_SUCCESS = 'FOLLOW_USER_SUCCESS';
export const FOLLOW_USER_FAIL = 'FOLLOW_USER_FAIL';

// web3 injection, contract and accounts ( web3Objects )
export const CLEAR_WEB3OBJECTS_STATE = 'CLEAR_WEB3OBJECTS_STATE';

export const INJECT_WEB3_START = 'INJECT_WEB3_START';
export const INJECT_WEB3_SUCCESS = 'INJECT_WEB3_SUCCESS';
export const INJECT_WEB3_FAIL = 'INJECT_WEB3_FAIL';

export const LOAD_CONTRACT_START = 'LOAD_CONTRACT_START';
export const LOAD_CONTRACT_SUCCESS = 'LOAD_CONTRACT_SUCCESS';
export const LOAD_CONTRACT_FAIL = 'LOAD_CONTRACT_FAIL';

export const GET_ACCOUNTS_FROM_BROWSER_START = 'GET_ACCOUNTS_FROM_BROWSER_START';
export const GET_ACCOUNTS_FROM_BROWSER_SUCCESS = 'GET_ACCOUNTS_FROM_BROWSER_SUCCESS';
export const GET_ACCOUNTS_FROM_BROWSER_FAIL = 'GET_ACCOUNTS_FROM_BROWSER_FAIL';

export const GET_ADDRESS_FROM_SEED_START = 'GET_ADDRESS_FROM_SEED_START';
export const GET_ADDRESS_FROM_SEED_SUCCESS = 'GET_ADDRESS_FROM_SEED_SUCCESS';
export const GET_ADDRESS_FROM_SEED_FAIL = 'GET_ADDRESS_FROM_SEED_FAIL';

// web3 addresses data ( web3Address )
export const CLEAR_WEB3ADDRESS_DATA = 'CLEAR_WEB3ADDRESS_DATA';

export const FETCH_ADDRESSINFO_START = 'FETCH_ADDRESSINFO_START';
export const FETCH_ADDRESSINFO_SUCCESS = 'FETCH_ADDRESSINFO_SUCCESS';
export const FETCH_ADDRESSINFO_FAIL = 'FETCH_ADDRESSINFO_FAIL';

export const FETCH_AVAILABLE_FUNDS_START = 'FETCH_AVAILABLE_FUNDS_START';
export const FETCH_AVAILABLE_FUNDS_SUCCESS = 'FETCH_AVAILABLE_FUNDS_SUCCESS';
export const FETCH_AVAILABLE_FUNDS_FAIL = 'FETCH_AVAILABLE_FUNDS_FAIL';

export const GET_BALANCE = 'GET_BALANCE';

export const CLAIM_REWARDS_START = 'CLAIM_REWARDS_START';
export const CLAIM_REWARDS_SUCCESS = 'CLAIM_REWARDS_SUCCESS';
export const CLAIM_REWARDS_FAIL = 'CLAIM_REWARDS_FAIL';

// contract interaction ( artwork )
export const FETCH_ARTWORKS_START = 'FETCH_ARTWORKS_START';
export const FETCH_ARTWORKS_SUCCESS = 'FETCH_ARTWORKS_SUCCESS';
export const FETCH_ARTWORKS_FAIL = 'FETCH_ARTWORKS_FAIL';

export const FETCH_ARTWORK_START = 'FETCH_ARTWORK_START';
export const FETCH_ARTWORK_SUCCESS = 'FETCH_ARTWORK_SUCCESS';
export const FETCH_ARTWORK_FAIL = 'FETCH_ARTWORK_FAIL';

export const CREATE_ARTWORK_START = 'CREATE_ARTWORK_START';
export const CREATE_ARTWORK_SUCCESS = 'CREATE_ARTWORK_SUCCESS';
export const CREATE_ARTWORK_FAIL = 'CREATE_ARTWORK_FAIL';

export const SUPPORT_ARTWORK_START = 'SUPPORT_ARTWORK_START';
export const SUPPORT_ARTWORK_SUCCESS = 'SUPPORT_ARTWORK_SUCCESS';
export const SUPPORT_ARTWORK_FAIL = 'SUPPORT_ARTWORK_FAIL';
export const CLEAR_SUPPORT_STATE = 'CLEAR_SUPPORT_STATE';

export const PURCHASE_ARTWORK_START = 'PURCHASE_ARTWORK_START';
export const PURCHASE_ARTWORK_SUCCESS = 'PURCHASE_ARTWORK_SUCCESS';
export const PURCHASE_ARTWORK_FAIL = 'PURCHASE_ARTWORK_FAIL';
export const CLEAR_PURCHASE_STATE = 'CLEAR_PURCHASE_STATE';

// ( contractEvents )
export const CLEAR_EVENTS_DATA = 'CLEAR_EVENTS_DATA';

export const FETCH_EVENTS_START = 'FETCH_EVENTS_START';
export const FETCH_EVENTS_SUCCESS = 'FETCH_EVENTS_SUCCESS';
export const FETCH_EVENTS_FAIL = 'FETCH_EVENTS_FAIL';

export const SET_EVENT_VISITED = 'SET_EVENT_VISITED';

// ipfs ( IPFS )
export const GET_IPFS_START = 'GET_IPFS_START';
export const GET_IPFS_SUCCESS = 'GET_IPFS_SUCCESS';
export const GET_IPFS_FAIL = 'GET_IPFS_FAIL';