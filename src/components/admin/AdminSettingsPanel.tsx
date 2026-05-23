import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { usePlatformSettings } from '@/hooks/usePlatformSettings';

export function AdminSettingsPanel() {
  const { settingsMap, loading, updateSetting } = usePlatformSettings();
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  useEffect(() => {
    setMaintenanceMessage(settingsMap.maintenance_mode.message);
  }, [settingsMap]);

  const handleMaintenanceToggle = async (enabled: boolean) => {
    await updateSetting('maintenance_mode', { enabled, message: maintenanceMessage });
  };

  const handleMaintenanceMessageSave = async () => {
    await updateSetting('maintenance_mode', { 
      enabled: settingsMap.maintenance_mode.enabled, 
      message: maintenanceMessage 
    });
  };

  if (loading) {
    return (
      <Card className="border-gray-800 bg-[#111]">
        <CardContent className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Maintenance Mode */}
      <Card className={settingsMap.maintenance_mode.enabled ? 'border-destructive' : ''}>
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${settingsMap.maintenance_mode.enabled ? 'text-destructive' : 'text-primary'}`} />
            MAINTENANCE MODE
          </CardTitle>
          <CardDescription>
            When enabled, users will see a maintenance message instead of the app
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-medium">Enable Maintenance Mode</Label>
            <Switch
              checked={settingsMap.maintenance_mode.enabled}
              onCheckedChange={handleMaintenanceToggle}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Maintenance Message</Label>
            <Textarea
              placeholder="We're currently performing maintenance. Please check back soon!"
              value={maintenanceMessage}
              onChange={(e) => setMaintenanceMessage(e.target.value)}
            />
            <Button onClick={handleMaintenanceMessageSave} variant="outline" size="sm">
              Save Message
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
