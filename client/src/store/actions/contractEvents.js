import * as actionTypes from './actionTypes';

export const clearEventsData = () => {
    return { type: actionTypes.CLEAR_EVENTS_DATA, };
};

export const fetchEventsStart = ( eventName ) => {
    return { type: actionTypes.FETCH_EVENTS_START, eventName: eventName };
};

export const fetchEventsSuccess = ( events, eventName ) => {
    return {
        type: actionTypes.FETCH_EVENTS_SUCCESS,
        events: events,
        eventName: eventName
    };
};

export const fetchEventsFail = ( eventName ) => {
    return { type: actionTypes.FETCH_EVENTS_FAIL, eventName: eventName };
};

export const fetchEvents = ( contract, following, eventName ) => {
    return dispatch => {
        dispatch( fetchEventsStart( eventName ) );
        // console.log('following = ', following, 'eventName = ', eventName);

        let filterDict;
        if ( eventName === 'newArtwork' ) {
            filterDict = { creator: following };
        } else if ( eventName === 'artworkBought' ) {
            filterDict = { seller: following, collector: following };
        } else { dispatch( fetchEventsFail( ) ); }

        contract.getPastEvents(eventName, { filter: filterDict, fromBlock: 1 }, ( error, events ) => {
                if ( error ) { dispatch( fetchEventsFail( eventName ) ); }

                if ( events && events.length > 0 ) {
                    let visitedIds;
                    if ( eventName === 'newArtwork' ) {
                        visitedIds = localStorage.getItem('visitedCreationIds');
                    } else if ( eventName === 'artworkBought' ) {
                        visitedIds = localStorage.getItem('visitedPurchaseIds');
                    }

                    if ( visitedIds ) { visitedIds = visitedIds.split(','); }

                    // console.log('visitedIds = ', visitedIds);

                    // reconstruct objects to present artworks in histories
                    let newEvents = [];
                    for ( var i = 0; i < events.length; i++ ) {
                        // console.log('i = ', i, 'event[i] = ', events[i]);
                        let event = events[i];
                        if ( event.event === eventName ) {
                            let visited = false;
                            if ( visitedIds && visitedIds.includes(event.returnValues.artworkId) ) {
                                visited = true;
                            }
                            let artworkRenderedDict;
                            let index = event.returnValues.artworkId;
                            let IPFShash = event.returnValues.IPFShash;
                            let listIndex = i.toString();
                            if (eventName === 'newArtwork') {
                                artworkRenderedDict = {
                                    index: index,
                                    listIndex: listIndex,
                                    creator: event.returnValues.creator,
                                    description: event.returnValues.description,
                                    tag: event.returnValues.tag,
                                    IPFShash: IPFShash,
                                    initialPrice: event.returnValues.initialPrice,
                                    participationPercentage: event.returnValues.participationPercentage,
                                    visited: visited
                                }
                            } else if (eventName === 'artworkBought') {
                                artworkRenderedDict = {
                                    index: index,
                                    listIndex: listIndex,
                                    seller: event.returnValues.seller,
                                    collector: event.returnValues.collector,
                                    purchasePrice: event.returnValues.purchasePrice,
                                    IPFShash: IPFShash,
                                    visited: visited
                                }
                            }

                            if (artworkRenderedDict) { newEvents.push(artworkRenderedDict); }
                        }
                    }

                    // console.log('newEvents = ', newEvents);
                    dispatch( fetchEventsSuccess( newEvents, eventName ) );
                } else {
                    dispatch( fetchEventsSuccess( [], eventName ) );
                }
            }
        );
    };
};

export const setEventVisited = ( eventName, artworkId ) => {
    let prevStorage = '';
    let storageId = 'visited' + eventName + 'Ids'

    let stored = localStorage.getItem(storageId);
    if ( stored && stored !== '' && !stored.split(',').includes(artworkId)) {
        prevStorage = localStorage.getItem(storageId) + ',';
    }

    localStorage.setItem(
        storageId,
        prevStorage + artworkId.toString()
    )
    return {
        type: actionTypes.SET_EVENT_VISITED,
        eventName: eventName,
        artworkIdToUpdate: artworkId
    };
};