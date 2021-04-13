import * as actionTypes from '../actions/actionTypes';
import { updateObject } from '../utility';

const initialState = {
    createdArtwork: null,
    creatingArtwork: false,
    creationError: null,
    processingSupport: false,
    supportError: null
}

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

const reducer = ( state = initialState, action ) => {
    switch ( action.type ) {
        case actionTypes.CREATE_ARTWORK_START: return createArtworkStart( state, action );
        case actionTypes.CREATE_ARTWORK_SUCCESS: return createArtworkSuccess( state, action );
        case actionTypes.CREATE_ARTWORK_FAIL: return createArtworkFail( state, action );
        case actionTypes.SUPPORT_ARTWORK_START: return supportArtworkStart( state, action );
        case actionTypes.SUPPORT_ARTWORK_SUCCESS: return supportArtworkSuccess( state, action );
        case actionTypes.SUPPORT_ARTWORK_FAIL: return supportArtworkFail( state, action );
        case actionTypes.CLEAR_SUPPORT_STATE: return initialState;
        default: return state;
    }
};

export default reducer;