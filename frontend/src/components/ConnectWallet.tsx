import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useVerifyCert } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const verifyCertMutation = useVerifyCert();
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyCert = async () => {
    if (!address) return;

    setIsVerifying(true);
    try {
      await verifyCertMutation.mutateAsync(address);
    } finally {
      setIsVerifying(false);
    }
  };

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
        variant="outline"
        size="sm"
        onClick={handleVerifyCert}
        disabled={verifyCertMutation.isPending || isVerifying}
        className="gap-2"
      >
        <CheckCircle className="h-4 w-4" />
        {verifyCertMutation.isPending || isVerifying ? 'Verifying...' : 'Verify 0xCerts'}
      </Button>

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
