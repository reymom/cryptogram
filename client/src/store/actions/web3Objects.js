import * as Mnemonic from 'bitcore-mnemonic';
import * as bip39 from 'bip39';
import { hdkey } from 'ethereumjs-wallet';
import * as util from 'ethereumjs-util';

import * as actionTypes from './actionTypes';
import getWeb3 from '../../shared/getWeb3';
import { registerWallet } from './firebaseProfile';

import Artworks from '../../artifacts/Artworks.json';

export const clearWeb3ObjectsState = () => {
    return { type: actionTypes.CLEAR_WEB3OBJECTS_STATE, };
};

// WEB3 INJECTION
export const injectWeb3Start = () => {
    return { type: actionTypes.INJECT_WEB3_START, };
};

export const injectWeb3Success = ( web3, web3mode ) => {
    return { 
        type: actionTypes.INJECT_WEB3_SUCCESS, 
        web3: web3, 
        web3mode: web3mode 
    };
};

export const injectWeb3Fail = ( error ) => {
    return { type: actionTypes.INJECT_WEB3_FAIL, error: error };
};

// DISPATCH WEB3 INJECTION AND LATER CONTRACT AND ADDRESSES
export const getWeb3Objects = ( web3mode, getAccounts, seeds ) => {
    return async (dispatch) => {
        dispatch( injectWeb3Start( ) );
        try {
            const web3 = await getWeb3( web3mode );
            dispatch( injectWeb3Success( web3, web3mode ) );
            dispatch( loadContract( web3 ) );

            if ( getAccounts ) {
                if ( web3mode === 'custom' ) {
                    dispatch( getAddressFromSeed(seeds, false, null, null) );
                } else if ( web3mode === 'browser' ) {
                    console.log('web3mode = browser');
                    dispatch( getAccountsFromBrowser(true, null) );
                }
            }

        } catch (error) {
            console.log('error = ', error);
            dispatch( injectWeb3Fail( error ) );
        }
    }
}

// LOAD CONTRACT
export const loadContractStart = () => {
    return { type: actionTypes.LOAD_CONTRACT_START, };
};

export const loadContractSuccess = ( contract ) => {
    return { type: actionTypes.LOAD_CONTRACT_SUCCESS, contract: contract };
};

export const loadContractFail = ( error ) => {
    return { type: actionTypes.LOAD_CONTRACT_FAIL, error: error };
};

export const loadContract = ( web3 ) => {
    return async (dispatch) => {
        dispatch( loadContractStart() );
        try {
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = Artworks.networks[networkId];
            const contract = new web3.eth.Contract(
                Artworks.abi,
                deployedNetwork && deployedNetwork.address,
            );
            dispatch( loadContractSuccess(contract) );
        } catch (error) {
            dispatch( loadContractFail(error) );
        }

    }
}

// GET ACCOUNTS FROM BROWSER (METAMASK OR EQUIVALENT)
export const getAccountsFromBrowserStart = () => {
    return { type: actionTypes.GET_ACCOUNTS_FROM_BROWSER_START, web3Mode: 'browser' };
};

export const getAccountsFromBrowserSuccess = ( accounts ) => {
    return { type: actionTypes.GET_ACCOUNTS_FROM_BROWSER_SUCCESS, accounts: accounts, };
};

export const getAccountsFromBrowserFail = ( error ) => {
    return { type: actionTypes.GET_ACCOUNTS_FROM_BROWSER_FAIL, error: error };
};

export const getAccountsFromBrowser = (
    request, newAccount, firebaseRegister, userId, idToken
) => {
    return async ( dispatch ) => {
        dispatch( getAccountsFromBrowserStart() );
        try {
            // const accounts = await web3.eth.getAccounts();
            let accounts;
            if ( request ) {
                accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            } else {accounts = [newAccount]}
            dispatch( getAccountsFromBrowserSuccess( accounts ) );
            if ( firebaseRegister ) {
                dispatch( registerWallet( '', accounts[0], userId, idToken ) );
            }
        } catch ( error ) {
            console.log('error = ', error);
            dispatch( getAccountsFromBrowserFail( error ) );
        }
    };
};

// GET ADDRESS FROM SEED AND REGISTER IF NEEDED
export const getAddressFromSeedStart = () => {
    return { type: actionTypes.GET_ADDRESS_FROM_SEED_START, web3Mode: 'custom' };
};

export const getAddressFromSeedSuccess = ( seeds, wallet, address ) => {
    return { 
        type: actionTypes.GET_ADDRESS_FROM_SEED_SUCCESS,
        seeds: seeds,
        wallet: wallet, 
        address: address 
    };
};

export const getAddressFromSeedFail = ( error ) => {
    return { type: actionTypes.GET_ADDRESS_FROM_SEED_FAIL, error: error };
};

export const getAddressFromSeed = ( seeds, firebaseRegister, userId, idToken ) => {
    return async(dispatch) => {
        dispatch( getAddressFromSeedStart() );
        try {
            let seedPhrase = seeds;
            if ( !seeds ) {
                seedPhrase = (new Mnemonic(Mnemonic.Words.ENGLISH)).toString();
            }
            const mnemonic = new Mnemonic(seedPhrase);
            bip39.mnemonicToSeed(mnemonic.toString()).then(async seed => {
                var path = "m/44'/60'/0'/0/0";
                var wallet = hdkey.fromMasterSeed(seed).derivePath(path).getWallet();
                var privateKey = wallet.getPrivateKey();
                var publicKey = util.privateToPublic(privateKey);
                var address = '0x' + util.pubToAddress(publicKey).toString('hex');

                dispatch( getAddressFromSeedSuccess( seedPhrase, wallet, address ) );

                if ( firebaseRegister ) {
                    dispatch( registerWallet( seedPhrase, address, userId, idToken ) );
                }
            });
        } catch (error) {
            console.log('error = ', error);
            dispatch( getAddressFromSeedFail( error ) );
        }
    };
};