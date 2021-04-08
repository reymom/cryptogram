import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../utility';

const initialState = {
    balances: 0,
    tokenBalance: 0,
    numTokensCreated: 0,
    numTokensBought: 0,
    artworks: [],
    listSupporters: [],
    loading: false,
    creatingArtwork: false,
    creationError: false
}

const fetchAddressInfoStart = ( state, action ) => {
    return updateObject( state, { loading: true } );
};

const fetchAddressInfoSuccess = ( state, action ) => {
    let transformedArworks = [];
    action.artworks.forEach(artwork => {
        let tranformedDict = {
            creationDate: artwork[0],
            lastPurchaseDate: artwork[1],
            priceSpent: artwork[2],
            description: artwork[3],
            tag: artwork[4],
            IPFShash: artwork[5],
            initialPrice: artwork[6],
            participationPercentage: artwork[7],
            totalLikes: artwork[8]
        }
        transformedArworks.push(tranformedDict);
    });
    console.log(transformedArworks);

    return updateObject( state, {
        balances: {
            tokenBalance: action.tokenBalance,
            numTokensCreated: action.numTokensCreated,
            numTokensBought: action.numTokensBought,
        },
        artworks: transformedArworks,
        listSupporters: action.listSupporters,
        loading: false
    } );
};

const fetchAddressInfoFail = ( state, action ) => {
    return updateObject( state, { loading: false } );
};


const createArtworkStart = ( state, action ) => {
    return updateObject( state, { creatingArtwork: true, creationError: null } );
};

const createArtworkSuccess = ( state, action ) => {
    return updateObject( state, {
        artworks: state.artworks.concat( action.newArtwork ),
        creatingArtwork: false 
    } );
};

const createArtworkFail = ( state, action ) => {
    return updateObject( state, { creatingArtwork: false, creationError: action.creationError } );
};

const reducer = ( state = initialState, action ) => {
    switch ( action.type ) {
        case actionTypes.FETCH_ADDRESSINFO_START: return fetchAddressInfoStart( state, action );
        case actionTypes.FETCH_ADDRESSINFO_SUCCESS: return fetchAddressInfoSuccess( state, action );
        case actionTypes.FETCH_ADDRESSINFO_FAIL: return fetchAddressInfoFail( state, action );
        case actionTypes.CREATE_ARTWORK_START: return createArtworkStart( state, action );
        case actionTypes.CREATE_ARTWORK_SUCCESS: return createArtworkSuccess( state, action );
        case actionTypes.CREATE_ARTWORK_FAIL: return createArtworkFail( state, action );

        default: return state;
    }
};

export default reducer;