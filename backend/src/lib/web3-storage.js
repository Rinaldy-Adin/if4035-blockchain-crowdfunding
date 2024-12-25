import * as Signer from "@ucanto/principal/ed25519";
import {StoreMemory} from "@web3-storage/w3up-client/stores/memory";
import * as Client from "@web3-storage/w3up-client";
import {CarReader} from "@ipld/car";
import {importDAG} from "@ucanto/core/delegation";

async function parseProof(data) {
    const blocks = [];
    const reader = await CarReader.fromBytes(Buffer.from(data, 'base64'));
    for await (const block of reader.blocks()) {
        blocks.push(block);
    }
    return importDAG(blocks);
}
export async function initializeWeb3Client() {
    const principal = Signer.parse(process.env.IPFS_KEY);
    const store = new StoreMemory();
    const client = await Client.create({ principal, store });

    const proof = await parseProof(process.env.IPFS_PROOF);
    const space = await client.addSpace(proof);
    await client.setCurrentSpace(space.did());

    return client;
}