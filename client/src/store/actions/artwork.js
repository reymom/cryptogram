import * as actionTypes from './actionTypes';

export const fetchArtworksStart = () => {
    return { type: actionTypes.FETCH_ARTWORKS_START, };
};

export const fetchArtworksSuccess = ( artworks ) => {
    return { type: actionTypes.FETCH_ARTWORKS_SUCCESS, artworks: artworks };
};

export const fetchArtworksFail = ( ) => {
    return { type: actionTypes.FETCH_ARTWORKS_FAIL, };
};

export const fetchArtworks = ( methods ) => {
    return async (dispatch) => {
        dispatch( fetchArtworksStart() );
        try {
            const totalTokens = await methods.getTotalSupply().call();
            let artworks = [];
            for (var id = 0; id < totalTokens; id++) {
                let tokenObject = await methods.getTokenInfo(id).call();
                let owner = await methods.ownerOf(id).call();
                let supporters = await methods.getSupportersOfArtwork(id).call();
                let tokenDict = {
                    id: id,
                    creator: tokenObject[0],
                    owner: owner,
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
                artworks.push(tokenDict);
            }
            dispatch(fetchArtworksSuccess(artworks));
        } catch {
            console.log('failed');
            dispatch(fetchArtworksFail());
        }
    };
};

export const createArtworkStart = () => {
    return { type: actionTypes.CREATE_ARTWORK_START, };
};

export const createArtworkSuccess = ( newArtwork ) => {
    return { type: actionTypes.CREATE_ARTWORK_SUCCESS, newArtwork: newArtwork };
};

export const createArtworkFail = ( creationError ) => {
    return { type: actionTypes.CREATE_ARTWORK_FAIL, creationError: creationError };
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
                console.log('creationError = ', creationError);
                dispatch(createArtworkFail(creationError.toString() ) );
            });
    };
};

export const supportArtworkStart = () => {
    return { type: actionTypes.SUPPORT_ARTWORK_START, };
};

export const supportArtworkSuccess = () => {
    return { type: actionTypes.SUPPORT_ARTWORK_SUCCESS, };
};

export const supportArtworkFail = ( supportError ) => {
    return { type: actionTypes.SUPPORT_ARTWORK_FAIL, supportError: supportError };
};

export const supportArtwork = ( tokenId, methods, account ) => {
    return dispatch => {
        dispatch( supportArtworkStart() );
        methods.supportArtwork( tokenId )
            .send({ from: account, gas: 6721975, gasPrice: 100000000000 })
            .then(response => {
                console.log('supportArtwork success!')
                console.log('response = ', response);
                dispatch( supportArtworkSuccess() );
            })
            .catch(supportError => {
                console.log('supportError = ', supportError.toString());
                dispatch( supportArtworkFail(supportError.toString()) );
            });
    };
};

export const clearSupportState = () => {
    return { type: actionTypes.CLEAR_SUPPORT_STATE };
};

// PURCHASE
export const purchaseArtworkStart = () => {
    return { type: actionTypes.PURCHASE_ARTWORK_START, };
};

export const purchaseArtworkSuccess = () => {
    return { type: actionTypes.PURCHASE_ARTWORK_SUCCESS, };
};

export const purchaseArtworkFail = ( purchaseError ) => {
    return { type: actionTypes.PURCHASE_ARTWORK_FAIL, purchaseError: purchaseError };
};

export const purchaseArtwork = ( artworkId, methods, account ) => {
    return async (dispatch) => {
        dispatch( purchaseArtworkStart() );
        let currentPrice = await methods.getCurrentPrice(artworkId).call();
        // let tokenInfo = await methods.getTokenInfo(artworkId).call();
        // console.log('tokenInfo = ', tokenInfo);
        // let currentPrice = parseInt(tokenInfo[7], 10) + 100000000000000000 * parseInt(tokenInfo[9], 10);
        console.log('currentPrice = ', currentPrice);
        methods.buyArtworkToCreator( artworkId )
            .send({ from: account, value: currentPrice, gas: 6721975, gasPrice: 100000000000 })
            .then(response => {
                console.log('purchaseArtwork success!')
                console.log('response = ', response);
                if (response.status === true) {
                    console.log(' success :) ');
                    dispatch( purchaseArtworkSuccess() );
                }
            })
            .catch(purchaseError => {
                console.log('supportError = ', purchaseError.toString());
                dispatch( purchaseArtworkFail(purchaseError.toString()) );
            });
    };
};

export const clearPurchaseState = () => {
    return { type: actionTypes.CLEAR_PURCHASE_STATE };
};