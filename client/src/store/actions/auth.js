import axios from 'axios';
import axiosProfile from '../../axios-profiles';

import * as actionTypes from './actionTypes';

import { 
    clearActiveUserData, 
    fetchActiveUserData,
    fetchActiveUserDataSuccess,
    fetchEthereumInfo
} from './firebaseProfile';
import { 
    clearWeb3ObjectsState,
    getWeb3Objects,
    getAccountsFromBrowser,
    getAddressFromSeed 
} from './web3Objects';
import { clearWeb3AddressData } from './web3Address';
import { clearEventsData } from "./contractEvents";

// CHECK TIMEOUT
export const checkAuthTimeout = (expirationTime) => {
    return dispatch => {
        setTimeout(() => { dispatch(logout()); }, expirationTime*1000);
    };
};

// AUTH
export const authStart = ( ) => {
    return { type: actionTypes.AUTH_START };
};

export const authSuccess = ( idToken, userId ) => {
    return { type: actionTypes.AUTH_SUCCESS, idToken: idToken, userId: userId };
};

export const authFail = ( error ) => {
    return { type: actionTypes.AUTH_FAIL, error: error };
};

export const firebaseLogout = () => {
    localStorage.removeItem('idToken');
    localStorage.removeItem('expirationDate');
    localStorage.removeItem('userId');
    return { type: actionTypes.AUTH_LOGOUT };
};

export const logout = () => {
    return dispatch => {
        dispatch( firebaseLogout() );
        dispatch( clearActiveUserData() );
        dispatch( clearWeb3ObjectsState() );
        dispatch( clearWeb3AddressData() );
        dispatch( clearEventsData() );
    }
};

export const auth = ( email, password, isLogin, name, myEthereum, seeds ) => {
    return dispatch => {
        dispatch( authStart() );
        const authData = {
            email: email,
            password: password,
            returnSecureToken: true
        };
        let endpoint = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=';
        if ( isLogin ) {
            endpoint = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=';
        }
 
        axios.post(endpoint + process.env.REACT_APP_FIREBASE_API_KEY, authData)
            .then(response => {
                const userId = response.data.localId;
                const idToken = response.data.idToken;
                const expirationDate = new Date(new Date().getTime() + response.data.expiresIn * 1000);
                localStorage.setItem('userId', userId);
                localStorage.setItem('idToken', idToken);
                localStorage.setItem('expirationDate', expirationDate);

                // Register name if new user
                if ( !isLogin ) {
                    const publicPut = axiosProfile.put( '/profile/' + userId + '/publicInfo.json?auth=' + idToken, 
                        { name: name }
                    );
                    const privatePut = axiosProfile.put( '/profile/' + userId + '/privateInfo.json?auth=' + idToken, 
                        { myEthereum: myEthereum }
                    );
                    axios.all([publicPut, privatePut]).then(axios.spread((...responses) => {
                        dispatch( fetchActiveUserDataSuccess(userId, { name: name }, { myEthereum: myEthereum }) );
                        dispatch( fetchEthereumInfo(idToken) );
                        if ( myEthereum === 'custom' ) {
                            dispatch( getAddressFromSeed( seeds, true, userId, idToken ) );
                            dispatch( getWeb3Objects('custom', false, '') );
                        } else if ( myEthereum === 'browser' ) {
                            dispatch( getWeb3Objects('browser', false, '') );
                            dispatch( getAccountsFromBrowser(true, null, true, userId, idToken) );
                        }
                    })).catch(errors => {
                        console.log('errors = ', errors);
                    })
                } else if ( isLogin ) {
                    dispatch( fetchActiveUserData( userId, idToken ) );
                }

                dispatch( authSuccess( idToken, userId ) );
                dispatch( checkAuthTimeout( response.data.expiresIn ) );
            })
            .catch(error => {
                dispatch( authFail( error.response.data.error ) );
            });
    };
};

export const setAuthRedirectPath = ( path ) => {
    return { type: actionTypes.SET_AUTH_REDIRECT_PATH, path: path };
};

export const authCheckState = () => {
    return dispatch => {
        const idToken = localStorage.getItem('idToken');
        if ( !idToken ) {
            dispatch(logout());
        } else {
            const expirationDate = new Date(localStorage.getItem('expirationDate'));
            if (expirationDate <= new Date()) {
                dispatch(logout());
            } else {
                const userId = localStorage.getItem('userId');
                dispatch(authSuccess(idToken, userId));
                dispatch(checkAuthTimeout((expirationDate.getTime() - new Date().getTime()) / 1000 ));
                dispatch( fetchActiveUserData( userId, idToken ) );
            }   
        }
    };
};