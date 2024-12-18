import Web3 from "web3";
import MewAuctionApp from "../abi/contracts/CampaignFactory.sol/CampaignFactory.json";

const FACTORY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export function getCampaignFactoryContract(web3: Web3) {
    return new web3.eth.Contract(MewAuctionApp.abi, FACTORY_ADDRESS);
}

export async function createCampaign(
    web3: Web3,
    fromAddress: string,
    campaignName: string,
    campaignDescription: string,
    milestoneNames: string[],
    milestoneDescriptions: string[],
    milestoneGoals: string[]
): Promise<void> {
    try {
        const campaignFactory = getCampaignFactoryContract(web3);

        console.log({ fromAddress, milestoneGoals });
        const receipt = await campaignFactory.methods
            .createCampaign(campaignName, campaignDescription, milestoneNames, milestoneDescriptions, milestoneGoals)
            .send({
                from: fromAddress,
                gas: "3000000",
            });

        console.log("Campaign created successfully!");
        console.log("Transaction Receipt:", receipt);
    } catch (error) {
        console.error("Error creating campaign:", error);
    }
}

export async function getDeployedCampaigns(web3: Web3): Promise<string[]> {
    try {
        const campaignFactory = getCampaignFactoryContract(web3);

        const campaigns: string[] = await campaignFactory.methods.getDeployedCampaigns().call();

        console.log("Deployed Campaign Addresses:", campaigns);
        return campaigns;
    } catch (error) {
        console.error("Error fetching deployed campaigns:", error);
        throw error;
    }
}
