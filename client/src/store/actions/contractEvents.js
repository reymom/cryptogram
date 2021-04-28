import * as actionTypes from './actionTypes';

export const fetchEventsStart = () => {
    return {
        type: actionTypes.FETCH_EVENTS_START,
    };
};

export const fetchEventsSuccess = ( creationEvents, purchaseEvents ) => {
    return {
        type: actionTypes.FETCH_EVENTS_SUCCESS,
        newCreations: creationEvents,
        newPurchases: purchaseEvents
    };
};

export const fetchEventsFail = () => {
    return {
        type: actionTypes.FETCH_EVENTS_FAIL,
    };
};

export const fetchEvents = ( contract, following ) => {
    return async (dispatch) => {
        dispatch( fetchEventsStart() );
        await contract.getPastEvents('allEvents', { 
            filter: {
                creator: following,
                seller: following,
                collector: following
            },
            fromBlock: 1
        }, (error, events) => {
                if (error) {
                    dispatch( fetchEventsFail( ) );
                }

                if (events && events.length > 0) {
                    // get visited artworks in localstorage, convert to array of ints
                    let visitedCreationIds = localStorage.getItem('visitedCreationIds');
                    let visitedPurchaseIds = localStorage.getItem('visitedPurchaseIds');
                    if (visitedCreationIds) {
                        visitedCreationIds = visitedCreationIds.split(',').map(x => parseInt(x));
                    } else if (visitedPurchaseIds) {
                        visitedPurchaseIds = visitedPurchaseIds.split(',').map(x => parseInt(x));
                    }
                    // console.log('visitedCreationIds = ', visitedCreationIds);
                    // console.log('visitedPurchaseIds = ', visitedPurchaseIds);

                    // reconstruct objects to present artworks in histories
                    let newCreations = [];
                    let newPurchases = [];
                    for ( var i = 0; i < events.length; i++ ) {
                        let event = events[i];
                        if (event.event === 'newArtwork') {
                            let visited = false;
                            if ( visitedCreationIds && visitedCreationIds.includes(event.returnValues.artworkId) ) {
                                visited = true;
                            }
                            newCreations.push({
                                index: event.returnValues.artworkId,
                                creator: event.returnValues.creator,
                                description: event.returnValues.description,
                                tag: event.returnValues.tag,
                                IPFShash: event.returnValues.IPFShash,
                                initialPrice: event.returnValues.initialPrice,
                                participationPercentage: event.returnValues.participationPercentage,
                                visited: visited
                            });
                        } else if (event.event === 'artworkBought') {
                            let visited = false;
                            if ( visitedPurchaseIds && visitedPurchaseIds.includes(event.returnValues.artworkId) ) {
                                visited = true;
                            }
                            newPurchases.push({
                                index: event.returnValues.artworkId,
                                seller: event.returnValues.seller,
                                collector: event.returnValues.collector,
                                purchasePrice: event.returnValues.purchasePrice,
                                IPFShash: event.returnValues.IPFShash,
                                visited: visited
                            });
                        }
                    }
                    // console.log('newCreations = ', newCreations);
                    // console.log('newPurchases = ', newPurchases);
                    dispatch( fetchEventsSuccess( newCreations, newPurchases ) );
                } else {
                    dispatch( fetchEventsSuccess( [], [] ) );
                }
            }
        );
    };
};

export const setEventVisited = ( eventName, artworkId ) => {
    let prevStorage = '';
    let storageId = 'visited' + eventName + 'Ids'

    let stored = localStorage.getItem(storageId);
    if (stored && stored !== '' ) {
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