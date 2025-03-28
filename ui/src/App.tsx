import { useContext, useEffect, useState } from 'react'
import './App.css'
import { ConnectWallet } from './components/ConnectWallet/ConnectWallet'
import { WalletContext } from './contexts/WalletContext'
import { Contract, formatEther } from 'ethers';
import { creteMixerContract } from './contractFactories';
import { createMerkleProof, generateZKProof, getRandomBigInt, poseidonHash } from './utils';

function App() {
  const { connectedWallet } = useContext(WalletContext);
  const [mixerContract, setMixerContract] = useState<Contract|null>(null);
  const [fixedParams, setFixedParams] = useState<{ fixedDeposit: number, fixedWithdraw: number}|null>(null);
  const [depositHash, setDepositHash] = useState<bigint|null>(null);
  const [secretValue, setSecretValue] = useState<bigint|null>(null);
  const [depositSalt, setDepositSalt] = useState<bigint|null>(null);

  const loadFixedValues = async () => {
    const fixedDeposit = await mixerContract!.getFixedDeposit();
    const fixedWithdraw = await mixerContract!.getFixedWithdraw();
    setFixedParams({ fixedDeposit, fixedWithdraw });
  }

  useEffect(() => {
    if (connectedWallet != null) {
      setMixerContract(creteMixerContract(connectedWallet));
    }
  }, [connectedWallet])

  useEffect(() => {
    if (mixerContract) {
      loadFixedValues()
    }
  }, [mixerContract]);

  if (connectedWallet == null) {
    return (
      <ConnectWallet/>
    )
  }

  const depositFunds = async () => {
    const newSecretValue = getRandomBigInt();
    const salt = getRandomBigInt();
    const hash = await poseidonHash([newSecretValue, salt]);
    setDepositHash(hash);
    setDepositSalt(salt);
    setSecretValue(newSecretValue);

    const tx = await mixerContract!.deposit(hash,{ value: fixedParams!.fixedDeposit });
    tx.wait();
    alert('Deposit successful!');
  }

  const withdrawFunds = async () => {
    const currentBlock = await connectedWallet.provider.getBlockNumber();
    const rawEvents = await mixerContract!.queryFilter('Deposit', 0, currentBlock);
    const parsedEvents = rawEvents.map(e => ({ noteIndex: e.args.noteIndex, noteHash: e.args.noteHash }));
    console.log(parsedEvents);

    // Construct Merkle tree
    const { root, proof: inclusionProof, noteIndex } = await createMerkleProof(parsedEvents, 3, depositHash!);
    
    // Generate ZK proof
    const salt = depositSalt;
    const nullifier = await poseidonHash([secretValue!]);

    const zkProofRaw = await generateZKProof(secretValue!, salt!, nullifier, noteIndex, inclusionProof, root)
    const zkProof = JSON.parse(`[${zkProofRaw}]`);
    
    const tx = await mixerContract!.withdraw(zkProof[0], zkProof[1], zkProof[2], nullifier);
    try {
      await tx.wait();
      alert("Withdraw successful!");
    } catch(err) {
      alert("Withdraw failed!");
      console.log(err);
    }
    
  }

  return (
    <>
      <p>Connected wallet: { connectedWallet?.address }</p>
      <p>Contract address: {import.meta.env.VITE_MIXER_CONTRACT_ADDRESS}</p>
      
      { 
      fixedParams &&
        <>
          <p>Fixed deposit: { formatEther(fixedParams.fixedDeposit) } ETH</p>
          <p>Fixed withdraw: { formatEther(fixedParams.fixedWithdraw) } ETH</p>

          <button onClick={() => depositFunds()}>Deposit funds</button>
          {
            depositHash &&
            <button onClick={() => withdrawFunds()}>Withdraw funds</button>
          }
          
        </>
      }
      {
        depositHash &&
        <p>Deposit hash: {depositHash}</p>
      }
    </>
  )
}

export default App
