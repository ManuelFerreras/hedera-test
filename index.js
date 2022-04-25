const { hethers } = require("@hashgraph/hethers");

require("dotenv").config();
const fs = require("fs");
const { AccountId, PrivateKey } = require("@hashgraph/sdk");

async function main() {

    // Retrieve ENV credentials.
    const signerId = AccountId.fromString(process.env.SIGNER_ID);
    const signerKey = PrivateKey.fromString(process.env.SIGNER_PVKEY); // TO WORK WITH HETHERS, IT MUST BE ECDSA KEY (FOR NOW)
    const aliceId = AccountId.fromString(process.env.ALICE_ID);

    console.log(signerId);
    console.log(signerKey);
    console.log(aliceId);


    // Convert credentials to Solidity Addresses.
    const walletAddress = hethers.utils.getAddressFromAccount(signerId);
    const aliceAddress = hethers.utils.getAddressFromAccount(aliceId);


    // INITIALIZE A PROVIDER AND WALLET
    console.log(`\n- STEP 1 ===================================`);
    const provider = hethers.providers.getDefaultProvider("testnet");


    // Create Account and Check Balances
    const eoaAccount = {
        account: signerId,
        privateKey: `0x${signerKey.toStringRaw()}`, // Convert private key to short format using .toStringRaw()
    };
    const wallet = new hethers.Wallet(eoaAccount, provider);
    console.log(`\n- Alice's address: ${aliceAddress}`);
    console.log(`\n- Wallet address: ${wallet.address}`);
    console.log(`\n- Wallet public key: ${wallet.publicKey}`);

    const balance = await wallet.getBalance(walletAddress);
    console.log(`\n- Wallet address balance: ${hethers.utils.formatHbar(balance.toString())} hbar`);


    // STEP 2 - DEPLOY THE CONTRACT
    console.log(`\n- STEP 2 ===================================`);

    // Define the contract's properties
    const bytecode = fs.readFileSync("./contractBytecode.bin").toString();
    const abi = [
        "constructor(uint totalSupply)",

        // Read-Only Functions
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
        "function symbol() view returns (string)",

        // Authenticated Functions
        "function transfer(address to, uint amount) returns (bool)",

        // Events
        "event Transfer(address indexed from, address indexed to, uint amount)",
    ];

    // Create a ContractFactory object
    const factory = new hethers.ContractFactory(abi, bytecode, wallet);

    // Deploy the contract
    const contract = await factory.deploy(100, { gasLimit: 300000 });

    // Transaction sent by the wallet (signer) for deployment - for info
    const contractDeployTx = contract.deployTransaction;

    // Wait until the transaction reaches consensus (i.e. contract is deployed)
    //  - returns the receipt
    //  - throws on failure (the reciept is on the error)
    const contractDeployWait = await contract.deployTransaction.wait();
    console.log(`\n- Contract deployment status: ${contractDeployWait.status.toString()}`);
    console.log(`\n- Contract deployment tx: ${contractDeployTx}`);

    // Get the address of the deployed contract
    contractAddress = contract.address;
    console.log(`\n- Contract address: ${contractAddress}`);

}

main();