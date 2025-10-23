import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return (
      <Button
        onClick={() => connectors[0] && connect({ connector: connectors[0] })}
        variant="outline"
        className="gap-2"
      >
        <Wallet className="h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg border border-border bg-secondary/50 px-3 py-2">
        <p className="text-sm font-medium">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => disconnect()}
      >
        Disconnect
      </Button>
    </div>
  );
}
