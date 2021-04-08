import * as actionTypes from './actionTypes';
import * as IPFS from "ipfs-http-client";

export const getIPFSStart = () => {
    return {
        type: actionTypes.GET_IPFS_START,
    };
};

export const getIPFSSuccess = ( IPFSInstance ) => {
    return {
        type: actionTypes.GET_IPFS_SUCCESS,
        IPFSInstance: IPFSInstance,
    };
};

export const getIPFSFail = ( error ) => {
    return {
        type: actionTypes.GET_IPFS_FAIL,
        error: error
    };
};

export const getIPFS = ( ) => {
    return async (dispatch) => {
        dispatch(getIPFSStart());
        try {
            const IPFSInstance = new IPFS({
                host: 'ipfs.infura.io',
                port: '5001',
                protocol: 'https',
                apiPath: '/api/v0'
            });
            dispatch(getIPFSSuccess(IPFSInstance));
        } catch (error) {
            dispatch(getIPFSFail(error));
        }
    };
};
