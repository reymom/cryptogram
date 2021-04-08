import * as actionTypes from './actionTypes';

export const fetchAddressInfoStart = () => {
    return {
        type: actionTypes.FETCH_ADDRESSINFO_START,
    };
};

export const fetchAddressInfoSuccess = ( 
    tokenBalance,
    numTokensCreated,
    numTokensBought,
    artworks,
    listSupporters 
) => {
    return {
        type: actionTypes.FETCH_ADDRESSINFO_SUCCESS,
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
                artworks.push(
                    await methods.getTokenInfo(artworkId).call()
                );
                supporters.push(
                    await methods.getSupportersOfArtwork(artworkId).call()
                );
            }
            dispatch(fetchAddressInfoSuccess(
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

export const createArtworkStart = () => {
    return {
        type: actionTypes.CREATE_ARTWORK_START,
    };
};

export const createArtworkSuccess = ( newArtwork ) => {
    return {
        type: actionTypes.CREATE_ARTWORK_SUCCESS,
        newArtwork: newArtwork
    };
};

export const createArtworkFail = ( creationError ) => {
    return {
        type: actionTypes.CREATE_ARTWORK_FAIL,
        creationError: creationError
    };
};

export const createArtwork = ( 
    name, 
    tag, 
    IPFSPath, 
    initialPrice, 
    participationPercentage, 
    account,
    methods
) => {
    return dispatch => {
        dispatch( createArtworkStart() );
        methods.createArtwork(
            name, tag, IPFSPath, initialPrice, participationPercentage
        ).send({ from: account, gas: 6721975, gasPrice: 100000000000 })
            .then(response => {
                console.log('ipfshash = ', IPFSPath);
                console.log('response = ', response);
                const newArtwork = response.events.newArtwork.returnValues;
                const artworkReconstruction = {
                    creationDate: Date.now().toString(),
                    lastPurchaseDate: "0",
                    priceSpent: "0",
                    description: newArtwork.description,
                    tag: newArtwork.tag,
                    IPFShash: IPFSPath,
                    initialPrice: newArtwork.initialPrice,
                    participationPercentage: newArtwork.participationPercentage,
                    totalLikes: "0"
                }
                dispatch( createArtworkSuccess( artworkReconstruction ) );
            })
            .catch(creationError => {
                dispatch( createArtworkFail( creationError ) );
            });
    }
}