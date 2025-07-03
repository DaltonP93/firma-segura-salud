
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';

interface PersonalizationSettings {
  theme: 'light' | 'dark' | 'auto';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  compactMode: boolean;
  showWelcomeMessage: boolean;
  customWelcomeMessage?: string;
  dashboardLayout: 'grid' | 'list';
  notificationsEnabled: boolean;
}

interface AppCustomization {
  id: string;
  theme_name: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  app_title: string;
  app_subtitle: string;
  welcome_message: string | null;
  is_active: boolean;
}

interface PersonalizationContextType {
  settings: PersonalizationSettings;
  updateSettings: (newSettings: Partial<PersonalizationSettings>) => void;
  applyCustomization: (customization: AppCustomization) => void;
  resetToDefaults: () => void;
  loading: boolean;
}

const defaultSettings: PersonalizationSettings = {
  theme: 'light',
  primaryColor: '#3b82f6',
  secondaryColor: '#64748b',
  accentColor: '#10b981',
  fontFamily: 'Inter',
  compactMode: false,
  showWelcomeMessage: true,
  dashboardLayout: 'grid',
  notificationsEnabled: true,
};

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

export const usePersonalization = () => {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
};

interface PersonalizationProviderProps {
  children: React.ReactNode;
}

export const PersonalizationProvider = ({ children }: PersonalizationProviderProps) => {
  const [settings, setSettings] = useState<PersonalizationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { profile } = useUserRole();

  useEffect(() => {
    loadPersonalizationSettings();
  }, [profile]);

  useEffect(() => {
    applyThemeToDOM();
  }, [settings]);

  const loadPersonalizationSettings = async () => {
    try {
      // Load user preferences from localStorage first
      const savedSettings = localStorage.getItem('personalization-settings');
      if (savedSettings) {
        setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
      }

      // Load active app customization from database
      const { data: customization } = await supabase
        .from('app_customization')
        .select('*')
        .eq('is_active', true)
        .single();

      if (customization) {
        applyCustomization(customization);
      }
    } catch (error) {
      console.error('Error loading personalization settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = (newSettings: Partial<PersonalizationSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    // Save to localStorage
    localStorage.setItem('personalization-settings', JSON.stringify(updatedSettings));
  };

  const applyCustomization = (customization: AppCustomization) => {
    const newSettings: Partial<PersonalizationSettings> = {
      primaryColor: customization.primary_color,
      secondaryColor: customization.secondary_color,
      accentColor: customization.accent_color,
      fontFamily: customization.font_family,
      customWelcomeMessage: customization.welcome_message || undefined,
    };
    
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const applyThemeToDOM = () => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    root.style.setProperty('--primary-color', settings.primaryColor);
    root.style.setProperty('--secondary-color', settings.secondaryColor);
    root.style.setProperty('--accent-color', settings.accentColor);
    root.style.setProperty('--font-family', settings.fontFamily);
    
    // Apply theme class
    root.classList.remove('light', 'dark');
    if (settings.theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(settings.theme);
    }
    
    // Apply compact mode
    if (settings.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('personalization-settings');
  };

  return (
    <PersonalizationContext.Provider
      value={{
        settings,
        updateSettings,
        applyCustomization,
        resetToDefaults,
        loading,
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  );
};
