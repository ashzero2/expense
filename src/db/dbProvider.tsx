import { createContext, useContext, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { initDb } from "./init";

const DbContext = createContext(false);

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await initDb();
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <DbContext.Provider value={true}>
      {children}
    </DbContext.Provider>
  );
}

export function useDbReady() {
  return useContext(DbContext);
}
