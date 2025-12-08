import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PlanType, FeatureKey, PLAN_FEATURES } from '../config/permissions';

interface LicenseContextType {
  currentPlan: PlanType;
  canAccess: (feature: FeatureKey) => boolean;
  planName: string;
}

const LicenseContext = createContext<LicenseContextType | undefined>(undefined);

export const LicenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState<PlanType>('ESSENTIAL');

  useEffect(() => {
    // Leemos el plan guardado al iniciar (que guardamos en la pantalla de Activación)
    const savedPlan = localStorage.getItem('nexpos_plan') as PlanType;
    if (savedPlan) {
      setCurrentPlan(savedPlan);
    }
  }, []);

  // La función mágica: Verifica si el plan actual tiene la característica
  const canAccess = (feature: FeatureKey): boolean => {
    const features = PLAN_FEATURES[currentPlan] || [];
    return features.includes(feature);
  };

  return (
    <LicenseContext.Provider value={{ 
      currentPlan, 
      canAccess,
      planName: currentPlan // O mapear a nombre bonito
    }}>
      {children}
    </LicenseContext.Provider>
  );
};

export const useLicense = () => {
  const context = useContext(LicenseContext);
  if (!context) throw new Error("useLicense must be used within LicenseProvider");
  return context;
};