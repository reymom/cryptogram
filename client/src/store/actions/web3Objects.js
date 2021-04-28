import * as Mnemonic from 'bitcore-mnemonic';
import * as bip39 from 'bip39';
import { hdkey } from 'ethereumjs-wallet';
import * as util from 'ethereumjs-util';

import * as actionTypes from './actionTypes';
import getWeb3 from '../../shared/getWeb3';
import { registerWallet } from './firebaseProfile';

import Artworks from '../../artifacts/Artworks.json';

// web3 injection and get contract
export const getWeb3ObjectsStart = () => {
    return { type: actionTypes.GET_WEB3OBJECTS_START, };
};

export const getWeb3ObjectsSuccess = ( web3, contract ) => {
    return {
        type: actionTypes.GET_WEB3OBJECTS_SUCCESS,
        web3: web3,
        contract: contract
    };
};

export const getWeb3ObjectsFail = ( error ) => {
    return { type: actionTypes.GET_WEB3OBJECTS_FAIL, error: error };
};

export const getWeb3Objects = ( ) => {
    return async (dispatch) => {
        dispatch( getWeb3ObjectsStart() );
        try {
            // console.log('getting web3 objects');
            const web3 = await getWeb3('infura');
            console.log('web3 :)');
            const networkId = await web3.eth.net.getId();
            console.log('networkId = ', networkId);
            const deployedNetwork = Artworks.networks[networkId];
            console.log('deployedNetwork = ', deployedNetwork);
            // const contract = new web3.eth.Contract(
            //     Artworks.abi,
            //     deployedNetwork && deployedNetwork.address,
            // );
            const contract = { name: 'temporalmente vacío' };
            console.log('contract = ', contract);
            dispatch(getWeb3ObjectsSuccess(web3, contract));
        } catch (error) {
            console.log('error = ', error);
            dispatch( getWeb3ObjectsFail( error ) );
        }
    };
};

// get accounts
export const getWeb3AccountsStart = () => {
    return { type: actionTypes.GET_WEB3ACCOUNTS_START, };
};

export const getWeb3AccountsSuccess = ( accounts ) => {
    return { type: actionTypes.GET_WEB3ACCOUNTS_SUCCESS, accounts: accounts, };
};

export const getWeb3AccountsFail = ( error ) => {
    return { type: actionTypes.GET_WEB3ACCOUNTS_FAIL, error: error };
};

export const getWeb3Accounts = ( web3 ) => {
    return async (dispatch) => {
        dispatch( getWeb3AccountsStart() );
        try {
            const accounts = await web3.eth.getAccounts();
            console.log('accounts = ', accounts);
            dispatch( getWeb3AccountsSuccess( accounts ) );
        } catch (error) {
            console.log('error = ', error);
            dispatch( getWeb3AccountsFail( error ) );
        }
    };
};

// web3 account creation
export const createAccountStart = () => {
    return { type: actionTypes.CREATE_ACCOUNT_START, };
};

export const createAccountSuccess = ( seeds, wallet, account ) => {
    return { 
        type: actionTypes.CREATE_ACCOUNT_SUCCESS,
        seeds: seeds,
        wallet: wallet, 
        account: account 
    };
};

export const createAccountFail = ( error ) => {
    return { type: actionTypes.CREATE_ACCOUNT_FAIL, error: error };
};

export const createAccount = ( userId, idToken ) => {
    return async(dispatch) => {
        dispatch( createAccountStart() );
        console.log('[createAccount]');
        try {
            const seeds = (new Mnemonic(Mnemonic.Words.ENGLISH)).toString();
            const mnemonic = new Mnemonic(seeds);
            bip39.mnemonicToSeed(mnemonic.toString()).then(async seed => {
                var path = "m/44'/60'/0'/0/0";
                var wallet = hdkey.fromMasterSeed(seed).derivePath(path).getWallet();
                var privateKey = wallet.getPrivateKey();
                var publicKey = util.privateToPublic(privateKey);
                var address = '0x' + util.pubToAddress(publicKey).toString('hex');
                console.log('wallet, address = ', wallet, address);
                dispatch( createAccountSuccess( seeds, wallet, address ) );
                dispatch( registerWallet( seeds, wallet, address, userId, idToken ) );
            });
        } catch (error) {
            console.log('error = ', error);
            dispatch(createAccountFail( error ));
        }
    };
};