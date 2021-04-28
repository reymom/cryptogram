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
            } else if ( source === 'infura' ) {
                try {
                    const provider = new Web3.providers.HttpProvider(
                        'https://ropsten.infura.io/v3/d09825f256ae4705a74fdee006040903'
                    );
                    const web3 = new Web3(provider);
                    resolve( web3 );
                } catch (error) {
                    reject( error );
                }
            }
                
        // });
    });

export default getWeb3;