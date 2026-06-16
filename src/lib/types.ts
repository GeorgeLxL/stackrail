export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  sort_order: number;
  created_at: string;
};

export type ContactInfo = {
  email: string;
  telegram: string;
};
