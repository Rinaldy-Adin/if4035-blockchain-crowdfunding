import { ContributionHistoryCard } from "@/components/contribution-history/contribution-history-card";
import { NoWalletDetected } from "@/components/home/no-wallet-detected";
import { LoadingPage } from "@/components/loading-page";
import { LoadingIcon } from "@/components/ui/loading-icon";
import { useAuthContext } from "@/context/auth-context";
import { ContributionHistoryItem } from "@/interfaces/project";
import { Layout } from "@/layouts/layout";
import { getUserContributions } from "@/lib/eth/campaignFactory";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

export const ContributionHistory = () => {
  const { web3, isLoading: isAuthLoading, userAcc } = useAuthContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [contributions, setContributions] = useState<ContributionHistoryItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      try {
        if (web3 && userAcc) {
          const contributions = await getUserContributions(web3, userAcc);
          setContributions(contributions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching contribution:', error);
        }
      }
      setLoading(false);
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, [web3, userAcc]);

  if (isAuthLoading) {
    return <LoadingPage />;
  }

  if (!web3) {
    return <NoWalletDetected />;
  }

  return (
    <Layout>
      {/* Title Section */}
      <div className="flex flex-col items-stretch text-center mt-6 mb-4">
        <h1 className="text-3xl font-bold mb-4">Contribution History</h1>

        {/* Grid of Projects */}
        <div className="p-4 w-full">
          {loading ? (
            <div className="flex items-center gap-2 justify-center">
              <LoadingIcon />
              <p>Loading Contributions...</p>
            </div>
          ) : contributions.length > 0 ? (
            <div className="flex flex-col gap-1 items-center">
              {contributions.map((contribution) => (
                <ContributionHistoryCard contribution={contribution} key={contribution.projectAddress + contribution.timestamp} />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-center">
              <SearchIcon />
              <p>No contributions found.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
