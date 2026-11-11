import { Drama, Feather, Music, Palette } from 'lucide-react';

/** Art forms listed in the footer. Text lives under `discipline.<key>.*`. */
export const disciplines = [
  { key: 'music', icon: Music },
  { key: 'poetry', icon: Feather },
  { key: 'dance', icon: Drama },
  { key: 'art', icon: Palette },
] as const;
