import * as actionTypes from '../actions/actionTypes';
import { 
    updateObject, 
    updateVisitedCreations, 
    updateVisitedPurchases 
} from '../../shared/utility';

const initialState = {
    newCreations: [],
    fetchingCreations: false,
    newPurchases: [],
    fetchingPurchases: false
}

const clearEventsData = ( state, ) => {
    return updateObject( state, initialState );
};

const fetchEventsStart = ( state, action ) => {
    let object;
    if ( action.eventName === 'newArtwork' ) {
        object = { fetchingCreations: true }
    } else if (action.eventName === 'artworkBought') {
        object = { fetchingPurchases: true }
    }

    return updateObject( state, object );
};

const fetchEventsSuccess = ( state, action ) => {
    let object;
    if ( action.eventName === 'newArtwork' ) {
        object = { newCreations: action.events, fetchingCreations: false }
    } else if ( action.eventName === 'artworkBought' ) {
        object = { newPurchases: action.events, fetchingPurchases: false }
    }
    return updateObject( state, object );
};

const fetchEventsFail = ( state, action ) => {
    let object;
    if ( action.eventName === 'newArtwork' ) {
        object = { fetchingCreations: false }
    } else if ( action.eventName === 'artworkBought' ) {
        object = { fetchingPurchases: false }
    }
    return updateObject( state, object );
};

const setEventVisited = ( state, action ) => {
    if (action.eventName === 'Creation') {
        return updateVisitedCreations( state, action.artworkIdToUpdate );
    } else if (action.eventName === 'Purchase') {
        return updateVisitedPurchases( state, action.artworkIdToUpdate );
    }
}

const reducer = ( state = initialState, action ) => {
    switch ( action.type ) {
        case actionTypes.CLEAR_EVENTS_DATA: return clearEventsData( state, action );
        case actionTypes.FETCH_EVENTS_START: return fetchEventsStart( state, action );
        case actionTypes.FETCH_EVENTS_SUCCESS: return fetchEventsSuccess( state, action );
        case actionTypes.FETCH_EVENTS_FAIL: return fetchEventsFail( state, action );
        case actionTypes.SET_EVENT_VISITED: return setEventVisited( state, action );
        default: return state;
    }
};

export default reducer;