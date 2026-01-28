export interface Task {
  id: string;
  title: string;
  isDone: boolean;
  clientName: string;
  project: string;
  createdAt: Date;
  customerId: string;
  projectId: string;
};

export interface Project {
    id: string
    clientName: string;
    createdAt: Date;
    customerId: string;
    name: string;
};

export interface Customer {
    id: string;
    name: string;
}