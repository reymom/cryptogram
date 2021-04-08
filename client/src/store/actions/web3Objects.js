import * as actionTypes from './actionTypes';
import getWeb3 from '../getWeb3';

import Artworks from '../../artifacts/Artworks.json';

export const getWeb3ObjectsStart = () => {
    return {
        type: actionTypes.GET_WEB3OBJECTS_START,
    };
};

export const getWeb3ObjectsSuccess = ( web3, accounts, contract ) => {
    return {
        type: actionTypes.GET_WEB3OBJECTS_SUCCESS,
        web3: web3,
        accounts: accounts,
        contract: contract
    };
};

export const getWeb3ObjectsFail = ( error ) => {
    return {
        type: actionTypes.GET_WEB3OBJECTS_FAIL,
        error: error
    };
};

export const getWeb3Objects = ( ) => {
    return async (dispatch) => {
        dispatch(getWeb3ObjectsStart());
        try {
            const web3 = await getWeb3();
            const accounts = await web3.eth.getAccounts();
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = Artworks.networks[networkId];
            const contract = new web3.eth.Contract(
                Artworks.abi,
                deployedNetwork && deployedNetwork.address,
            );
            console.log('getWeb3ObjectsSuccess');
            console.log('contract = ', contract);
            dispatch(getWeb3ObjectsSuccess(web3, accounts, contract));
        } catch (error) {
            dispatch(getWeb3ObjectsFail(error));
        }
    };
};
