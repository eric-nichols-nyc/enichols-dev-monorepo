"use client";

import { createContext, useContext, type ReactNode } from "react";

type PageContextType = {
  context?: string;
};

const PageContext = createContext<PageContextType>({});

type PageContextProviderProps = {
  children: ReactNode;
  context?: string;
};

export function PageContextProvider({
  children,
  context,
}: PageContextProviderProps) {
  return (
    <PageContext.Provider value={{ context }}>
      {children}
    </PageContext.Provider>
  );
}

export function usePageContext() {
  return useContext(PageContext);
}

