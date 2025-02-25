interface Coach {
  id: string;
  email: string;
  subdomain: string;
  displayName: string;
  clients: string[]; // Array of client UIDs
  // ... other coach fields
}

interface Client {
  id: string;
  email: string;
  coachId: string; // Reference to coach
  registeredViaSubdomain: string;
  // ... other client fields
} 