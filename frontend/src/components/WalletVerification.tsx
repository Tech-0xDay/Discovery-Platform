import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, CheckCircle2, XCircle, Loader2, AlertCircle, Github, ExternalLink, Shield, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/api';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function WalletVerification() {
  const { user, refreshUser } = useAuth();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [verifying, setVerifying] = useState(false);
  const [connectingGithub, setConnectingGithub] = useState(false);

  // Check for GitHub OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const githubSuccess = params.get('github_success');
    const githubUsername = params.get('github_username');
    const githubError = params.get('github_error');

    if (githubSuccess === 'true' && githubUsername) {
      toast.success(`GitHub connected! Welcome @${githubUsername}`);
      if (refreshUser) {
        refreshUser();
      }
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (githubError) {
      toast.error(`GitHub connection failed: ${githubError}`);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [refreshUser]);

  const handleVerifyCert = async () => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    setVerifying(true);
    try {
      const token = localStorage.getItem('token'); // Changed from 'access_token' to 'token'

      if (!token) {
        toast.error('Not authenticated. Please log in again.');
        setVerifying(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/blockchain/verify-cert`,
        { wallet_address: address },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === 'success') {
        const hasCert = response.data.data.has_cert;

        if (hasCert) {
          toast.success('0xCert verified! Your projects now have +10 verification score');
        } else {
          toast.error('No 0xCert found in this wallet');
        }

        // Refresh user data
        if (refreshUser) {
          await refreshUser();
        }
      }
    } catch (error: any) {
      console.error('Cert verification error:', error);
      toast.error(error.response?.data?.message || 'Failed to verify 0xCert');
    } finally {
      setVerifying(false);
    }
  };

  const handleGithubConnect = async () => {
    setConnectingGithub(true);
    try {
      const response = await authService.githubConnect();
      const authUrl = response.data.data.auth_url;
      // Redirect to GitHub OAuth
      window.location.href = authUrl;
    } catch (error: any) {
      console.error('GitHub connect error:', error);
      toast.error(error.response?.data?.message || 'Failed to connect GitHub');
      setConnectingGithub(false);
    }
  };

  const handleGithubDisconnect = async () => {
    try {
      await authService.githubDisconnect();
      toast.success('GitHub account disconnected');
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error: any) {
      console.error('GitHub disconnect error:', error);
      toast.error(error.response?.data?.message || 'Failed to disconnect GitHub');
    }
  };

  return (
    <Card className="card-elevated p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-foreground mb-2 flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            Wallet & 0xCert Verification
          </h2>
          <p className="text-sm text-muted-foreground">
            Connect your wallet and verify your 0xCert NFT to increase your verification score by +10 points
          </p>
        </div>

        {/* Verification Status */}
        <div className="bg-primary/10 border-2 border-primary/20 rounded-lg p-4">
          <h3 className="font-bold text-foreground mb-3">Verification Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email Verified</span>
              {user?.isVerified || user?.email_verified ? (
                <Badge className="badge-success gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  +5 points
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Not verified
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Wallet Connected</span>
              {isConnected && address ? (
                <Badge className="badge-success gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {address.slice(0, 6)}...{address.slice(-4)}
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Not connected
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">0xCert NFT</span>
              {user?.hasOxcert || user?.has_oxcert ? (
                <div className="flex items-center gap-2">
                  <Badge className="badge-success gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    +10 points
                  </Badge>
                  {user.oxcert_token_id && user.full_wallet_address && (
                    <a
                      href={`https://kairos.kaiascan.io/account/${user.full_wallet_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-primary/10 rounded transition-smooth"
                      title="View on Kairos Explorer"
                    >
                      <ExternalLink className="h-3 w-3 text-primary" />
                    </a>
                  )}
                </div>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Not verified
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">GitHub Connected</span>
              {user?.github_connected ? (
                <Badge className="badge-success gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  @{user?.github_username} +5 points
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1">
                  <XCircle className="h-3 w-3" />
                  Not connected
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* NFT Metadata Display */}
        {(user?.hasOxcert || user?.has_oxcert) && user?.oxcert_metadata && (
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20 rounded-lg p-4">
            <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Your 0xCert NFT
            </h3>
            <div className="space-y-3">
              {/* NFT Image */}
              {user.oxcert_metadata.image && (
                <div className="relative w-full aspect-square max-w-xs mx-auto rounded-lg overflow-hidden border-2 border-primary/30">
                  <img
                    src={user.oxcert_metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                    alt={user.oxcert_metadata.name || '0xCert NFT'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden absolute inset-0 flex items-center justify-center bg-secondary/50">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                </div>
              )}

              {/* NFT Details */}
              <div className="space-y-2">
                {user.oxcert_metadata.name && (
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="text-sm font-semibold text-foreground">{user.oxcert_metadata.name}</p>
                  </div>
                )}
                {user.oxcert_metadata.description && (
                  <div>
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm text-foreground">{user.oxcert_metadata.description}</p>
                  </div>
                )}
                {user.oxcert_token_id && (
                  <div>
                    <p className="text-xs text-muted-foreground">Token ID</p>
                    <p className="text-sm font-mono text-foreground">#{user.oxcert_token_id}</p>
                  </div>
                )}
                {user.oxcert_metadata.attributes && user.oxcert_metadata.attributes.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Attributes</p>
                    <div className="grid grid-cols-2 gap-2">
                      {user.oxcert_metadata.attributes.map((attr, idx) => (
                        <div key={idx} className="bg-secondary/30 rounded p-2 border border-border">
                          <p className="text-xs text-muted-foreground">{attr.trait_type}</p>
                          <p className="text-sm font-medium text-foreground">{attr.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Explorer Links */}
              <div className="flex flex-wrap gap-2 pt-2">
                {user.full_wallet_address && (
                  <a
                    href={`https://kairos.kaiascan.io/account/${user.full_wallet_address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-xs inline-flex items-center gap-2"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Wallet on Explorer
                  </a>
                )}
                {user.oxcert_token_id && user.full_wallet_address && (
                  <a
                    href={`https://kairos.kaiascan.io/token/${import.meta.env.VITE_OXCERTS_CONTRACT_ADDRESS}?a=${user.oxcert_token_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs inline-flex items-center gap-2"
                  >
                    <Shield className="h-3 w-3" />
                    View NFT on Explorer
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Wallet Connection */}
        <div className="space-y-3">
          {!isConnected ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Step 1: Connect Your Wallet</p>
              {connectors.map((connector) => (
                <Button
                  key={connector.id}
                  onClick={() => connect({ connector })}
                  className="btn-primary w-full"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect {connector.name}
                </Button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-md border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Connected Wallet</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {address}
                  </p>
                </div>
                <Button
                  onClick={() => disconnect()}
                  variant="outline"
                  size="sm"
                  className="btn-secondary"
                >
                  Disconnect
                </Button>
              </div>

              {/* Verify 0xCert */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Step 2: Verify 0xCert NFT</p>
                <Button
                  onClick={handleVerifyCert}
                  disabled={verifying}
                  className="btn-primary w-full"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Verify 0xCert Ownership
                    </>
                  )}
                </Button>
                <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                  <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    This will check if your wallet owns a 0xCert NFT on Kaia Testnet (Kairos).
                    If verified, all your projects will receive +10 verification score.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* GitHub Connection */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground flex items-center gap-2">
            <Github className="h-4 w-4" />
            {user?.github_connected ? 'GitHub Account Connected' : 'Connect GitHub Account'}
          </p>
          {!user?.github_connected ? (
            <>
              <Button
                onClick={handleGithubConnect}
                disabled={connectingGithub}
                className="btn-primary w-full"
              >
                {connectingGithub ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Github className="mr-2 h-4 w-4" />
                    Connect with GitHub
                  </>
                )}
              </Button>
              <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Connect your GitHub account to earn +5 verification score and enable automatic validation of GitHub URLs in your projects.
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between p-3 bg-secondary/20 rounded-md border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">@{user?.github_username}</p>
                <p className="text-xs text-muted-foreground">+5 verification score earned</p>
              </div>
              <Button
                onClick={handleGithubDisconnect}
                variant="outline"
                size="sm"
                className="btn-secondary"
              >
                Disconnect
              </Button>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-secondary/20 border border-border rounded-lg p-4">
          <h4 className="font-bold text-sm text-foreground mb-2">Verification Benefits</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Email verification: +5 points (auto-verified for MVP)</li>
            <li>• GitHub connection: +5 points + URL validation</li>
            <li>• 0xCert NFT: +10 points for all your projects</li>
            <li>• Total possible verification score: 20/20 points</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
