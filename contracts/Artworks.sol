// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.9.0;

import "./ERC721.sol";

contract Artworks is ERC721 {

    /** CONSTRUCTOR **/
    address public manager;
    uint256 public priceIncreaseForLike;
    // for each number of likes L we decrease the reward by N units
    uint8 public numLikesDecrease;
    uint8 public decaymentUnit;

    constructor(
        uint256 _priceIncreaseForLike,
        uint8 _numLikesDecrease,
        uint8 _decaymentUnit
    ) ERC721("Cryptogram", "CRG") {
        manager = msg.sender;
        priceIncreaseForLike = _priceIncreaseForLike;
        numLikesDecrease = _numLikesDecrease;
        decaymentUnit = _decaymentUnit;
    }

    /** MODIFIERS **/
    modifier onlyManager {
        require(msg.sender == manager,"only manager");
        _;
    }

    /** EVENTS **/
    event newArtwork(
        address creator,
        string description,
        string tag,
        string IPFShash,
        uint256 initialPrice,
        uint256 participationPercentage
    );

    event artworkBought(
        uint256 artworkId,
        address collector,
        uint256 purchasePrice
    );

    /** STRUCTS **/
    struct Artwork {
        address creator;
        uint256 creationDate;
        uint256 lastPurchaseDate;
        uint256 priceSpent;
        string description;
        string tag;
        string IPFShash;
        uint256 initialPrice;
        uint256 participationPercentage;
        address[] supporters;
        uint256 totalLikes;
    }

    /*** STORAGE ***/
    Artwork[] public artworks;

    uint256 totalSupply;

    mapping(uint256 => string) artworkIdtoIPFSHash;

    mapping(string => bool) _IPFShashExists;

    mapping(address => uint) availableFundsForSupporter;

    /*** LOGIC ***/
    function getTotalSupply() external view returns (uint256) {
        return totalSupply;
    }

    function createArtwork(
        string memory _description,
        string memory _tag,
        string memory _IPFShash,
        uint256 _initialPrice,
        uint256 _participationPercentage
    ) public returns (uint256) {
        require(!_IPFShashExists[_IPFShash], 'CRG: hash already registered');

        Artwork memory _artwork =
            Artwork({
                creator: msg.sender,
                creationDate: block.timestamp,
                lastPurchaseDate: 0,
                priceSpent: 0,
                description: _description,
                tag: _tag,
                IPFShash: _IPFShash,
                initialPrice: _initialPrice,
                participationPercentage: _participationPercentage,
                supporters: new address[](0),
                totalLikes: 0
            });

        artworks.push(_artwork);
        totalSupply += 1;
        uint256 artworkId = artworks.length - 1;
        _mint(msg.sender, artworkId);
        artworkIdtoIPFSHash[artworkId] = _artwork.IPFShash;
        _IPFShashExists[_IPFShash] = true;

        emit newArtwork(
            _artwork.creator,
            _artwork.description,
            _artwork.tag,
            _artwork.IPFShash,
            _artwork.initialPrice,
            _artwork.participationPercentage
        );

        return artworkId;
    }

    function getArtworkIPFSHash(uint256 _artworkId) public view returns (string memory) {
        return artworkIdtoIPFSHash[_artworkId];
    }

    function getTokensOfOwner(address _owner) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(_owner);
        if (tokenCount == 0) {
            return new uint256[](0);
        } else {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 totalArtworks = totalSupply;
            uint256 resultIndex = 0;
            uint256 artworkId;
            for (artworkId = 0; artworkId < totalArtworks; artworkId++) {
                if (ownerOf(artworkId) == _owner) {
                    result[resultIndex] = artworkId;
                    resultIndex++;
                }
            }
            return result;
        }
    }

    function supportArtwork(uint256 _artworkId) public returns (uint256) {
        // consider if make this a configurable payable parameter
        // initially, users just pay the ethereum taxes for writing in the blockchain
        // require(msg.value <= likePrice);
        Artwork storage _artwork = artworks[_artworkId];
        require(_artwork.creator != msg.sender, 'You cannot put a like in your own creations');
        require(!_isSupporterOfArtwork(_artworkId, msg.sender), 'You are already supporting this artwork');
        _artwork.totalLikes += 1;
        // add supporter
        artworks[_artworkId].supporters.push(msg.sender);
        return _artwork.totalLikes;
    }

    function getTotalLikes(uint _artworkId) external view returns(uint) {
        Artwork memory _artwork = artworks[_artworkId];
        return _artwork.totalLikes;
    }

    function _isSupporterOfArtwork(uint256 _artworkId, address _supporter) internal view returns(bool) {
        Artwork memory _artwork = artworks[_artworkId];
        uint totalLikes = _artwork.totalLikes;
        if (totalLikes == 0) {
            return false;
        } else {
            bool isSupporter;
            uint256 resultIndex = 0;
            uint256 supporterId;
            for (supporterId = 0; supporterId < totalLikes; supporterId++) {
                if (_artwork.supporters[supporterId] == _supporter) {
                    isSupporter = true;
                }
                resultIndex++;
            }
            return isSupporter;
        }
    }

    function getSupportersOfArtworkId(uint256 _artworkId) external view returns(address[] memory) {
        Artwork memory _artwork = artworks[_artworkId];
        uint totalLikes = _artwork.totalLikes;
        if (totalLikes == 0) {
            return new address[](0);
        } else {
            address[] memory result = new address[](totalLikes);
            uint256 resultIndex = 0;
            uint256 supporterId;
            for (supporterId = 0; supporterId < totalLikes; supporterId++) {
                result[resultIndex] = _artwork.supporters[supporterId];
                resultIndex++;
            }
            return result;
        }
    }

    function getCurrentPriceOfArwork(uint _artworkId) public view returns(uint) {
        Artwork memory _artwork = artworks[_artworkId];
        uint totalLikes = _artwork.totalLikes;
        uint finalPrice = _artwork.initialPrice + priceIncreaseForLike * totalLikes;
        return finalPrice;
    }

    function _updateArtworkOnPurchase(uint _artworkId, uint finalPrice) internal {
        Artwork storage _artwork = artworks[_artworkId];
        _artwork.lastPurchaseDate = block.timestamp;
        _artwork.priceSpent = finalPrice;
    }

    function buyArtworkToCreator(uint256 _artworkId) public payable returns (bool) {
        Artwork memory _artwork = artworks[_artworkId];
        uint totalLikes = _artwork.totalLikes;
        uint finalPrice = _artwork.initialPrice + priceIncreaseForLike * totalLikes;
        require(msg.value == finalPrice, 'You must pay the price!');
        // pay the artist
        uint artistPrice = (finalPrice * (100 - _artwork.participationPercentage)) / 100;
        (bool success,) = payable(ownerOf(_artworkId)).call{value: artistPrice}('');
        require(success, 'Transfer to owner failed');
        // make the property transfer
        _transfer(ownerOf(_artworkId), msg.sender, _artworkId);
        _updateArtworkOnPurchase(_artworkId, finalPrice);

        // register funds in order to supporters to get it later
        uint supportersPrice = (finalPrice * _artwork.participationPercentage) / 100;
        uint supporterId;
        uint supporterPrice = supportersPrice / _artwork.totalLikes;
        for (supporterId = 0; supporterId < _artwork.totalLikes; supporterId++) {
            // address payable supporter = payable(_artwork.supporters[supporterId]);
            // (bool succeses,) = supporter.call{value: supporterPrice}('');
            // require(succeses, 'Transfer to supporters failed');
            availableFundsForSupporter[_artwork.supporters[supporterId]] += supporterPrice;
        }
        return true;
    }

    function buyArtworkToCollectionist(uint256 _artworkId) public payable returns (bool) {
        // lo mismo pero un TransferFrom, así que necesitará aceptación antes
        // en buy to creator, quizas resetear los supporters para que solo los nuevos recivan
        // en ningun caso el num de likes
        uint tmp = _artworkId + 1;
        require(tmp != 0);
        return true;
    }

    function getAvailableFundsForSupporter(address _supporter) public view returns(uint) {
        return availableFundsForSupporter[_supporter];
    }

    function withdrawSupporterFunds() public {
        require(availableFundsForSupporter[msg.sender] > 0, 'no funds available');
        payable(msg.sender).transfer(availableFundsForSupporter[msg.sender]);
        availableFundsForSupporter[msg.sender] = 0;
    }

    // function withdrawLostFunds() public onlyManager {
    //     get funds blocked in the contract which are not in availableFundsForUser
    //     ...
    //     payable(msg.sender).transfer(address(this).balance);
    // }

}
