import * as actionTypes from './actionTypes';

import { Transaction } from 'ethereumjs-tx';

import { fetchAddressInfo } from './web3Address';

// Constant used to clear the errors after trying to support or purchase (seconds)
const expirationTime = 30;

// FETCH GENERAL
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
                let currentPrice = await methods.getCurrentPrice(id).call();
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
                    currentPrice: currentPrice,
                    participationPercentage: tokenObject[8],
                    totalLikes: tokenObject[9],
                    supporters: supporters
                }
                artworks.push(tokenDict);
            }
            dispatch(fetchArtworksSuccess(artworks));
        } catch {
            console.log('[fetchArtworksFail]');
            dispatch(fetchArtworksFail());
        }
    };
};

// FETCH ONE ARTWORK
export const fetchArtworkStart = () => {
    return { type: actionTypes.FETCH_ARTWORK_START, };
};

export const fetchArtworkSuccess = ( artwork ) => {
    return { type: actionTypes.FETCH_ARTWORK_SUCCESS, artwork: artwork };
};

export const fetchArtworkFail = ( error ) => {
    return { type: actionTypes.FETCH_ARTWORK_FAIL, error: error };
};

export const fetchArtwork = ( artworkId, methods ) => {
    return async (dispatch) => {
        dispatch( fetchArtworkStart() );
        try {
            let tokenObject = await methods.getTokenInfo( artworkId ).call();
            let owner = await methods.ownerOf( artworkId ).call();
            let supporters = await methods.getSupportersOfArtwork( artworkId ).call();
            // console.log('supporters = ', supporters);
            let currentPrice = await methods.getCurrentPrice( artworkId ).call();
            let artwork = {
                id: artworkId,
                creator: tokenObject[0],
                owner: owner,
                creationDate: tokenObject[1],
                lastPurchaseDate: tokenObject[2],
                priceSpent: tokenObject[3],
                description: tokenObject[4],
                tag: tokenObject[5],
                IPFShash: tokenObject[6],
                initialPrice: tokenObject[7],
                currentPrice: currentPrice,
                participationPercentage: tokenObject[8],
                totalLikes: tokenObject[9],
                supporters: supporters
            }
            dispatch( fetchArtworkSuccess(artwork) );
        } catch ( error ) {
            console.log('[fetchArtworkFail] error = ', error);
            dispatch( fetchArtworkFail(error.toString()) );
        }
    };
};

// SEND SIGNED TRANSACTION
export const sendSignedTransaction = (
    operation, from, to, value, gasPrice, gasLimit, data, privateKey, web3, methods
) => { 
    console.log('value = ', value);
    console.log('web3.utils.toHex(value) = ', web3.utils.toHex(value));
    console.log('gasPrice = ', gasPrice);
    console.log('web3.utils.toHex(gasPrice) = ', web3.utils.toHex(gasPrice));
    console.log('gasLimit = ', gasLimit)
    return async( dispatch ) => {
        const rawData = {
            from: from,
            to: to,
            value: web3.utils.toHex(value),
            gasPrice: web3.utils.toHex(gasPrice),
            gasLimit: web3.utils.toHex(gasLimit),
            nonce: await web3.eth.getTransactionCount(from),
            data: data
        };

        const transaction = new Transaction(rawData, { chain: "ropsten" });
        transaction.sign(privateKey);

        const serialized = "0x" + transaction.serialize().toString("hex");

        let transactionHash;
        await web3.eth.sendSignedTransaction(serialized)
            .on('transactionHash', function (hash) {
                console.log('transactionHash = ', hash);
                transactionHash = hash;
            })
            .then(receipt => {
                console.log('receipt = ', receipt);
                // dispatch corresponding actions
                switch ( operation ) {
                    case 'creation':
                        dispatch( fetchAddressInfo(web3, from, methods, true ) );
                        dispatch( createArtworkSuccess() );
                        break;
                    case 'support':
                        dispatch( supportArtworkSuccess( from ) );
                        break;
                    case 'purchase':
                        dispatch( fetchAddressInfo(web3, from, methods, true ) );
                        dispatch( purchaseArtworkSuccess( from, value ) );
                        break;
                    case 'claim':
                        dispatch( claimRewardsSuccess() );
                        break;
                    default:
                        break;
                }
            }, async( err ) => {
                console.log('err = ', err);
                try {
                    let errorMessage;
                    const tx = await web3.eth.getTransaction(transactionHash);
                    try {
                        await web3.eth.call(tx, tx.blockNumber);
                    } catch( err ) {
                        let error =  err.toString();
                        let sliceIndex = error.indexOf('reverted');
                        errorMessage = error.slice(
                            sliceIndex + 10, error.length
                        );
                    }
    
                    // dispatch corresponding actions
                    if (errorMessage) {
                        console.log('errorMessage = ', errorMessage);
                        switch ( operation ) {
                            case 'creation':
                                dispatch( createArtworkFail( errorMessage.toString() ) );
                                break;
                            case 'support':
                                dispatch( supportArtworkFail( errorMessage.toString() ) );
                                setTimeout(() => { dispatch(clearSupportState()); }, expirationTime*1000);
                                break;
                            case 'purchase':
                                dispatch( purchaseArtworkFail( errorMessage.toString() ) );
                                setTimeout(() => { dispatch(clearPurchaseState()); }, expirationTime*1000);
                                break;
                            case 'claim':
                                dispatch( fetchAvailableFundsFail(errorMessage.toString()) );
                                break;
                            default:
                                break;
                        }
                    }
                } catch ( error ) {
                    console.log('catch(error= ', error)
                    switch ( operation ) {
                        case 'creation':
                            dispatch( createArtworkFail( error.toString() ) );
                            break;
                        case 'support':
                            dispatch( supportArtworkFail( error.toString() ) );
                            setTimeout(() => { dispatch(clearSupportState()); }, expirationTime*1000);
                            break;
                        case 'purchase':
                            dispatch( purchaseArtworkFail( error.toString() ) );
                            setTimeout(() => { dispatch(clearPurchaseState()); }, expirationTime*1000);
                            break;
                        case 'claim':
                            dispatch( fetchAvailableFundsFail(error.toString()) );
                            break;
                        default:
                            break;
                    }
                }
            });
    };
};

