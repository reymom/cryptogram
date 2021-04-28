import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utility';

const initialState = {
    artworks: null,
    fetchingArtworks: false,
    createdArtwork: null,
    creatingArtwork: false,
    creationError: null,
    processingSupport: false,
    supportError: null,
    processingPurchase: false,
    purchaseError: null
}

// fetch
const fetchArtworksStart = ( state, action ) => {
    return updateObject( state, { fetchingArtworks: true } );
};

const fetchArtworksSuccess = ( state, action ) => {
    return updateObject( state, {
        artworks: action.artworks,
        fetchingArtworks: false 
    } );
};

const fetchArtworksFail = ( state, action ) => {
    return updateObject( state, { fetchingArtworks: false } );
};

// creation
const createArtworkStart = ( state, action ) => {
    return updateObject( state, { creatingArtwork: true } );
};

const createArtworkSuccess = ( state, action ) => {
    return updateObject( state, {
        createdArtwork: action.newArtwork,
        creatingArtwork: false 
    } );
};

const createArtworkFail = ( state, action ) => {
    return updateObject( state, { 
        creatingArtwork: false, 
        creationError: action.creationError
    } );
};

// support
const supportArtworkStart = ( state, action ) => {
    return updateObject( state, { processingSupport: true } );
};

const supportArtworkSuccess = ( state, action ) => {
    return updateObject( state, { processingSupport: false } );
};

const supportArtworkFail = ( state, action ) => {
    return updateObject( state, { 
        processingSupport: false, 
        supportError: action.supportError 
    } );
};

// purchase
const purchaseArtworkStart = ( state, action ) => {
    return updateObject( state, { processingPurchase: true } );
};

const purchaseArtworkSuccess = ( state, action ) => {
    return updateObject( state, { processingPurchase: false } );
};

const purchaseArtworkFail = ( state, action ) => {
    return updateObject( state, { 
        processingPurchase: false, 
        purchaseError: action.purchaseError 
    } );
};

const reducer = ( state = initialState, action ) => {
    switch ( action.type ) {
        // fetch
        case actionTypes.FETCH_ARTWORKS_START: return fetchArtworksStart( state, action );
        case actionTypes.FETCH_ARTWORKS_SUCCESS: return fetchArtworksSuccess( state, action );
        case actionTypes.FETCH_ARTWORKS_FAIL: return fetchArtworksFail( state, action );
        // creation
        case actionTypes.CREATE_ARTWORK_START: return createArtworkStart( state, action );
        case actionTypes.CREATE_ARTWORK_SUCCESS: return createArtworkSuccess( state, action );
        case actionTypes.CREATE_ARTWORK_FAIL: return createArtworkFail( state, action );
        // support
        case actionTypes.SUPPORT_ARTWORK_START: return supportArtworkStart( state, action );
        case actionTypes.SUPPORT_ARTWORK_SUCCESS: return supportArtworkSuccess( state, action );
        case actionTypes.SUPPORT_ARTWORK_FAIL: return supportArtworkFail( state, action );
        case actionTypes.CLEAR_SUPPORT_STATE: return initialState;
        // purchase
        case actionTypes.PURCHASE_ARTWORK_START: return purchaseArtworkStart( state, action );
        case actionTypes.PURCHASE_ARTWORK_SUCCESS: return purchaseArtworkSuccess( state, action );
        case actionTypes.PURCHASE_ARTWORK_FAIL: return purchaseArtworkFail( state, action );
        case actionTypes.CLEAR_PURCHASE_STATE: return initialState;
        default: return state;
    }
};

export default reducer;