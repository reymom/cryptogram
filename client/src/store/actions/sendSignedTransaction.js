import { Transaction } from 'ethereumjs-tx';

import {
    expirationTime,
    createArtworkSuccess,
    createArtworkFail,
    clearSupportState,
    supportArtworkSuccess,
    supportArtworkFail,
    clearPurchaseState,
    purchaseArtworkSuccess,
    purchaseArtworkFail
} from './artwork';

import {
    claimRewardsSuccess,
    withdrawFundsSuccess,
    fetchAvailableFunds,
    fetchAvailableFundsFail,
    fetchAddressInfo,
    getBalance
} from './web3Address';

export const sendSignedTransaction = (
    operation, from, to, value, gasPrice, gasLimit, data, privateKey, web3, methods
) => {
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
                // console.log('receipt = ', receipt);
                // dispatch corresponding actions
                switch ( operation ) {
                    case 'creation':
                        dispatch( fetchAddressInfo(web3, from, methods, true ) );
                        dispatch( createArtworkSuccess() );
                        break;
                    case 'support':
                        dispatch( supportArtworkSuccess( from ) );
                        dispatch( getBalance(from, web3, true) );
                        break;
                    case 'purchase':
                        dispatch( purchaseArtworkSuccess( from, value ) );
                        dispatch( fetchAddressInfo(web3, from, methods, true ) );
                        dispatch( fetchAvailableFunds(from, web3, methods) );
                        break;
                    case 'claim':
                        dispatch( claimRewardsSuccess() );
                        dispatch( getBalance(from, web3, true) );
                        break;
                    case 'withdraw':
                        dispatch( withdrawFundsSuccess() );
                        dispatch( getBalance(from, web3, true) );
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