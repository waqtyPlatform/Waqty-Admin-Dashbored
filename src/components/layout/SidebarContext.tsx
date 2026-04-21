'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface SidebarContextType {
  collapsed: boolean;
  toggleSidebar: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const DEFAULT_SIDEBAR_CONTEXT: SidebarContextType = {
  collapsed: false,
  toggleSidebar: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
};

const SidebarContext = createContext<SidebarContextType>(DEFAULT_SIDEBAR_CONTEXT);

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  const value = useMemo(
    () => ({ collapsed, toggleSidebar, mobileOpen, setMobileOpen }),
    [collapsed, toggleSidebar, mobileOpen]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
