const { Client, Hbar, FileCreateTransaction, FileContentsQuery } = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {

    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.ACCOUNT_ID;
    const myPrivateKey = process.env.PRIVATE_KEY;
    const myPublicKey = process.env.PUBLIC_KEY;

    // If we weren't able to grab it, we should throw a new error
    if (myAccountId == null ||
        myPrivateKey == null ) {
        throw new Error("Environment variables myAccountId and myPrivateKey must be present");
    }

    // Create our connection to the Hedera network
    // The Hedera JS SDK makes this really easy!
    const client = Client.forTestnet();

    client.setOperator(myAccountId, myPrivateKey);
    const public = client.operatorPublicKey;

   //Create the transaction
    const transaction = await new FileCreateTransaction()
        .setKeys([public])
        .setContents("hola")
        .setMaxTransactionFee(new Hbar(2))
        .execute(client);


    const id = await (await transaction.getReceipt(client)).fileId;
    console.log(id);

    //Create the query
    const query = new FileContentsQuery()
        .setFileId(id);

    //Sign with client operator private key and submit the query to a Hedera network
    const contents = await query.execute(client);

    console.log(contents.toString());

    

    //v2.0.7
}
main();