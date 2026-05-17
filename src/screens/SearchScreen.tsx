import React from 'react';
import { Text } from 'react-native';
import { Screen } from '../components/Screen';
import { Card } from '../components/Card';
import { AppButton } from '../components/AppButton';
import { AppScreen } from '../types';

export function SearchScreen({ navigate }: { navigate: (screen: AppScreen) => void }) {
  return (
    <Screen title="Search" subtitle="Manual item lookup will be built here next.">
      <Card>
        <Text>EcoSort will use this screen for quick item search and fallback guidance when camera scanning is unavailable.</Text>
        <AppButton title="Back home" onPress={() => navigate('home')} style={{ marginTop: 16 }} />
      </Card>
    </Screen>
  );
}
