# ZKP_MIXER

A privacy-preserving mixer application built using Zero-Knowledge Proofs (ZKPs). Users can deposit and withdraw funds anonymously by generating a Groth16 proof that verifies their inclusion in a valid deposit set, without revealing which deposit was theirs. The system uses Circom circuits for proof generation, Solidity smart contracts for on-chain verification, and a React frontend integrated with MetaMask.

## Features

- Circom circuits for deposit and withdrawal logic
- Groth16 proving system for Zero-Knowledge Proofs
- Solidity verifier contract deployed with Hardhat
- React-based frontend with MetaMask wallet integration
- Full ZKP flow: deposit → generate proof → verify on-chain → withdraw anonymously

## Technologies Used

- [Circom](https://docs.circom.io/)
- [snarkjs](https://github.com/iden3/snarkjs)
- [Groth16](https://docs.circom.io/advanced/proving-systems/groth16/)
- [Hardhat](https://hardhat.org/)
- [Solidity](https://soliditylang.org/)
- [React](https://react.dev/)
- [MetaMask](https://metamask.io/)

## Requirements

- Node.js and npm
- Circom and snarkjs installed globally
- MetaMask browser extension
- Hardhat installed locally (`npm install --save-dev hardhat`)

