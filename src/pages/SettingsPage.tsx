import React, { useState } from 'react';
import {
  SettingsLayout,
  BillingSettings,
  ApiKeysSettings,
  TeamSettings,
  NotificationSettings,
} from '../components/settings';

type SettingsTab = 'billing' | 'api-keys' | 'team' | 'notifications';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('billing');

  const renderContent = () => {
    switch (activeTab) {
      case 'billing':
        return <BillingSettings />;
      case 'api-keys':
        return <ApiKeysSettings />;
      case 'team':
        return <TeamSettings />;
      case 'notifications':
        return <NotificationSettings />;
      default:
        return <BillingSettings />;
    }
  };

  return (
    <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </SettingsLayout>
  );
}

export default SettingsPage;
