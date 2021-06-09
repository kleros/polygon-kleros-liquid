pragma solidity ^0.4.24;

import {IChainlinkRNG} from "../interfaces/IChainlinkRNG.sol";
import { KlerosLiquid } from "../kleros/KlerosLiquid.sol";

contract MockChainlinkRNG is IChainlinkRNG {
    uint256 public number;
    bytes32 public lastRequestId;
    mapping(bytes32 => uint256) public randomNumbers;
    KlerosLiquid public klerosLiquid;

    modifier onlyByKleros() {
        require(msg.sender == address(klerosLiquid), "");
        _;
    }

    /** @dev Constructor.
     *  @param _number The constant number to always return.
     *  @param _klerosLiquid Kleros Liquid contract address.
     */
    constructor(uint256 _number, KlerosLiquid _klerosLiquid) public {
        number = _number;
        klerosLiquid = _klerosLiquid;
    }

    function changeKlerosLiquid(KlerosLiquid _klerosLiquid) external onlyByKleros {
        klerosLiquid = _klerosLiquid;
    }

    function requestRN(uint256 _seed) external onlyByKleros returns(bytes32 requestId) {
        requestId = keccak256(abi.encodePacked(_seed, block.timestamp));
        lastRequestId = requestId;
    }

    function getRN(bytes32 _requestId) external returns(uint256 RN) {
        return randomNumbers[_requestId];
    }

    function rawFulfillRandomness(bytes32 _requestId) external {
        randomNumbers[_requestId] = number;
        klerosLiquid.passPhase();
    }
}
