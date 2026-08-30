export interface User {
  email: string;
  token: string;
  username: string;
  bio: string | null;
  image: string | null;
  twitterUrl?: string; // Nueva propiedad opcional
  linkedinUrl?: string; // Nueva propiedad opcional
}
