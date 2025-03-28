import { JsonRpcSigner } from "ethers";
import { createContext, ReactNode, useState } from "react";

interface IWalletContext {
    connectedWallet: JsonRpcSigner | null,
    setConnectedWallet: (address: JsonRpcSigner) => void, 
}

export const WalletContext = createContext<IWalletContext>({
    connectedWallet: null,
    setConnectedWallet: () => {}
});

const WalletContextProvider = ({ children }: { children: ReactNode }) => {
    const [connectedWallet, setConnectedWallet] = useState<JsonRpcSigner | null>(null);

    return (
        <WalletContext.Provider value={{ connectedWallet, setConnectedWallet }}>
            { children }
        </WalletContext.Provider>
    )
}

export default WalletContextProvider;