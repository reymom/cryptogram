// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.9.0;

import "./ERC721.sol";

contract Artworks is ERC721 {

    /** CONSTRUCTOR **/
    address public manager;
    uint256 private lockedFunds;
    uint256 private decimalPrecision; // 10**5
    uint256 totalSupply;
    uint64 public priceIncreaseForLike; // max with uint64 will be 18 ethers
    uint8 public alfaDecayFraction; // 2 so that the first 1/2 of likes gets 3/4 of funds

    constructor(
        uint256 _decimalPrecision,
        uint64 _priceIncreaseForLike,
        uint8 _alfaDecayFraction
    ) ERC721("Cryptogram", "CRG") {
        manager = msg.sender;
        decimalPrecision = _decimalPrecision;
        priceIncreaseForLike = _priceIncreaseForLike;
        alfaDecayFraction = _alfaDecayFraction;
    }

    /** MODIFIERS **/
    modifier onlyManager {
        require(msg.sender == manager,"only manager");
        _;
    }

    /** EVENTS **/
    event newArtwork(
        uint256 artworkId,
        uint256 initialPrice,
        uint256 participationPercentage,
        address indexed creator,
        string description,
        string tag,
        string IPFShash
    );

    event artworkBought(
        uint256 artworkId,
        uint256 purchasePrice,
        address indexed seller,
        address indexed collector,
        string IPFShash
    );

    event artworkSupported(
        uint256 artworkId,
        address supporter
    );

    // event newOffer(
    //     address userAddress,
    //     uint256 indexed artworkId,
    //     uint256 priceOffered,
    //     uint256 limitTime
    // );

    /** STRUCTS **/
    struct Artwork {
        uint256 creationDate;
        uint256 lastPurchaseDate;
        uint256 priceSpent;
        uint256 initialPrice;
        uint64 totalLikes;
        uint8 participationPercentage;
        string description;
        string tag;
        string IPFShash;
        address creator;
        address[] supporters;
        // Offer[] offers;
    }

    struct Offer {
        address userAddress;
        uint256 priceOffered;
        uint256 limitTime;
    }

    /*** STORAGE ***/
    Artwork[] artworks;

    mapping(address => uint256) tokensCreated;
    mapping(address => uint256) tokensBought;
    mapping(address => uint256) availableFundsForSupporter;
    mapping(string => bool) _IPFShashExists;

    /*** LOGIC ***/
    function getContractFunds() public view onlyManager returns(uint256) {
        return address(this).balance;
    }

    // Due to decimal precision bounds security at distributing funds
    function getLockedFunds() public view onlyManager returns(uint256) {
        return lockedFunds;
    }

    // function withdrawLostFunds() public onlyManager {
    //     require(state == "finished", 'This contract is active');
    //     require(address(this).balance > 0, 'No funds');
    //     payable(msg.sender).transfer(address(this).balance);
    // }

    function withdrawLockedFunds() public onlyManager {
        require(lockedFunds > 0, 'No locked funds yet');
        uint256 value = lockedFunds;
        payable(msg.sender).transfer(value);
        lockedFunds -= value;
    }

    function getAvailableFundsForSupporter(address _supporter) public view returns(uint256) {
        return availableFundsForSupporter[_supporter];
    }

    function withdrawSupporterFunds() public {
        require(availableFundsForSupporter[msg.sender] > 0, 'no funds available');
        payable(msg.sender).transfer(availableFundsForSupporter[msg.sender]);
        availableFundsForSupporter[msg.sender] = 0;
    }

    function getTotalSupply() external view returns (uint256) {
        return totalSupply;
    }

    function getNumTokensCreated(address _creator) external view returns(uint256) {
        return tokensCreated[_creator];
    }

    function getNumTokensBought(address _creator) external view returns(uint256) {
        return tokensBought[_creator];
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

    function getTokenInfo(uint _artworkId) external view returns (
        address, uint256, uint256, uint256, uint256, uint64, uint8, string memory, string memory, string memory
    ) {
        Artwork memory _artwork = artworks[_artworkId];
        return (
            _artwork.creator,
            _artwork.creationDate,
            _artwork.lastPurchaseDate,
            _artwork.priceSpent,
            _artwork.initialPrice,
            _artwork.totalLikes,
            _artwork.participationPercentage,
            _artwork.description,
            _artwork.tag,
            _artwork.IPFShash
        );
    }

    function getSupportersOfArtwork(uint256 _artworkId) external view returns(address[] memory) {
        Artwork memory _artwork = artworks[_artworkId];
        uint64 numLikes = _artwork.totalLikes;
        if (numLikes == 0) {
            return new address[](0);
        } else {
            address[] memory result = new address[](numLikes);
            uint64 resultIndex = 0;
            for (uint64 supporterId = 0; supporterId < numLikes; supporterId++) {
                result[resultIndex] = _artwork.supporters[supporterId];
                resultIndex++;
            }
            return result;
        }
    }

    function createArtwork(
        string memory _description,
        string memory _tag,
        string memory _IPFShash,
        uint256 _initialPrice,
        uint8 _participationPercentage
    ) public returns (bool) {
        require(!_IPFShashExists[_IPFShash], 'CRG: hash already registered');

        Artwork memory _artwork =
            Artwork({
                creationDate: block.timestamp,
                lastPurchaseDate: 0,
                priceSpent: 0,
                initialPrice: _initialPrice,
                totalLikes: 0,
                participationPercentage: _participationPercentage,
                description: _description,
                tag: _tag,
                IPFShash: _IPFShash,
                creator: msg.sender,
                supporters: new address[](0)
                // offers: new Offer[](0)
            });

        artworks.push(_artwork);
        totalSupply = artworks.length;
        uint256 artworkId = artworks.length - 1;
        tokensCreated[msg.sender] += 1;
        _mint(msg.sender, artworkId);
        _IPFShashExists[_IPFShash] = true;

        emit newArtwork(
            artworkId,
            _artwork.initialPrice,
            _artwork.participationPercentage,
            _artwork.creator,
            _artwork.description,
            _artwork.tag,
            _artwork.IPFShash
        );

        // if (artworkId == uint(1.1579208*10**77) ) {
        //    endContract and create New on
        // }

        return true;
    }

    function supportArtwork(uint256 _artworkId) public returns (bool) {
        Artwork storage _artwork = artworks[_artworkId];
        require(_artwork.creator != msg.sender, 'You cannot put a like in your own creations');
        require(!_isSupporterOfArtwork(_artworkId, msg.sender), 'You are already supporting this artwork');
        _artwork.totalLikes += 1;
        // add supporter
        artworks[_artworkId].supporters.push(msg.sender);
        emit artworkSupported(
            _artworkId,
            msg.sender
        );
        return true;
    }

    function _isSupporterOfArtwork(uint256 _artworkId, address _supporter) internal view returns(bool) {
        Artwork memory _artwork = artworks[_artworkId];
        uint64 numLikes = _artwork.totalLikes;
        if (numLikes == 0) {
            return false;
        } else {
            bool isSupporter;
            uint64 resultIndex = 0;
            for (uint64 supporterId = 0; supporterId < numLikes; supporterId++) {
                if (_artwork.supporters[supporterId] == _supporter) {
                    isSupporter = true;
                }
                resultIndex++;
            }
            return isSupporter;
        }
    }

    // function makeOffer(uint256 _artworkId, uint256 _priceOffered, uint256 _limitTime) public returns (bool) {
    //     Artwork storage _artwork = artworks[_artworkId];
    //     require(
    //         _artwork.priceSpent == 0,
    //         'You must purchase it directly'
    //     );
    //     Offer memory _offer =
    //         Offer({
    //             msg.sender,
    //             _priceOffered,
    //             _limitTime
    //         });
    //     artworks[_artworkId].offers.push(_offer);
    //     emit newOffer(
    //         msg.sender,
    //         _artworkId,
    //         _priceOffered
    //     );
    //     return true;
    // }

    // function approveOffer()
    // play with ERC721-implemented info
    // getApproved(uint256 tokenId)
    // approve(address to, uint256 tokenId)

    function _updateArtworkOnPurchase(uint256 _artworkId, uint256 finalPrice) internal {
        Artwork storage _artwork = artworks[_artworkId];
        _artwork.lastPurchaseDate = block.timestamp;
        _artwork.priceSpent += finalPrice;
    }

    function getCurrentPrice(uint256 _artworkId) public view returns (uint256) {
        Artwork memory _artwork = artworks[_artworkId];
        return _artwork.initialPrice + priceIncreaseForLike * uint256(_artwork.totalLikes);
    }

    function buyArtworkToCreator(uint256 _artworkId) public payable returns (bool) {
        require(msg.sender != ownerOf(_artworkId), 'The artwork is already yours');
        Artwork memory _artwork = artworks[_artworkId];
        // require(_artwork.priceSpent == 0, 'You must make an offer to the current owner to buy it');
        uint64 numLikes = _artwork.totalLikes;
        uint256 finalPrice = _artwork.initialPrice + priceIncreaseForLike * uint256(numLikes);
        require(msg.value == finalPrice, 'You must pay the price!');
        // pay the artist
        uint256 artistPrice = (finalPrice * uint256(100 - _artwork.participationPercentage)) / 100;
        (bool success,) = payable(ownerOf(_artworkId)).call{value: artistPrice}('');
        require(success, 'Transfer to owner failed');
        // make the property transfer
        tokensBought[msg.sender] += 1;
        _transfer(ownerOf(_artworkId), msg.sender, _artworkId);
        _updateArtworkOnPurchase(_artworkId, finalPrice);

        // register funds so that supporters can extract it later
        uint256 supportersPrice = (finalPrice * _artwork.participationPercentage) / 100;
        bool distributed = _registerSupporterFunds(_artworkId, supportersPrice);

        // uint64 supporterId;
        // uint64 supporterPrice = supportersPrice / numLikes;
        // for (supporterId = 0; supporterId < numLikes; supporterId++) {
        //     availableFundsForSupporter[_artwork.supporters[supporterId]] += supporterPrice;
        // }

        emit artworkBought(
            _artworkId,
            finalPrice,
            ownerOf(_artworkId),
            msg.sender,
            _artwork.IPFShash
        );

        if (distributed) {
            return true;
        } else return false;
    }

    // function buyArtworkToCollectionist(uint256 _artworkId) public payable returns (bool) {
    // lo mismo pero un TransferFrom, así que necesitará aceptación antes
    // }

    // Cumulative function of a log-logistic distribution, with beta=1 and alfa parametrized
    function _distributionPart(uint64 _index, uint256 _alfa) internal view returns (uint256) {
        uint256 leftSide = decimalPrecision**2 / ( 
            decimalPrecision + (uint256(_index)*decimalPrecision**2 / _alfa) / decimalPrecision );
        uint256 rightSide = decimalPrecision**2 / ( 
            decimalPrecision + (uint256(_index + 1)*decimalPrecision**2 / _alfa) / decimalPrecision );
        return leftSide - rightSide;
    }

    function _registerSupporterFunds(
        uint256 _artworkId,
        uint256 _supportersPrice
    ) internal returns (bool) {
        Artwork storage _artwork = artworks[_artworkId];
        uint64 numLikes = _artwork.totalLikes;
        if (numLikes == 0) {
            availableFundsForSupporter[ownerOf(_artworkId)] += _supportersPrice;
        } else if (numLikes == 1) {
            availableFundsForSupporter[_artwork.supporters[0]] += _supportersPrice;
        } else {
            uint256 alfa = uint256(numLikes) / uint256(alfaDecayFraction);
            // normalization constant
            uint256 summatory;
            for (uint64 id = 1; id <= numLikes; id++) {
                summatory += _distributionPart(id, alfa);
            }
            // distribute funds according to the normalized cumulative distribution
            uint256 fundsSum;
            for (uint64 supporterId = 0; supporterId < numLikes; supporterId++) {
                uint256 rawPart = (_supportersPrice*_distributionPart(supporterId + 1, alfa)*decimalPrecision) / (summatory + 10);
                uint256 value = rawPart / decimalPrecision;
                availableFundsForSupporter[_artwork.supporters[supporterId]] += value;
                fundsSum += value;
            }
            lockedFunds += (_supportersPrice - fundsSum);
        }
        return true;
    }

}