import * as actionTypes from './actionTypes';

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
                console.log('creationError = ', creationError);
                dispatch(createArtworkFail(creationError.toString() ) );
            });
    };
};

export const supportArtworkStart = () => {
    return {
        type: actionTypes.SUPPORT_ARTWORK_START,
    };
};

export const supportArtworkSuccess = ( 

) => {
    return {
        type: actionTypes.SUPPORT_ARTWORK_SUCCESS,
    };
};

export const supportArtworkFail = ( supportError ) => {
    return {
        type: actionTypes.SUPPORT_ARTWORK_FAIL,
        supportError: supportError
    };
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