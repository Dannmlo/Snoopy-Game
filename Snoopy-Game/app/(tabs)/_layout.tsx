// Em app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      // Esconde a barra de abas
      tabBar={() => null} 
      
      // Esconde o header (título)
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Vamos focar APENAS na tela 'index'.
        Removi a 'explore' para evitar confusão.
        Se você tiver um arquivo 'explore.tsx', pode até apagá-lo.
      */}
      <Tabs.Screen name="index" />

    </Tabs>
  );
}