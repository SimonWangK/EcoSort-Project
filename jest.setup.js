
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
const React = require('react');
const { Text } = require('react-native');

function MockIcon(props) {
  return React.createElement(Text, {
    accessibilityElementsHidden: true,
    importantForAccessibility: 'no-hide-descendants',
  }, props?.name || 'icon');
}

jest.mock('@expo/vector-icons', () => ({
  Ionicons: MockIcon,
  Feather: MockIcon,
  MaterialCommunityIcons: MockIcon,
}));

jest.mock('lucide-react-native', () => ({
  Home: MockIcon,
  Search: MockIcon,
  Scan: MockIcon,
  Clock: MockIcon,
  Settings: MockIcon,
}));
