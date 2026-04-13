'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface SidebarContextType {
  collapsed: boolean;
  toggleSidebar: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  toggleSidebar: () => {},
  mobileOpen: false,
  setMobileOpen: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  return (
    <SidebarContext.Provider value={{ collapsed, toggleSidebar, mobileOpen, setMobileOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}
