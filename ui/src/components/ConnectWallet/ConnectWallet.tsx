import { MetaMaskInpageProvider } from "@metamask/providers";
import { BrowserProvider } from "ethers";
import { useContext } from "react";
import { WalletContext } from "../../contexts/WalletContext";

declare global {
  interface Window{
    ethereum?: MetaMaskInpageProvider,
  }
}

export const ConnectWallet = () => {
    const { setConnectedWallet } = useContext(WalletContext);

    const connect = async () => {
        if (window.ethereum) {
            const provider = new BrowserProvider(window.ethereum);
            // It will prompt user for account connections if it isnt connected
            const signer = await provider.getSigner();
            setConnectedWallet(signer);
        } else {
            alert('Metamask extension not found!')
        }
    }

    return (
        <button onClick={() => connect()}>Connect Wallet</button>
    )
}