const Artworks = artifacts.require("Artworks");

module.exports = function(deployer) {
    const decimalPrecision = 10**5;
    const priceIncreaseForLike = web3.utils.toWei('0.001', 'ether');
    const alfaDecayFraction = 2;
    deployer.deploy(
        Artworks, 
        decimalPrecision, priceIncreaseForLike, alfaDecayFraction
    );
};
