import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { Customer, Project, Task } from "./types";

export const deleteProject = async (projectId: string, activeProjectId: string | null, setActiveProjectId: (id: string | null) => void) => {
    if (window.confirm("Poistetaanko projekti ja kaikki sen tehtävät?")) {
      await deleteDoc(doc(db, "projects", projectId));

      const taskQuery = query(collection(db, "tasks"), where("projectId", "==", projectId));
      const taskSnap = await getDocs(taskQuery);
      
      const deletePromises = taskSnap.docs.map(taskDoc => deleteDoc(taskDoc.ref));
      await Promise.all(deletePromises);

      if (activeProjectId === projectId) setActiveProjectId(null);
    }
};

export const handleAddCustomer = async (name: string, setIsCustomerModalOpen: (open: boolean) => void) => {
    if (name.trim()) {
      await addDoc(collection(db, "customers"), { name });
      setIsCustomerModalOpen(false);
    }
};

export const handleAddTask = async (task: Task, selectedCustomer: Customer, activeProjectId: string, setIsTaskModalOpen: (open: boolean) => void, projects: Project[]) => {
    if (task.title.trim() && selectedCustomer && activeProjectId) {
      await addDoc(collection(db, "tasks"), {
        title: task.title,
        customerId: selectedCustomer.id,
        projectId: activeProjectId,
        isDone: false,
        createdAt: new Date(),
        deadline: task.deadline,
        clientName: selectedCustomer.name,
        description: task.description,
        project: projects.find(p => p.id === activeProjectId)?.name || ''
      });
      setIsTaskModalOpen(false);
    }
};

export const handleAddProject = async (name: string, selectedCustomer: Customer, setIsProjectModalOpen: (open: boolean) => void) => {
    if (name.trim() && selectedCustomer) {
      await addDoc(collection(db, "projects"), {
        name,
        customerId: selectedCustomer.id,
        clientName: selectedCustomer.name,
        createdAt: new Date()
      });
      setIsProjectModalOpen(false);
    }
};

export const deleteTask = async (taskId: string) => {
    if (window.confirm("Poistetaanko tehtävä?")) {
      await deleteDoc(doc(db, "tasks", taskId));
    }
  };