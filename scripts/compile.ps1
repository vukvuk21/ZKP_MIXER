# Create build folder
mkdir -p build

# Compile Circom
circom circuits/nullifierVerifier.circom --r1cs --wasm -o build

# Gnerate powers of tau
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v

# Phase 1
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v --entropy="17463847645839726"

# Phase 2
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
snarkjs groth16 setup build/nullifierVerifier.r1cs pot12_final.ptau build/nullifierVerifier_0000.zkey
snarkjs zkey contribute build/nullifierVerifier_0000.zkey build/nullifierVerifier_0001.zkey --name="1st Contributor Name" -v --entropy="9034570348758423748"

# Exporty solidity verifier
snarkjs zkey export solidityverifier build/nullifierVerifier_0001.zkey contracts/Verifier.sol