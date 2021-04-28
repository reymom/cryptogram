import axios from 'axios';
import axiosProfile from '../../axios-profiles';

import * as actionTypes from './actionTypes';

import { createAccount } from './web3Objects';

export const authStart = () => {
    return {
        type: actionTypes.AUTH_START
    };
};

export const authSuccess = ( idToken, userId ) => {
    return {
        type: actionTypes.AUTH_SUCCESS,
        idToken: idToken,
        userId: userId
    };
};

export const authFail = (error) => {
    return {
        type: actionTypes.AUTH_FAIL,
        error: error
    };
};

export const logout = () => {
    localStorage.removeItem('idToken');
    localStorage.removeItem('expirationDate');
    localStorage.removeItem('userId');
    return {
        type: actionTypes.AUTH_LOGOUT
    };
};

export const checkAuthTimeout = (expirationTime) => {
    return dispatch => {
        setTimeout(() => {
            dispatch(logout());
        }, expirationTime*1000);
    };
};

export const auth = ( email, password, isLogin, name, myEthereum ) => {
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
                    console.log('name = ', name, 'myEthereum = ', myEthereum);

                    const publicPut = axiosProfile.put( '/profile/' + userId + '/publicInfo.json?auth=' + idToken, 
                        { name: name }
                    );
                    const privatePut = axiosProfile.put( '/profile/' + userId + '/privateInfo.json?auth=' + idToken, 
                        { myEthereum: myEthereum }
                    );
                    axios.all([publicPut, privatePut]).then(axios.spread((...responses) => {
                        console.log('responsePublic = ', responses[0]);
                        console.log('responsePrivate = ', responses[1]);
                    })).catch(errors => {
                        console.log('errors = ', errors);
                    })

                    dispatch( createAccount( userId, idToken ) );
                }
                
                dispatch(authSuccess( idToken, userId ));
                dispatch(checkAuthTimeout( response.data.expiresIn ));
            })
            .catch(error => {
                dispatch(authFail( error.response.data.error ));
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
            }   
        }
    };
};