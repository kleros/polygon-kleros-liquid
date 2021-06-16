pragma solidity ^0.4.24;

interface IChainlinkRNG {
    function requestRN(uint _seed) external returns (bytes32 requestId);
    function getRN(bytes32 _requestId) external returns (uint RN);
}
