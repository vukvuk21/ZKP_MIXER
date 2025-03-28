// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MixerModule = buildModule("MixerModule", (m) => {
  const poseidonLib = m.library("PoseidonT3");
  const leanImtLib = m.contract("LeanIMT", [], { 
    libraries: { PoseidonT3: poseidonLib }
  });

  const mixer = m.contract("Mixer", [], {
    libraries: {
      PoseidonT3: poseidonLib,
      LeanIMT: leanImtLib,
    }
  });

  return { mixer };
});

export default MixerModule;
