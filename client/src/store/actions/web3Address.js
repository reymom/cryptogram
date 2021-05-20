import * as actionTypes from './actionTypes';

import { sendSignedTransaction } from './sendSignedTransaction';

export const clearWeb3AddressData = () => {
    return { type: actionTypes.CLEAR_WEB3ADDRESS_DATA, }
};

// USER INFO
export const fetchAddressInfoStart = ( isActiveUser ) => {
    return { 
        type: actionTypes.FETCH_ADDRESSINFO_START, 
        isActiveUser: isActiveUser 
    };
};

export const fetchAddressInfoSuccess = ( 
    address,
    isManager,
    ethBalance,
    tokenBalance,
    numTokensCreated,
    numTokensBought,
    artworks,
    isActiveUser
) => {
    return {
        type: actionTypes.FETCH_ADDRESSINFO_SUCCESS,
        address: address,
        isManager: isManager,
        ethBalance: ethBalance,
        tokenBalance: tokenBalance,
        numTokensCreated: numTokensCreated,
        numTokensBought: numTokensBought,
        artworks: artworks,
        isActiveUser: isActiveUser
    };
};

export const fetchAddressInfoFail = ( error, isActiveUser ) => {
    return { type: actionTypes.FETCH_ADDRESSINFO_FAIL, error: error, isActiveUser: isActiveUser  };
};

export const fetchAddressInfo = ( web3, userAddress, methods, isActiveUser ) => {
    return async (dispatch) => {
        dispatch( fetchAddressInfoStart( isActiveUser ) );
        try {
            const ethBalance = web3.utils.fromWei(await web3.eth.getBalance(userAddress));
            const tokenBalance = await methods.balanceOf( userAddress ).call();
            const numTokensCreated = await methods.getNumTokensCreated(userAddress).call();
            const numTokensBought = await methods.getNumTokensBought(userAddress).call();
            const tokenList = await methods.getTokensOfOwner(userAddress).call();
            let artworks = [];
            for (var i = 0; i < tokenList.length; i++) {
                let artworkId = tokenList[i];
                let tokenObject = await methods.getTokenInfo(artworkId).call();
                let currentPrice = await methods.getCurrentPrice(artworkId).call();
                let supporters = await methods.getSupportersOfArtwork(artworkId).call();
                let tokenDict = {
                    id: artworkId,
                    creator: tokenObject[0],
                    owner: userAddress,
                    creationDate: tokenObject[1],
                    lastPurchaseDate: tokenObject[2],
                    priceSpent: tokenObject[3],
                    description: tokenObject[4],
                    tag: tokenObject[5],
                    IPFShash: tokenObject[6],
                    initialPrice: tokenObject[7],
                    currentPrice: currentPrice,
                    participationPercentage: tokenObject[8],
                    totalLikes: tokenObject[9],
                    supporters: supporters
                }
                artworks.push( tokenDict );
            }
            const manager = await methods.manager().call();
            const isManager = manager.toLowerCase() === userAddress.toLowerCase();

            dispatch(fetchAddressInfoSuccess(
                userAddress,
                isManager,
                ethBalance,
                tokenBalance,
                numTokensCreated,
                numTokensBought,
                artworks,
                isActiveUser
            ));
        } catch ( error ) {
            console.log('error = ', error);
            dispatch( fetchAddressInfoFail( error, isActiveUser ) );
        }
    };
};

// ETH BALANCE
export const getBalanceSuccess = ( ethBalance, isActiveUser ) => {
    return { 
        type: actionTypes.GET_BALANCE, 
        ethBalance: ethBalance, 
        isActiveUser: isActiveUser 
    };
};

export const getBalance = ( userAddress, web3, isActiveUser ) => {
    return async (dispatch) => {
        try {
            const ethBalance = web3.utils.fromWei(await web3.eth.getBalance(userAddress));
            dispatch( getBalanceSuccess( ethBalance, isActiveUser ) );
        } catch (error) {
            console.log('error = ', error);
        }
    };
};

// AVAILABLE FUNDS
export const fetchAvailableFundsStart = () => {
    return { type: actionTypes.FETCH_AVAILABLE_FUNDS_START, };
};

export const fetchAvailableFundsSuccess = ( availableFunds, lockedFunds ) => {
    return {
        type: actionTypes.FETCH_AVAILABLE_FUNDS_SUCCESS,
        availableFunds: availableFunds,
        lockedFunds: lockedFunds
    };
};

export const fetchAvailableFundsFail = ( ) => {
    return { type: actionTypes.FETCH_AVAILABLE_FUNDS_FAIL, };
};

