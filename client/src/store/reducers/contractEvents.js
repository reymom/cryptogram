import * as actionTypes from '../actions/actionTypes';
import { 
    updateObject, 
    updateVisitedCreations, 
    updateVisitedPurchases 
} from '../../shared/utility';

const initialState = {
    newCreations: [],
    newPurchases: [],
    fetchingEvents: false
}

const fetchEventsStart = ( state, action ) => {
    return updateObject( state, { fetchingEvents: true } );
};

const fetchEventsSuccess = ( state, action ) => {
    return updateObject( state, {
        newCreations: action.newCreations,
        newPurchases: action.newPurchases,
        fetchingEvents: false
    } );
};

const fetchEventsFail = ( state, action ) => {
    return updateObject( state, { fetchingEvents: false } );
};

const setEventVisited = ( state, action ) => {
    if (action.eventName === 'Creation') {
        return updateVisitedCreations( state, action.artworkIdToUpdate);
    } else if (action.eventName === 'Purchase') {
        return updateVisitedPurchases( state, action.artworkIdToUpdate);
    }
}

const reducer = ( state = initialState, action ) => {
    switch ( action.type ) {
        case actionTypes.FETCH_EVENTS_START: return fetchEventsStart( state, action );
        case actionTypes.FETCH_EVENTS_SUCCESS: return fetchEventsSuccess( state, action );
        case actionTypes.FETCH_EVENTS_FAIL: return fetchEventsFail( state, action );
        case actionTypes.SET_EVENT_VISITED: return setEventVisited( state, action );
        default: return state;
    }
};

export default reducer;