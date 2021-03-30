import React from 'react';
import * as IPFS from "ipfs-http-client";

import getWeb3 from '../../utils/getWeb3';

// import UploadImage from '../UploadImage/UploadImage';
import classes from './Explorer.module.css';

class Explorer extends React.Component {
    state = {
        ipfs: null, selectedFile: null,
        storageValue: 0, web3: null, accounts: null, contract: null
    };

    componentDidMount = async () => {
        try {
            // Get network provider and web3 instance.
            const web3 = await getWeb3();

            // Use web3 to get the user's accounts.
            const accounts = await web3.eth.getAccounts();
            console.log('accounts = ', accounts);

            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            console.log('networkId = ', networkId);
            // const deployedNetwork = Artworks.networks[networkId];
            // const instance = new web3.eth.Contract(
            //     Artworks.abi,
            //     deployedNetwork && deployedNetwork.address,
            // );

            // Set web3, accounts, and contract to the state, and then proceed with an
            // example of interacting with the contract's methods.
            // this.setState({ web3, accounts, contract: instance }, this.runExample);
            this.setState({ web3: web3, accounts: accounts });
        } catch (error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error('Error getting web3: ', error);
        }
        try {
            const ipfs = new IPFS({
                host: 'ipfs.infura.io',
                port: '5001',
                protocol: 'https',
                apiPath: '/api/v0'
            });
            this.setState({ ipfs: ipfs });
            console.log('ipfs = ', ipfs);
        } catch (error) {
            alert(
                `Failed to load ipfs. Check console for details.`,
            );
            console.error('Error getting ipfs: ', error);
        }
    };

    // runExample = async () => {
    //     const { accounts, contract } = this.state;

    //     // Stores a given value, 5 by default.
    //     await contract.methods.set(5).send({ from: accounts[0] });

    //     // Get the value from the contract to prove it worked.
    //     const response = await contract.methods.get().call();

    //     // Update state with the result.
    //     this.setState({ storageValue: response });
    // };

    fileSelectedHandler = event => {
        console.log('event: ', event.target.files[0]);
        this.setState({
            selectedFile: event.target.files[0]
        })
    }

    fileUploadHandler = async () => {
        const file = await this.state.ipfs.add(this.state.selectedFile);
        console.log('success!')
        console.log('file = ', file)
        console.log('path = ', file.path)
    }

    render() {
        if (!this.state.web3) {
            return <div>Loading Web3, accounts, and contract...</div>;
        }
        return (
            <div className={classes.Explorer}>
                <h1>Good to Go!</h1>
                <p>Your Truffle-React binding is complete.</p>
                <h2>Smart Contract Example</h2>
                <p>
                    If your contracts compiled and migrated successfully,
                    below will be shown something.
                </p>
                {/* <UploadImage/> */}
                <h4>Testing upload image</h4>
                <input type="file" onChange={this.fileSelectedHandler} />
                <button onClick={this.fileUploadHandler}>Create Token</button>
            </div>
        );
    }
}

export default Explorer;