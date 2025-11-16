import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Folder, Plus, Settings as SettingsIcon, ExternalLink, Globe, Shield, Trash2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Settings = () => {
  const [newFolder, setNewFolder] = useState("");
  const [newDomain, setNewDomain] = useState("");

  const { data: folders, refetch } = useQuery({
    queryKey: ["config-folders"],
    queryFn: () => api.getConfigFolders(),
  });

  const { data: allowedDomains, refetch: refetchDomains } = useQuery({
    queryKey: ["allowed-embed-domains"],
    queryFn: () => api.getAllowedEmbedDomains(),
  });

  const { data: serverHealth } = useQuery({
    queryKey: ["server-health"],
    queryFn: () => api.healthCheck(),
  });

  const handleAddFolder = async () => {
    if (!newFolder.trim()) {
      toast.error("Please enter a folder path");
      return;
    }

    try {
      await api.addFolder(newFolder);
      toast.success("Folder added successfully!");
      setNewFolder("");
      refetch();
    } catch (error) {
      toast.error("Failed to add folder");
    }
  };

  const handleAddDomain = async () => {
    if (!newDomain.trim()) {
      toast.error("Please enter a domain");
      return;
    }

    if (!newDomain.startsWith('http://') && !newDomain.startsWith('https://')) {
      toast.error("Domain must start with http:// or https://");
      return;
    }

    try {
      await api.addAllowedEmbedDomain(newDomain);
      toast.success("Domain added successfully!");
      setNewDomain("");
      refetchDomains();
    } catch (error: any) {
      toast.error(error.message || "Failed to add domain");
    }
  };

  const handleRemoveDomain = async (domain: string) => {
    try {
      await api.removeAllowedEmbedDomain(domain);
      toast.success("Domain removed successfully!");
      refetchDomains();
    } catch (error) {
      toast.error("Failed to remove domain");
    }
  };

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <SettingsIcon className="w-8 h-8" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your local video server
          </p>
        </div>

        {/* Server Status */}
        <Card className="p-6 bg-gradient-card border-border/50 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Server Status
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <span className={`font-medium ${serverHealth ? 'text-green-500' : 'text-red-500'}`}>
                {serverHealth ? '● Online' : '● Offline'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">API Endpoint</span>
              <span className="font-medium font-mono text-sm">{baseUrl}</span>
            </div>
            {serverHealth && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Folders Configured</span>
                  <span className="font-medium">{serverHealth.folders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Last Check</span>
                  <span className="font-medium text-sm">
                    {new Date(serverHealth.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Embed Security */}
        <Card className="p-6 bg-gradient-card border-border/50 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Embed Security
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Control which websites can embed your videos. Only domains listed below will be allowed to show your video content in iframes.
          </p>
          
          <div className="space-y-4 mb-6">
            {allowedDomains && allowedDomains.length > 0 ? (
              allowedDomains.map((domain, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-secondary rounded-lg"
                >
                  <Shield className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="font-mono text-sm flex-1 truncate">{domain}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveDomain(domain)}
                    className="shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No allowed domains configured (embedding will be blocked)
              </p>
            )}
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <Label htmlFor="new-domain">Add Allowed Domain</Label>
            <div className="flex gap-2">
              <Input
                id="new-domain"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="e.g., https://lms.ntechnosolution.com"
                onKeyPress={(e) => e.key === 'Enter' && handleAddDomain()}
              />
              <Button onClick={handleAddDomain}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Important:</strong> Include the full URL with http:// or https://<br />
              Example: https://lms.ntechnosolution.com
            </p>
          </div>
        </Card>

        {/* Video Folders */}
        <Card className="p-6 bg-gradient-card border-border/50 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Folder className="w-5 h-5 text-primary" />
            Video Folders
          </h2>
          
          <div className="space-y-4 mb-6">
            {folders && folders.length > 0 ? (
              folders.map((folder, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 bg-secondary rounded-lg"
                >
                  <Folder className="w-5 h-5 text-primary shrink-0" />
                  <span className="font-mono text-sm flex-1 truncate">{folder}</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No folders configured yet
              </p>
            )}
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <Label htmlFor="new-folder">Add New Folder</Label>
            <div className="flex gap-2">
              <Input
                id="new-folder"
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                placeholder="e.g., /path/to/videos or C:\Users\Videos"
                onKeyPress={(e) => e.key === 'Enter' && handleAddFolder()}
              />
              <Button onClick={handleAddFolder}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              <strong>Windows:</strong> C:\Users\YourName\Videos<br />
              <strong>Mac/Linux:</strong> /Users/yourname/Videos
            </p>
          </div>
        </Card>

        {/* Expose to Internet */}
        <Card className="p-6 bg-gradient-card border-border/50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-primary" />
            Expose to Internet
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Option 1: ngrok (Easiest)</h3>
              <code className="block p-3 bg-secondary rounded font-mono text-xs">
                npx ngrok http 3001
              </code>
              <p className="text-muted-foreground mt-2">
                Creates instant public URL. Perfect for testing.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Option 2: Cloudflare Tunnel (Free)</h3>
              <code className="block p-3 bg-secondary rounded font-mono text-xs">
                cloudflared tunnel --url http://localhost:3001
              </code>
              <p className="text-muted-foreground mt-2">
                Free permanent tunnel with optional custom domain.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Option 3: Port Forwarding</h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                <li>Configure router: External port 80 → Your PC port 3001</li>
                <li>Find your public IP at whatismyip.com</li>
                <li>Optional: Setup Dynamic DNS (No-IP, DuckDNS)</li>
              </ol>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Option 4: Custom Domain</h3>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground ml-2">
                <li>Setup port forwarding (Option 3)</li>
                <li>Point domain's A record to your public IP</li>
                <li>Use Caddy/nginx for automatic HTTPS</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