// GENERAL CREATION
export const createArtworkStart = ( ) => {
    return { type: actionTypes.CREATE_ARTWORK_START, };
};

export const createArtworkSuccess = ( ) => {
    return { type: actionTypes.CREATE_ARTWORK_SUCCESS, };
};

export const createArtworkFail = ( creationError ) => {
    return { type: actionTypes.CREATE_ARTWORK_FAIL, creationError: creationError };
};

export const createArtwork = ( 
    name,  tag, IPFSPath, initialPrice, participationPercentage,
    contract, account, web3IsManual, web3, wallet, gas, gasPrice, gasLimit
) => {
    return dispatch => {
        console.log('[createArtwork] IPFSPath = ', IPFSPath);
        dispatch( createArtworkStart() );
        let price = web3.utils.toWei(initialPrice, 'ether');

        if ( !web3IsManual ) {
            dispatch( createArtworkWithWeb3Browser(
                name, tag, IPFSPath, price, participationPercentage, 
                contract, account, web3
            ) );
        } else {
            dispatch( createArtworkWithWeb3Manual(
                name, tag, IPFSPath, price, participationPercentage,
                contract, account, web3, wallet, gasPrice, gasLimit
            ) );
        }
    };
};

// CREATION WITH WEB3 FROM BROWSER
export const createArtworkWithWeb3Browser = ( 
    name, tag, IPFSPath, initialPrice, participationPercentage, 
    contract, account, web3
) => {
    return dispatch => {
        console.log('[createArtworkWithWeb3Browser]');
        contract.methods.createArtwork(
            name, tag, IPFSPath, initialPrice, participationPercentage
        )
            .send({ 
                from: account, 
                // gas: 6721975, // NICHT ERFORDERT MIT METMASK ODER?
                // gasPrice: 100000000000 // SOGLEICH
            })
            .then(response => {
                console.log('response = ', response);
                dispatch( createArtworkSuccess( ) );
                dispatch( fetchAddressInfo(web3, account, contract.methods, true ) );
            })
            .catch(creationError => {
                console.log('creationError = ', creationError.toString() );
                dispatch(createArtworkFail( creationError.toString() ));
            });
    }
}

// CREATION WITH MANYALLY HANDLED WEB3
export const createArtworkWithWeb3Manual = (
    name,  tag, IPFSPath, initialPrice, participationPercentage,
    contract, account, web3, wallet, gasPrice, gasLimit
) => {
    return dispatch => {
        console.log('[createArtworkWithWeb3Manual]');
        const createArtworkData = contract.methods.createArtwork(
            name, tag, IPFSPath, initialPrice, participationPercentage
        );
        dispatch( sendSignedTransaction(
            'creation',
            account,
            contract._address,
            0, gasPrice, gasLimit,
            createArtworkData.encodeABI(),
            wallet.getPrivateKey(),
            web3,
            contract.methods
        ) );
    }
}

/* ----------
    SUPPORT
------------- */
export const supportArtworkStart = () => {
    return { type: actionTypes.SUPPORT_ARTWORK_START, };
};

export const supportArtworkSuccess = ( supporterAddress ) => {
    return { type: actionTypes.SUPPORT_ARTWORK_SUCCESS, supporterAddress: supporterAddress };
};

export const supportArtworkFail = ( supportError ) => {
    return { type: actionTypes.SUPPORT_ARTWORK_FAIL, supportError: supportError };
};

export const supportArtwork = ( 
    tokenId, contract, account, 
    web3IsManual, web3, wallet, gas, gasPrice, gasLimit
) => {
    return dispatch => {
        dispatch( clearSupportState() );
        dispatch( clearPurchaseState() );
        dispatch( supportArtworkStart() );
        console.log('[supportArtworkStart]');

        if ( !web3IsManual ) {
            dispatch( supportArtworkWithWeb3Browser( tokenId, contract, account ) );
        } else {
            dispatch( supportArtworkWithWeb3Manual(
                tokenId, contract, account, 
                web3, wallet, gasPrice, gasLimit
            ) );
        }
    };
};

