import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import { DbProvider } from "./src/db/dbProvider";
import BottomTabs from "./src/navigation/BottomTabs";
import { useTheme } from "./src/theme/useTheme";

export default function App() {
  const theme = useTheme();

  return (
    <>
      <DbProvider>
        <StatusBar
          style={theme === undefined ? "dark" : "light"}
          translucent={false}
        />
        <SafeAreaView
          style={{ flex: 1, backgroundColor: theme.background }}
        >
          <NavigationContainer
            theme={{
              ...DefaultTheme,
              colors: {
                ...DefaultTheme.colors,
                background: theme.background,
                text: theme.text,
                border: theme.border,
              },
            }}
          >
            <BottomTabs />
          </NavigationContainer>
        </SafeAreaView>
      </DbProvider>
    </>
  );
}
