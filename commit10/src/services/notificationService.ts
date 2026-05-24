import * as Notifications from 'expo-notifications';
import { permissionErrorMessage } from '../utils/errorMessages';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function scheduleRecyclingReminder(): Promise<string> {
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) throw new Error(permissionErrorMessage('notification'));

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'EcoSort reminder',
      body: 'Take a moment to record one recycling action today.',
    },
    trigger: { seconds: 5 },
  });

  return new Date().toISOString();
}
