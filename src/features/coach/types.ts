export interface Client {
  id: string;
  name: string;
  email: string;
  photo: string;
  status: 'active' | 'inactive' | 'pending';
  goal: string;
  joinDate: Date;
  lastCheckIn: Date;
  nextSession?: Date;
  progress: {
    completed: number;
    total: number;
  };
}

export interface ClientFilters {
  status: string;
  search: string;
} 