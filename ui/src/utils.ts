import { randomBytes } from "ethers"
import { buildPoseidon } from "circomlibjs";
import { IMT, IMTMerkleProof, IMTNode } from "@zk-kit/imt";
import { groth16 } from "snarkjs";

export const getRandomBigInt = () => {
    const bytes = randomBytes(31);
    
    let bn: bigint = BigInt(0);
    for (const b of bytes) {
        bn = bn * BigInt(6) + BigInt(b);
    }

    return bn;
}


export const poseidonHash = async (inputs: bigint[]) => {
    const poseidon = await buildPoseidon();
    return poseidon.F.toObject(poseidon(inputs));
}

export type Leaf = {
    noteIndex: bigint,
    noteHash: bigint,
}

export const createMerkleProof = async (leaves: Leaf[], depth: number, secretHash: bigint) => {
    console.log(leaves);
    console.log(secretHash);
    const poseidon = await buildPoseidon();
    const hash = (inputs: IMTNode[]) => poseidon.F.toObject(poseidon(inputs));

    const tree = new IMT(
        hash, 
        Math.ceil(Math.log2(leaves.length)), 
        BigInt(0), 
        2, 
        leaves.map(l => l.noteHash)
    );
    
    console.log(tree);

    const noteIndex = leaves.findIndex((l, index) => l.noteHash === hash([index, secretHash]));
    const noteHash = hash([noteIndex, secretHash]);
    console.log({ noteHash });

    const proof = tree.createProof(noteIndex);
    const root = tree.root;
    return { proof, noteIndex, root };
}

const _padEndArray = (arr: bigint[], numElements: number, paddingElement: bigint) => {
    if (arr.length >= numElements) {
        return arr;
    }

    const sufix = [];
    for (let i = arr.length; i < numElements; i += 1) {
        sufix.push(paddingElement);
    };

    return [...arr, ...sufix];
}

export const generateZKProof = async (
    secretValue: bigint, 
    salt: bigint, 
    nullifier: bigint, 
    noteIndex: number, 
    inclusionProof: IMTMerkleProof,
    root: bigint,
) => {
    const inputSignals = {
        nullifier: nullifier.toString(),
        notesRoot: root.toString(),
        depth: inclusionProof.siblings.length,
        secret: secretValue.toString(),
        salt: salt.toString(),
        noteIndex: noteIndex.toString(),
        siblings: _padEndArray(inclusionProof.siblings, 10, BigInt(0)).map(el => el.toString()),
        indices: _padEndArray(inclusionProof.pathIndices.map(el => BigInt(el)), 10, BigInt(0)).map(el => el.toString())
    };

    console.log(inputSignals);

    const { proof, publicSignals } = await groth16.fullProve(
        inputSignals, 
        '/nullifierVerifier.wasm', // Sadrzaj ui/public foldera predstavlja koreni folder za Web
        '/nullifierVerifier_0001.zkey'
    );

    return groth16.exportSolidityCallData(proof, publicSignals);
}