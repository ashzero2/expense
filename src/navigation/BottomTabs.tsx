import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Analytics from "../screens/Analytics";
import Dashboard from "../screens/Dashboard";
import History from "../screens/History";
import Settings from "../screens/Settings";
import { useTheme } from "../theme/useTheme";

export type BottomTabParamList = {
  Dashboard: undefined;
  History: undefined;
  Analytics: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

function getIcon(
  routeName: keyof BottomTabParamList,
  focused: boolean
) {
  switch (routeName) {
    case "Dashboard":
      return focused ? "home" : "home-outline";
    case "History":
      return focused ? "list" : "list-outline";
    case "Analytics":
      return focused ? "stats-chart" : "stats-chart-outline";
    case "Settings":
      return focused ? "settings" : "settings-outline";
    default:
      return "ellipse";
  }
}

export default function BottomTabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={getIcon(route.name, focused)}
            size={size}
            color={color}
          />
        ),

        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.subtext,

        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
          borderTopWidth: 0.5,
        },

        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="History" component={History} />
      <Tab.Screen name="Analytics" component={Analytics} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
}
