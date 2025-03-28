// SPDX-License-Identifier: MIT
pragma solidity >=0.8.26;

import { LeanIMTData } from "./InternalLeanIMT.sol";
import { LeanIMT } from "./LeanIMT.sol";
import { PoseidonT3 } from "poseidon-solidity/PoseidonT3.sol";
import { Groth16Verifier } from "./Verifier.sol";

contract Mixer {
    uint256 amount;
    uint256 fixedDeposit = 1 ether;
    uint256 fixedWithdraw = 1 ether;
    uint256 noteIndex = 0;
    address owner;

    Groth16Verifier nullifierVerifier;

    LeanIMTData notesTree;
    mapping(uint256 => bool) nullifiers;

    event Deposit(uint256 noteIndex, uint256 noteHash);

    modifier onlyOwner {
        require(msg.sender == owner, "Only owner allowed");
        _;
    }   

    constructor() {
        nullifierVerifier = new Groth16Verifier();
        owner = msg.sender;
    }

    function deposit(uint256 hashSecret) public payable {
        require(msg.value == fixedDeposit, "Invalid deposit amount");
        amount += msg.value;

        uint256 noteHash = PoseidonT3.hash([noteIndex, hashSecret]);
        
        LeanIMT.insert(notesTree, noteHash);

        emit Deposit(noteIndex, noteHash);
        
        noteIndex += 1;
    }

    function getAmount() public view returns (uint256) {
        return amount;
    }

    function withdraw(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint256 nullifier) public {
        bool isVerified = nullifierVerifier.verifyProof(_pA, _pB, _pC, [nullifier, LeanIMT.root(notesTree)]);
        require(isVerified, "Invalid proof");

        (bool isSuccess,) = msg.sender.call{ value: fixedWithdraw }("");
        require(isSuccess, "Transfer failed");
        require(nullifiers[nullifier] == false, "Note already spent");

        nullifiers[nullifier] = true;

        amount -= fixedWithdraw;
    } 

    function setFixedDeposit(uint256 newFixedDeposit) public onlyOwner {
        fixedDeposit = newFixedDeposit;
    }

    function setFixedWithdraw(uint256 newFixedWithdraw) public onlyOwner {
        fixedWithdraw = newFixedWithdraw;
    }

    function getFixedDeposit() public view returns(uint256) {
        return fixedDeposit;
    }

    function getFixedWithdraw() public view returns(uint256) {
        return fixedWithdraw;
    }

    function getNotesRoot() public view returns(uint256) {
        return LeanIMT.root(notesTree);
    }
}

