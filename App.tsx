import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DbProvider } from "./src/db/dbProvider";
import { CategoryProvider } from "./src/features/categories/CategoryProvider";
import BottomTabs from "./src/navigation/BottomTabs";
import { useTheme } from "./src/theme/useTheme";

export default function App() {
  const theme = useTheme();
  const colorScheme = useColorScheme();

  return (
    <>
      <DbProvider>
        <CategoryProvider>
          <StatusBar
            style={colorScheme === "dark" ? "light" : "dark"}
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
        </CategoryProvider>
      </DbProvider>
    </>
  );
}
