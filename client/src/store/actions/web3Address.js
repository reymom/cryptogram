import * as actionTypes from './actionTypes';

export const fetchAddressInfoStart = () => {
    return {
        type: actionTypes.FETCH_ADDRESSINFO_START,
    };
};

export const fetchAddressInfoSuccess = ( 
    address,
    tokenBalance,
    numTokensCreated,
    numTokensBought,
    artworks,
    listSupporters 
) => {
    return {
        type: actionTypes.FETCH_ADDRESSINFO_SUCCESS,
        address: address,
        tokenBalance: tokenBalance,
        numTokensCreated: numTokensCreated,
        numTokensBought: numTokensBought,
        artworks: artworks,
        listSupporters: listSupporters
    };
};

export const fetchAddressInfoFail = ( error ) => {
    return {
        type: actionTypes.FETCH_ADDRESSINFO_FAIL,
        error: error
    };
};

export const fetchAddressInfo = ( methods, userAddress ) => {
    return async (dispatch) => {
        dispatch(fetchAddressInfoStart());
        try {
            const tokenBalance = await methods.balanceOf(userAddress).call();
            const numTokensCreated = await methods.getNumTokensCreated(userAddress).call();
            const numTokensBought = await methods.getNumTokensBought(userAddress).call();
            const tokenList = await methods.getTokensOfOwner(userAddress).call();
            let artworks = [];
            let supporters = [];
            for (var i = 0; i < tokenList.length; i++) {
                let artworkId = tokenList[i];
                let tokenObject = await methods.getTokenInfo(artworkId).call();
                let tokenDict = {
                    id: artworkId,
                    owner: userAddress,
                    creationDate: tokenObject[0],
                    lastPurchaseDate: tokenObject[1],
                    priceSpent: tokenObject[2],
                    description: tokenObject[3],
                    tag: tokenObject[4],
                    IPFShash: tokenObject[5],
                    initialPrice: tokenObject[6],
                    participationPercentage: tokenObject[7],
                    totalLikes: tokenObject[8]
                }
                artworks.push( tokenDict );
                supporters.push(
                    await methods.getSupportersOfArtwork(artworkId).call()
                );
            }
            dispatch(fetchAddressInfoSuccess(
                userAddress,
                tokenBalance,
                numTokensCreated,
                numTokensBought,
                artworks,
                supporters
            ));
        } catch (error) {
            console.log('error = ', error);
            dispatch(fetchAddressInfoFail(error));
        }
    };
};