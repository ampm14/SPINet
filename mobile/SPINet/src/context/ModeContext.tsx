import React, { createContext, useContext, useState, ReactNode } from "react";

export type Mode = "light" | "dark";

type ModeContextType = {
  mode: Mode;
  setMode: (m: Mode) => void;
  toggleMode: () => void;
};

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export const ModeProvider = ({ children }: { children?: ReactNode }) => {
  const [mode, setModeState] = useState<Mode>("light");

  const setMode = (m: Mode) => setModeState(m);
  const toggleMode = () => setModeState((prev) => (prev === "light" ? "dark" : "light"));

  return <ModeContext.Provider value={{ mode, setMode, toggleMode }}>{children}</ModeContext.Provider>;
};

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) throw new Error("useMode must be used inside a ModeProvider");
  return ctx;
}

export default ModeProvider;