export const fetchAvailableFunds = ( userAddress, web3, methods ) => {
    return async (dispatch) => {
        dispatch(fetchAvailableFundsStart());
        try {
            const availableFunds = web3.utils.fromWei(
                await methods.getAvailableFundsForSupporter(userAddress).call()
            );

            const manager = await methods.manager().call();
            const isManager = manager.toLowerCase() === userAddress.toLowerCase();

            let lockedFunds = 0;
            if ( isManager ) {
                lockedFunds = web3.utils.fromWei(
                    await methods.getLockedFunds().call({from: userAddress}, function(error, result){
                        console.log(error, result)
                    })
                );
            }
            dispatch(fetchAvailableFundsSuccess( availableFunds, lockedFunds ));
        } catch (error) {
            console.log('error = ', error);
            dispatch(fetchAvailableFundsFail(error));
        }
    };
};

// CLAIM REWARDS
export const claimRewardsStart = () => {
    return { type: actionTypes.CLAIM_REWARDS_START, };
};

export const claimRewardsSuccess = () => {
    return { type: actionTypes.CLAIM_REWARDS_SUCCESS, };
};

export const claimRewardsFail = ( error ) => {
    return { type: actionTypes.CLAIM_REWARDS_FAIL, errorGetFunds: error };
};

export const withdrawFundsSuccess = () => {
    return { type: actionTypes.WITHDRAW_FUNDS_SUCCESS, }
};

export const claimRewards = ( 
    userAddress, contract, web3IsManual, web3, wallet, gas, gasPrice, gasLimit 
) => {
    return async(dispatch) => {
        dispatch(claimRewardsStart());

        const manager = await contract.methods.manager().call();
        const isManager = manager.toLowerCase() === userAddress.toLowerCase();

        if ( !web3IsManual ) {
            dispatch( claimRewardsWithWeb3Browser( userAddress, web3, contract.methods ) );
            if ( isManager ) {
                dispatch( withdrawLockedFundsWithWeb3Browser(userAddress, web3, contract.methods) );
            }
        } else {
            dispatch( claimRewardsWithWeb3Manual(
                userAddress, contract, web3, wallet, gasPrice, gasLimit
            ) );
            if ( isManager ) {
                dispatch( withdrawLockedFundsWithWeb3Manual(
                    userAddress, contract, web3, wallet, gasPrice, gasLimit
                ) );
            }
        }
    };
};

// CLAIM WITH WEB3 FROM BROWSER
export const claimRewardsWithWeb3Browser = ( userAddress, web3, methods ) => {
    return dispatch => {
        methods.withdrawSupporterFunds()
            .send({ 
                from: userAddress, 
                // gas: 6721975, 
                // gasPrice: 100000000000
            })
            .then( response => {
                dispatch(claimRewardsSuccess());
                dispatch(getBalance(userAddress, web3, true));
            })
            .catch( error => {
                console.log('error = ', error);
                dispatch(fetchAvailableFundsFail(error.toString()));
            });
    };
};

export const claimRewardsWithWeb3Manual = (
    userAddress, contract, web3, wallet, gasPrice, gasLimit
) => {
    return dispatch => {
        const claimRewardsData = contract.methods.withdrawSupporterFunds();
        dispatch( sendSignedTransaction(
            'claim',
            userAddress,
            contract._address,
            0, gasPrice, gasLimit,
            claimRewardsData.encodeABI(),
            wallet.getPrivateKey(),
            web3,
            null
        ) );
    };
};

// WITHDRAW LOCKED FUNDS
export const withdrawLockedFundsWithWeb3Browser = ( userAddress, web3, methods ) => {
    return dispatch => {
        methods.withdrawLockedFunds()
            .send({ 
                from: userAddress, 
                // gas: 6721975, 
                // gasPrice: 100000000000
            })
            .then( response => {
                dispatch(withdrawFundsSuccess());
                dispatch(getBalance(userAddress, web3, true));
            })
            .catch( error => {
                console.log('error = ', error);
            });
    };
};

export const withdrawLockedFundsWithWeb3Manual = (
    userAddress, contract, web3, wallet, gasPrice, gasLimit
) => {
    return dispatch => {
        const withdrawLockedFunds = contract.methods.withdrawLockedFunds();
        dispatch( sendSignedTransaction(
            'withdraw',
            userAddress,
            contract._address,
            0, gasPrice, gasLimit,
            withdrawLockedFunds.encodeABI(),
            wallet.getPrivateKey(),
            web3,
            null
        ) );
    };
}