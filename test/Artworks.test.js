const { assert } = require('chai');

const Artworks = artifacts.require('./Artworks.sol');

require('chai')
    .use(require('chai-as-promised'))
    .should();

contract('Cryptogram', (accounts) => {
    let contract;

    before(async() => {
        contract = await Artworks.deployed();        
        // const priceIncreaseForLike = (await contract.priceIncreaseForLike()).toString();
        // const numLikesDecrease = (await contract.numLikesDecrease()).toNumber();
        // const decaymentUnit = (await contract.decaymentUnit()).toNumber();
    });

    describe('contract deployment', async() => {

        it('deploys successfully', async() => {
            const address = contract.address;
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        });
        it('has a name', async() => {
            const name = await contract.name();
            assert.equal(name, 'Cryptogram');
        });
        it('has a symbol', async() => {
            const symbol = await contract.symbol();
            assert.equal(symbol, 'CRG');
        });

    });

    describe('artwork creation', async() => {

        it('creates a new artwork', async() => {
            const result = await contract.createArtwork(
                'Test Artwork',
                'testTag',
                'Qme9fWvWYjK4FLcmcDVM1wPKvxcwzqJKXhoBs4ZMEmbrFa',
                web3.utils.toWei('1', 'ether'),
                50 // participation percentage
            );
            // SUCCESS
            // balance
            const balanceOf = await contract.balanceOf(accounts[0]);
            assert.equal(balanceOf, '1');
            // mint parameters
            const event = result.logs[0].args;
            assert.equal(event.tokenId.toNumber(), 0, 'correct id');
            assert.equal(event.from, '0x0000000000000000000000000000000000000000', 'from is correct');
            assert.equal(event.to, accounts[0], 'to is correct');

            // FAILURE:
            await contract.createArtwork(
                'Copy Test Artwork',
                'anotherTestTag',
                'Qme9fWvWYjK4FLcmcDVM1wPKvxcwzqJKXhoBs4ZMEmbrFa',
                web3.utils.toWei('0.5', 'ether'),
                10
            ).should.be.rejected;
        });

        it('creates multiple artworks and lists hashes', async() => {
            // Mint 3 more tokens
            let hashes = [
                'Qme9fWvWYjK4FLcmcDVM1wPKvxcwzqJKXhoBs4ZMEmbrFa', // the one already registered
                'JNS8fsknsfJKF33OfsdnI4Nfo4F9F4nfsOFNfFLNDCSDb9',
                'QmV2JSRDUp2s8Yg7ipjP7GUgrjbn7SVxfxyruP5hLJXu2c',
                'QmayBTqjut8JLJras3tRv5vxqqBnyrfhbfWGQWsmaAh1iT'
            ];
            for (var i = 1; i <= 3; i++) {
                await contract.createArtwork(
                    'Artwork' + i.toString(), 'tag' + i.toString(), 
                    hashes[i], 
                    web3.utils.toWei('0.1', 'ether'), 
                    10, { from: accounts[i] }
                );
            }
            // Test whether hash has been correctly registered
            let tokenInfo;
            let result = [];
            for (var i = 0; i < hashes.length; i++) {
                tokenInfo = await contract.getTokenInfo(i);
                result.push(tokenInfo[9]);
            }
            assert.equal(result.join(','), hashes.join(','), 'correct hashes');
        });

        it('indexes artworks', async() => {
            let tokenOwners = [];
            let tokenList;
            for (var i = 0; i <= 3; i++) {
                tokenList = await contract.getTokensOfOwner(accounts[i]);
                tokenOwners.push(tokenList[0].toNumber());
            }
            assert.equal([0, 1, 2, 3].join(','), tokenOwners.join(','));
        });

    });

    describe('artwork support', async() => {
        const artworkId = 0;

        it('allows one support per artwork', async() => {
            // creator cannot make like
            await contract.supportArtwork(artworkId, {from: accounts[0]}).should.be.rejected;
            // cannot like twice
            let result = await contract.supportArtwork(artworkId, {from: accounts[1]});
            await contract.supportArtwork(artworkId, {from: accounts[1]}).should.be.rejected;
        });

        it('indexes and adds supporters', async() => {
            const desiredLikes = 8;
            for (var i = 2; i <= desiredLikes; i++) {
                await contract.supportArtwork(artworkId, {from: accounts[i]});
            }
            const totalLikes = (await contract.getTokenInfo(artworkId))[5];
            assert.equal(totalLikes.toNumber(), desiredLikes, 'correct number of likes');
            const supporters = await contract.getSupportersOfArtwork(artworkId);
            assert.equal(
                supporters.join(','),
                accounts.slice(1, desiredLikes + 1).join(','),
                'correct supporters'
            );
        })

    });

    describe('artwork purchase', async() => {

        it('pays the artist', async() => {
            // account 9 will buy the artwork of account 0 supported by 1, 2, 3, 4, 5, 6, 7 and 8
            const artworkId = 0;
            initialArtistBalance = await web3.eth.getBalance(accounts[0]);
            const weiAmount = web3.utils.toWei('1.008', 'ether');
            // buy and transfer to artist
            await contract.buyArtworkToCreator(artworkId, { from: accounts[9], value: weiAmount });
            const creatorGain = await web3.eth.getBalance(accounts[0]) - initialArtistBalance;
            assert.equal(creatorGain, weiAmount / 2, 'correct artist payment amount');
        });

        it('transfers artwork property', async() => {
            newOwner = await contract.ownerOf(0);
            assert.equal(newOwner, accounts[9], 'correct new owner');
        });

    });

    describe('supporter funds managing', async() => {

        it('register funds and allows extraction', async() => {
            // funds for manager must be registered correctly before supporters extraction
            let lockedFunds = BigInt(await contract.getLockedFunds());
            console.log('lockedFunds = ', lockedFunds);

            let contractFunds = BigInt(await contract.getContractFunds());
            console.log("contractFunds = ", contractFunds);
            
            const weiForSupporters = BigInt(web3.utils.toWei('1.008', 'ether') / 2);
            let supporterFunds = BigInt(0);
            let leftFunds = 0;
            for (var i = 1; i <= 8; i++) {
                availableFunds = BigInt(await contract.getAvailableFundsForSupporter(accounts[i]));
                console.log("availableFunds = ", availableFunds);
                supporterFunds += availableFunds;
                await contract.withdrawSupporterFunds({from: accounts[i]});
                leftFunds += (await contract.getAvailableFundsForSupporter(accounts[i])).toNumber();
            }
            // console.log('weiForSupporters = ', weiForSupporters);
            // console.log('supporter distributed = ', supporterFunds);
            // console.log('difference = ', weiForSupporters - supporterFunds);
            await contract.withdrawSupporterFunds({from: accounts[1]}).should.be.rejected;
            assert.equal(leftFunds, 0, 'funds extracted correctly');
            assert.isBelow(parseInt(supporterFunds), parseInt(weiForSupporters), 'must be slightly below the funds stored in the contract');

            contractFunds = BigInt(await contract.getContractFunds());
            console.log("contractFunds = ", contractFunds);

            assert.equal(
                parseInt(lockedFunds), parseInt(weiForSupporters - supporterFunds), 
                'remaining funds stored correctly in contract'
            );
        });

        it('manager can extract remaining funds', async() => {
            await contract.withdrawLockedFunds();
            let lockedFunds = parseInt(await contract.getLockedFunds());
            console.log("lockedFunds = ", lockedFunds);

            contractFunds = parseInt(await contract.getContractFunds());
            console.log("contractFunds = ", contractFunds);

            assert.equal(lockedFunds, 0, "locked funds must be 0");
            assert.equal(contractFunds, 0, "no funds should be left");
        });
    });

    // describe('artwork offer', async() => {

    // });

})
