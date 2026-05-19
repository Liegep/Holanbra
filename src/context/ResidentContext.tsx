import React, { createContext, useContext, useState } from 'react';

const ResidentContext = createContext<any>(null);

export const ResidentProvider = ({ children }: { children: React.ReactNode }) => {
  const [residentProperty, setResidentProperty] = useState<any>(null);
  return (
    <ResidentContext.Provider value={{ residentProperty, setResidentProperty }}>
      {children}
    </ResidentContext.Provider>
  );
};

export const useResidentContext = () => useContext(ResidentContext);