// SUPPORT WITH WEB3 FROM BROWSER
export const supportArtworkWithWeb3Browser = ( tokenId, contract, account ) => {
    return dispatch => {
        console.log('[supportArtworkWithWeb3Browser]');
        contract.methods.supportArtwork( tokenId )
            .send({ 
                from: account, 
                // gas: 6721975, // NICHT ERFORDERT MIT METMASK ODER?
                // gasPrice: 100000000000 // SOGLEICH
            })
            .then(response => {
                console.log('response = ', response);
                dispatch( supportArtworkSuccess() );
            })
            .catch(supportError => {
                console.log('supportError = ', supportError.toString());
                dispatch( supportArtworkFail(supportError.toString()) );
                // after "expirationTime" seconds, I will clear the error
                setTimeout(() => { dispatch(clearSupportState()); }, expirationTime*1000);
            });
    }
}

// SUPPORT WITH MANYALLY HANDLED WEB3
export const supportArtworkWithWeb3Manual = (
    tokenId, contract, account, 
    web3, wallet, gasPrice, gasLimit
) => {
    return dispatch => {
        console.log('[supportArtworkWithWeb3Manual]');
        const supportArtworkData = contract.methods.supportArtwork( tokenId );
        dispatch( sendSignedTransaction(
            'support',
            account,
            contract._address,
            0, gasPrice, gasLimit,
            supportArtworkData.encodeABI(),
            wallet.getPrivateKey(),
            web3,
            null
        ) );
    };
};

export const clearSupportState = () => {
    return { type: actionTypes.CLEAR_SUPPORT_STATE };
};

/* -----------
    PURCHASE
-------------- */
export const purchaseArtworkStart = () => {
    return { type: actionTypes.PURCHASE_ARTWORK_START, };
};

export const purchaseArtworkSuccess = ( from, value ) => {
    return { 
        type: actionTypes.PURCHASE_ARTWORK_SUCCESS, 
        from: from,
        value: value
    };
};

export const purchaseArtworkFail = ( purchaseError ) => {
    return { type: actionTypes.PURCHASE_ARTWORK_FAIL, purchaseError: purchaseError };
};

export const purchaseArtwork = ( 
    tokenId, contract, account, 
    web3IsManual, web3, wallet, gas, gasPrice, gasLimit
) => {
    return async(dispatch) => {
        dispatch( clearPurchaseState() );
        dispatch( clearSupportState() );
        console.log('[purchaseArtwork]');

        dispatch( purchaseArtworkStart() );
        let currentPrice = await contract.methods.getCurrentPrice(tokenId).call();
        if ( !web3IsManual ) {
            dispatch( purchaseArtworkWithWeb3Browser( 
                tokenId, currentPrice,
                contract.methods, account, web3
            ) );
        } else {
            dispatch( purchaseArtworkWithWeb3Manual(
                tokenId, currentPrice, contract, account, 
                web3, wallet, gas, gasPrice, gasLimit
            ) );
        }
    };
};

export const purchaseArtworkWithWeb3Browser = ( 
    artworkId, currentPrice, methods, account, web3 
) => {
    return async (dispatch) => {
        dispatch( purchaseArtworkStart() );
        console.log('[purchaseArtworkWithWeb3Browser]');
        methods.buyArtworkToCreator( artworkId )
            .send({ 
                from: account, 
                value: currentPrice, 
                // gas: 6721975, 
                // gasPrice: 100000000000
            })
            .then(response => {
                console.log('response = ', response);
                if (response.status === true) {
                    dispatch( purchaseArtworkSuccess( account, currentPrice ) );
                    dispatch( fetchAddressInfo(web3, account, methods, true ) );
                }
            })
            .catch(purchaseError => {
                console.log('purchaseError = ', purchaseError.toString());
                dispatch( purchaseArtworkFail(purchaseError.toString()) );
                setTimeout(() => { dispatch(clearPurchaseState()); }, expirationTime*1000);
            });
    };
};

// PURCHASE WITH MANYALLY HANDLED WEB3
export const purchaseArtworkWithWeb3Manual = (
    artworkId, currentPrice, contract, account, 
    web3, wallet, gas, gasPrice, gasLimit
) => {
    return dispatch => {
        console.log('[supportArtworkWithWeb3Manual]');
        const supportArtworkData = contract.methods.buyArtworkToCreator( artworkId )
        dispatch( sendSignedTransaction(
            'purchase',
            account,
            contract._address,
            currentPrice, gasPrice, gasLimit,
            supportArtworkData.encodeABI(),
            wallet.getPrivateKey(),
            web3,
            contract.methods
        ) );
    }
}

export const clearPurchaseState = () => {
    return { type: actionTypes.CLEAR_PURCHASE_STATE };
};