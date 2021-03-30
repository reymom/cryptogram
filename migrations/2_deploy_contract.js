const Artworks = artifacts.require("Artworks");

module.exports = function(deployer) {
    // const priceIncreaseForLike = "1000000000000000"; // weis, or 0.1 eth
    const priceIncreaseForLike = web3.utils.toWei('0.1', 'ether');
    const numLikesDecrease = 1;
    const decaymentUnit = 2;
    deployer.deploy(Artworks, priceIncreaseForLike, numLikesDecrease, decaymentUnit);
};
