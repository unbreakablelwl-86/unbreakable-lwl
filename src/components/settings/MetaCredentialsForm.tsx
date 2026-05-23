import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useMetaCredentials } from '@/hooks/useMetaCredentials';
import { toast } from 'sonner';
import { Loader2, Check, Trash2, Facebook, Instagram, Key, AlertTriangle } from 'lucide-react';

export function MetaCredentialsForm() {
  const { credentials, loading, hasCredentials, saveCredentials, deleteCredentials } = useMetaCredentials();
  const [saving, setSaving] = useState(false);
  const [pageToken, setPageToken] = useState('');
  const [pageId, setPageId] = useState('');
  const [igId, setIgId] = useState('');
  const [pageName, setPageName] = useState('');

  useEffect(() => {
    if (credentials) {
      setPageToken(credentials.page_access_token || '');
      setPageId(credentials.facebook_page_id || '');
      setIgId(credentials.instagram_account_id || '');
      setPageName(credentials.page_name || '');
    }
  }, [credentials]);

  const handleSave = async () => {
    if (!pageToken || !pageId) {
      toast.error('Page Access Token and Page ID are required');
      return;
    }
    setSaving(true);
    const { error } = await saveCredentials({
      page_access_token: pageToken,
      facebook_page_id: pageId,
      instagram_account_id: igId || undefined,
      page_name: pageName || undefined,
    });
    setSaving(false);
    if (error) {
      toast.error('Failed to save credentials');
    } else {
      toast.success('Meta credentials saved');
    }
  };

  const handleDelete = async () => {
    await deleteCredentials();
    setPageToken('');
    setPageId('');
    setIgId('');
    setPageName('');
    toast.success('Meta credentials removed');
  };

  if (loading) {
    return (
      <Card className=" border-gray-800 bg-[#111]">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className=" border-gray-800 bg-[#111]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-sm tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            META API CREDENTIALS
          </CardTitle>
          {hasCredentials && (
            <Badge className="bg-green-500/20 text-green-400 text-[9px] font-display">
              <Check className="w-3 h-3 mr-1" /> CONNECTED
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Connect your Meta Business account to post directly to Facebook & Instagram.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div className="text-[10px] text-muted-foreground space-y-1">
              <p className="font-display tracking-wider text-primary">HOW TO GET YOUR CREDENTIALS</p>
              <p>1. Go to <strong>developers.facebook.com</strong> → Your App → Graph API Explorer</p>
              <p>2. Select your Page & grant <strong>pages_manage_posts</strong> + <strong>instagram_content_publish</strong></p>
              <p>3. Generate a long-lived <strong>Page Access Token</strong></p>
              <p>4. Your <strong>Page ID</strong> is in your FB Page's About section</p>
              <p>5. Get your <strong>IG Business ID</strong> via: /{'{page-id}'}?fields=instagram_business_account</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-display tracking-wider text-muted-foreground">PAGE NAME (OPTIONAL)</Label>
            <Input
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              placeholder="e.g. Unbreakable LWL"
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-display tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Facebook className="w-3 h-3 text-blue-500" /> PAGE ACCESS TOKEN *
            </Label>
            <Input
              type="password"
              value={pageToken}
              onChange={(e) => setPageToken(e.target.value)}
              placeholder="EAAxxxxxxxxx..."
              className="text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-display tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Facebook className="w-3 h-3 text-blue-500" /> FACEBOOK PAGE ID *
            </Label>
            <Input
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              placeholder="e.g. 123456789012345"
              className="text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-display tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Instagram className="w-3 h-3 text-pink-500" /> INSTAGRAM BUSINESS ACCOUNT ID
            </Label>
            <Input
              value={igId}
              onChange={(e) => setIgId(e.target.value)}
              placeholder="e.g. 17841400000000000"
              className="text-sm font-mono"
            />
            <p className="text-[9px] text-muted-foreground">Required for Instagram posting. Leave blank for Facebook only.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={saving || !pageToken || !pageId}
            className="flex-1 font-display tracking-wider text-xs"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
            {hasCredentials ? 'UPDATE' : 'SAVE'} CREDENTIALS
          </Button>
          {hasCredentials && (
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-destructive border-destructive/30 hover:bg-destructive/10 font-display tracking-wider text-xs"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
