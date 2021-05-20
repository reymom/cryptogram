import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../../shared/utility';

const initialState = {
    // FETCH GENERAL
    artworks: null,
    fetchingArtworks: false,
    // FETCH LOADED
    loadedArtwork: null,
    fetchingArtwork: false,
    errorFetchArtwork: null,
    // CREATE
    creatingArtwork: false,
    creationError: null,
    // SUPPORT
    processingSupport: false,
    supportError: null,
    // PURCHASE
    processingPurchase: false,
    purchaseError: null
}

// FETCH GENERAL
const fetchArtworksStart = ( state, ) => {
    return updateObject( state, { fetchingArtworks: true } );
};

const fetchArtworksSuccess = ( state, action ) => {
    return updateObject( state, { artworks: action.artworks, fetchingArtworks: false } );
};

const fetchArtworksFail = ( state, ) => {
    return updateObject( state, { fetchingArtworks: false } );
};

// FETCH ONE ARTWORK
const fetchArtworkStart = ( state, ) => {
    return updateObject( state, { fetchingArtwork: true } );
};

const fetchArtworkSuccess = ( state, action ) => {
    return updateObject( state, { loadedArtwork: action.artwork, fetchingArtwork: false } );
};

const fetchArtworkFail = ( state, action) => {
    return updateObject( state, { fetchingArtwork: false, errorFetchArtwork: action.error } );
};

// CREATION
const createArtworkStart = ( state, ) => {
    return updateObject( state, { creatingArtwork: true } );
};

const createArtworkSuccess = ( state, ) => {
    return updateObject( state, { creatingArtwork: false, } );
};

const createArtworkFail = ( state, action ) => {
    return updateObject( state, { 
        creatingArtwork: false, 
        creationError: action.creationError
    } );
};

// SUPPORT
const clearSupportState = ( state, ) => {
    return updateObject( state, {
        processingSupport: false,
        supportError: null,
    } );
}

const supportArtworkStart = ( state, ) => {
    return updateObject( state, { processingSupport: true } );
};

const supportArtworkSuccess = ( state, action ) => {
    return updateObject( state, { 
        processingSupport: false,
        loadedArtwork: {
            ...state.loadedArtwork,
            totalLikes: (parseInt(state.loadedArtwork.totalLikes) + 1).toString(),
            supporters: [...state.loadedArtwork.supporters, action.supporterAddress]
        }
    } );
};

const supportArtworkFail = ( state, action ) => {
    return updateObject( state, { 
        processingSupport: false, 
        supportError: action.supportError 
    } );
};

// PURCHASE
const clearPurchaseState = ( state, ) => {
    return updateObject( state, {
        processingPurchase: false,
        purchaseError: null
    } );
}

const purchaseArtworkStart = ( state, ) => {
    return updateObject( state, { processingPurchase: true } );
};

const purchaseArtworkSuccess = ( state, action ) => {
    return updateObject( state, { 
        processingPurchase: false,
        loadedArtwork: {
            ...state.loadedArtwork,
            owner: action.from,
            lastPurchaseDate: new Date().getTime(),
            priceSpent: state.loadedArtwork.priceSpent + action.value,
        }
    } );
};

const purchaseArtworkFail = ( state, action ) => {
    return updateObject( state, { 
        processingPurchase: false, 
        purchaseError: action.purchaseError 
    } );
};

const reducer = ( state = initialState, action ) => {
    switch ( action.type ) {
        // FETCH GENERAL
        case actionTypes.FETCH_ARTWORKS_START: return fetchArtworksStart( state, action );
        case actionTypes.FETCH_ARTWORKS_SUCCESS: return fetchArtworksSuccess( state, action );
        case actionTypes.FETCH_ARTWORKS_FAIL: return fetchArtworksFail( state, action );
        // FETCH ONE ARTWORK
        case actionTypes.FETCH_ARTWORK_START: return fetchArtworkStart( state, action );
        case actionTypes.FETCH_ARTWORK_SUCCESS: return fetchArtworkSuccess( state, action );
        case actionTypes.FETCH_ARTWORK_FAIL: return fetchArtworkFail( state, action );
        // CREATION
        case actionTypes.CREATE_ARTWORK_START: return createArtworkStart( state, action );
        case actionTypes.CREATE_ARTWORK_SUCCESS: return createArtworkSuccess( state, action );
        case actionTypes.CREATE_ARTWORK_FAIL: return createArtworkFail( state, action );
        // SUPPORT
        case actionTypes.SUPPORT_ARTWORK_START: return supportArtworkStart( state, action );
        case actionTypes.SUPPORT_ARTWORK_SUCCESS: return supportArtworkSuccess( state, action );
        case actionTypes.SUPPORT_ARTWORK_FAIL: return supportArtworkFail( state, action );
        case actionTypes.CLEAR_SUPPORT_STATE: return clearSupportState( state, action );
        // PURCHASE
        case actionTypes.PURCHASE_ARTWORK_START: return purchaseArtworkStart( state, action );
        case actionTypes.PURCHASE_ARTWORK_SUCCESS: return purchaseArtworkSuccess( state, action );
        case actionTypes.PURCHASE_ARTWORK_FAIL: return purchaseArtworkFail( state, action );
        case actionTypes.CLEAR_PURCHASE_STATE: return clearPurchaseState( state, action );
        default: return state;
    }
};

export default reducer;