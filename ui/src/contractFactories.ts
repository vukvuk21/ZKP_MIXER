import { JsonRpcSigner } from "ethers";
import mixerMetadata from "../../artifacts/contracts/Mixer.sol/Mixer.json";
import { Contract } from "ethers";

export const creteMixerContract = (signer: JsonRpcSigner) => {
    const mixerAbi = mixerMetadata.abi;
    return new Contract(import.meta.env.VITE_MIXER_CONTRACT_ADDRESS, mixerAbi, signer);
}