pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/mux1.circom";
include "../node_modules/circomlib/circuits/comparators.circom";


template MerkleTreeInclusionProof(maxdepth) {
    signal input leaf;
    signal input siblings[maxdepth];
    signal input indices[maxdepth];
    signal input depth;

    signal output root;

    signal hashes[maxdepth + 1];
    hashes[0] <== leaf;

    component hasher[maxdepth];
    component mux[maxdepth];
    component depthMux[maxdepth];
    component depthCmp[maxdepth];

    for (var i = 0; i < maxdepth; i++) {
        hasher[i] = Poseidon(2);
        mux[i] = MultiMux1(2);
        depthMux[i] = Mux1();
        depthCmp[i] = LessEqThan(10);

        mux[i].c[0][0] <== hashes[i];
        mux[i].c[0][1] <== siblings[i];
    
        mux[i].c[1][0] <== siblings[i];
        mux[i].c[1][1] <== hashes[i];

        indices[i] * (1 - indices[i]) === 0;
        mux[i].s <== indices[i];

        hasher[i].inputs[0] <== mux[i].out[0];
        hasher[i].inputs[1] <== mux[i].out[1];

        depthCmp[i].in[0] <== depth;
        depthCmp[i].in[1] <== i;

        // Enable variable tree depth up to maxdepth
        depthMux[i].c[0] <== hasher[i].out;
        depthMux[i].c[1] <== hashes[i];
        depthMux[i].s <== depthCmp[i].out;

        hashes[i + 1] <== depthMux[i].out;
    }

    root <== hashes[maxdepth];
}

template NullifierVerifier(maxdepth) {
    // Public inputs
    signal input nullifier;
    signal input notesRoot;
    signal input depth;

    // Private inputs
    signal input secret;
    signal input salt;
    signal input noteIndex;
    signal input siblings[maxdepth];
    signal input indices[maxdepth];

    // Compute hashSecret
    component secretHasher = Poseidon(2);
    secretHasher.inputs[0] <== secret;
    secretHasher.inputs[1] <== salt;
    
    // Construct note hash
    component noteHasher = Poseidon(2);
    noteHasher.inputs[0] <== noteIndex;
    noteHasher.inputs[1] <== secretHasher.out;

    // Check note hash inclusion in the notes tree
    component noteInclusionVerifier = MerkleTreeInclusionProof(maxdepth);
    noteInclusionVerifier.leaf <== noteHasher.out;
    noteInclusionVerifier.depth <== depth;

    for (var i = 0; i < maxdepth; i++) {
        noteInclusionVerifier.siblings[i] <== siblings[i];
        noteInclusionVerifier.indices[i] <== indices[i];
    }

    noteInclusionVerifier.root === notesRoot;

    // Compute nullifier
    component nullifierHasher = Poseidon(1);
    nullifierHasher.inputs[0] <== secret;

    // Check nullifier
    nullifierHasher.out === nullifier;
}

component main { public [ nullifier, notesRoot ] } = NullifierVerifier(10);