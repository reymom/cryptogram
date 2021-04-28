import * as actionTypes from './actionTypes';

export const fetchAddressInfoStart = () => {
    return {
        type: actionTypes.FETCH_ADDRESSINFO_START,
    };
};

export const fetchAddressInfoSuccess = ( 
    address,
    ethBalance,
    tokenBalance,
    numTokensCreated,
    numTokensBought,
    artworks,
) => {
    return {
        type: actionTypes.FETCH_ADDRESSINFO_SUCCESS,
        address: address,
        ethBalance: ethBalance,
        tokenBalance: tokenBalance,
        numTokensCreated: numTokensCreated,
        numTokensBought: numTokensBought,
        artworks: artworks
    };
};

export const fetchAddressInfoFail = ( error ) => {
    return {
        type: actionTypes.FETCH_ADDRESSINFO_FAIL,
        error: error
    };
};

export const fetchAddressInfo = ( web3, userAddress, methods ) => {
    return async (dispatch) => {
        dispatch(fetchAddressInfoStart());
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
                    participationPercentage: tokenObject[8],
                    totalLikes: tokenObject[9],
                    supporters: supporters
                }
                artworks.push( tokenDict );
            }
            console.log('artworks = ', artworks);
            dispatch(fetchAddressInfoSuccess(
                userAddress,
                ethBalance,
                tokenBalance,
                numTokensCreated,
                numTokensBought,
                artworks,
            ));
        } catch (error) {
            console.log('error = ', error);
            dispatch(fetchAddressInfoFail(error));
        }
    };
};

export const fetchAvailableFundsStart = () => {
    return {
        type: actionTypes.FETCH_AVAILABLE_FUNDS_START,
    };
};

export const fetchAvailableFundsSuccess = ( availableFunds ) => {
    return {
        type: actionTypes.FETCH_AVAILABLE_FUNDS_SUCCESS,
        availableFunds: availableFunds
    };
};

export const fetchAvailableFundsFail = ( ) => {
    return {
        type: actionTypes.FETCH_AVAILABLE_FUNDS_FAIL,
    };
};

export const fetchAvailableFunds = ( userAddress, web3, methods ) => {
    return async (dispatch) => {
        dispatch(fetchAvailableFundsStart());
        try {
            const availableFunds = web3.utils.fromWei(
                await methods.getAvailableFundsForSupporter(userAddress).call()
            );
            console.log('availableFunds = ', availableFunds);
            dispatch(fetchAvailableFundsSuccess( availableFunds ));
        } catch (error) {
            console.log('error = ', error);
            dispatch(fetchAvailableFundsFail(error));
        }
    };
};

export const getBalanceSuccess = ( ethBalance ) => {
    return {
        type: actionTypes.GET_BALANCE,
        ethBalance: ethBalance
    };
};

export const getBalance = ( userAddress, web3 ) => {
    return async (dispatch) => {
        dispatch(fetchAvailableFundsStart());
        try {
            console.log('[getBalance]');
            const ethBalance = web3.utils.fromWei(await web3.eth.getBalance(userAddress));
            console.log('ethBalance = ', ethBalance);
            dispatch(getBalanceSuccess(ethBalance));
        } catch (error) {
            console.log('error = ', error);
            dispatch(fetchAvailableFundsFail(error));
        }
    };
}

export const claimRewardsStart = () => {
    return {
        type: actionTypes.CLAIM_REWARDS_START,
    };
};

export const claimRewardsSuccess = () => {
    return {
        type: actionTypes.CLAIM_REWARDS_SUCCESS,
    };
};

export const claimRewardsFail = ( error ) => {
    return {
        type: actionTypes.CLAIM_REWARDS_FAIL,
        errorGetFunds: error
    };
};

export const claimRewards = ( userAddress, methods ) => {
    return async (dispatch) => {
        dispatch(claimRewardsStart());
        methods.withdrawSupporterFunds(userAddress).send({ 
            from: userAddress, 
            gas: 6721975, 
            gasPrice: 100000000000
        })
        .then( response => {
            console.log('response = ', response);

            dispatch(claimRewardsSuccess());
        })
        .catch( error => {
            console.log('error = ', error);
            dispatch(fetchAvailableFundsFail(error.toString()));
        });
    };
};