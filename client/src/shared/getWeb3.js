import Web3 from "web3";

const getWeb3 = ( source ) =>
    new Promise( async(resolve, reject) => {

        // window.addEventListener("load", async () => {
            // Modern dapp browsers...

            if ( source === 'browser' ) {
                if ( window.ethereum ) {
                    const web3 = new Web3(window.ethereum);
                    try {
                        // Request account access if needed
                        await window.ethereum.enable();
                        // Acccounts now exposed
                        resolve( web3 );
                    } catch ( error ) {
                        reject( error );
                    }
                }
                // Legacy dapp browsers...
                else if ( window.web3 ) {
                    // Use Mist/MetaMask's provider.
                    const web3 = window.web3;
                    console.log('Injected web3 detected.');
                    resolve( web3 );
                }
            } else if ( source === 'local' ) {
                try {
                    const provider = new Web3.providers.HttpProvider(
                        'http://127.0.0.1:7545'
                    );
                    const web3 = new Web3(provider);
                    console.log('Using Local web3');
                    resolve( web3 );
                } catch(error) {
                    reject( error );
                }
            } else if ( source === 'custom' ) {
                try {
                    const provider = new Web3.providers.HttpProvider(
                        'https://ropsten.infura.io/v3/639d9fb0f9ec44ab9c282d1f5fce6325'
                    );
                    const web3 = new Web3(provider);
                    console.log('Using Infura');
                    resolve( web3 );
                } catch (error) {
                    reject( error );
                }
            }
                
        // });
    });

export default getWeb3;