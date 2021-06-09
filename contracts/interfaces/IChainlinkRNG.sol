pragma solidity ^0.4.24;

///@dev See https://blockscout.com/poa/xdai/address/0x5870b0527DeDB1cFBD9534343Feda1a41Ce47766/contracts
///@dev Sokol testnet: https://blockscout.com/poa/sokol/address/0x8f2b78169B0970F11a762e56659Db52B59CBCf1B/contracts
interface IChainlinkRNG {
    function requestRN(uint _seed) external returns (bytes32 requestId);
    function getRN(bytes32 _requestId) external returns (uint RN);
}
