// SPDX-License-Identifier: MIT

pragma solidity >=0.4.22 <0.9.0;

import "./Artworks.sol";

contract Cryptogram {
    address[] public contracts;

    function getCurrentVersion() public view returns(address) {
        return contracts[contracts.length];
    }
}
