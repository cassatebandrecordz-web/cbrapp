import React from 'react';
import { Redirect } from 'expo-router';

/**
 * The Services screen has been merged directly into the Home screen
 * as requested ("remove service page totally... same screen in home page").
 * Any direct navigation to /services redirects to the Home tab.
 */
export default function ServicesScreen() {
  return <Redirect href="/(tabs)" />;
}
