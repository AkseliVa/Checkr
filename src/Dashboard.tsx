import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, query, where, addDoc, doc, deleteDoc, getDocs, orderBy } from 'firebase/firestore';
import { TaskList } from './TaskList';
import NewCustomerModal from './components/NewCustomerModal';
import NewTaskModal from './components/NewTaskModal';
import NewProjectModal from './components/NewProjectModal';
import { Trash2 } from 'lucide-react';

import { Task, Customer, Project } from './types';
import { SideNav } from './components/SideNav';

export const Dashboard = ({ userRole }: { userRole: 'TeamLead' | 'Creator' }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const deleteProject = async (projectId: string) => {
    if (window.confirm("Poistetaanko projekti ja kaikki sen tehtävät?")) {
      await deleteDoc(doc(db, "projects", projectId));

      const taskQuery = query(collection(db, "tasks"), where("projectId", "==", projectId));
      const taskSnap = await getDocs(taskQuery);
      
      const deletePromises = taskSnap.docs.map(taskDoc => deleteDoc(taskDoc.ref));
      await Promise.all(deletePromises);

      if (activeProjectId === projectId) setActiveProjectId(null);
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "customers"), (snap) => {
      const custs = snap.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setCustomers(custs);
      if (!selectedCustomer && custs.length > 0) setSelectedCustomer(custs[0]);
    });
    return () => unsub();
  }, []);

  const handleAddCustomer = async (name: string) => {
    if (name.trim()) {
      await addDoc(collection(db, "customers"), { name });
      setIsCustomerModalOpen(false);
    }
  };

  useEffect(() => {
    if (!selectedCustomer) {
      setProjects([]);
      return;
    }

    const q = query(
      collection(db, "projects"), 
      where("customerId", "==", selectedCustomer.id),
      orderBy("createdAt", "desc") 
    );

    const unsub = onSnapshot(q, (snap) => {
      const projs = snap.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt 
        };
      }) as Project[];
  
  setProjects(projs);
}, (error) => {
  console.error("Sorting error:", error);
});

      return () => unsub();
    }, [selectedCustomer]);

  const handleAddTask = async (task: Task) => {
    if (task.title.trim() && selectedCustomer && activeProjectId) {
      await addDoc(collection(db, "tasks"), {
        title: task.title,
        customerId: selectedCustomer.id,
        projectId: activeProjectId,
        isDone: false,
        createdAt: new Date(),
        deadline: task.deadline,
        clientName: selectedCustomer.name,
        project: projects.find(p => p.id === activeProjectId)?.name || ''
      });
      setIsTaskModalOpen(false);
    }
  };

  const handleAddProject = async (name: string) => {
    if (name.trim() && selectedCustomer) {
      await addDoc(collection(db, "projects"), {
        name,
        customerId: selectedCustomer.id,
        clientName: selectedCustomer.name,
        createdAt: new Date()
      });
      setIsProjectModalOpen(false);
    }
  }

  return (
    <div style={dashboardContainerStyle}>
      {/* Sidenav */}
      <SideNav 
        userRole={userRole}
        customers={customers}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        openCustomerModal={() => setIsCustomerModalOpen(true)}
      />

      {/* Main Window */}
      <main style={mainContentStyle}>
        {selectedCustomer && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
              <h1 style={{ margin: 0 }}>{selectedCustomer.name}</h1>
              <button onClick={() => setIsProjectModalOpen(true)} style={btnStyle}>
                + Lisää projekti
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {projects.map((project) => (
                <div key={project.id} style={projectContainerStyle}>
                  <div style={projectHeaderStyle}>
                    <h3 
                      style={{ margin: 0, cursor: 'pointer', flex: 1 }} 
                      onClick={() => setActiveProjectId(activeProjectId === project.id ? null : project.id)}
                    >
                      {activeProjectId === project.id ? '▼ ' : '▶ '} {project.name}
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <button 
                        onClick={() => { setActiveProjectId(project.id); setIsTaskModalOpen(true); }}
                        style={smallBtnStyle}
                      >
                        + Lisää tehtävä
                      </button>
                      
                      {userRole === 'TeamLead' && (
                        <Trash2 
                          size={16} 
                          color="#ff3b30" 
                          style={{ cursor: 'pointer', opacity: 0.6 }}
                          onClick={() => deleteProject(project.id)}
                        />
                      )}
                    </div>
                  </div>

                  {activeProjectId === project.id && (
                    <div style={{ padding: '10px 20px', borderTop: '1px solid #e5e5e7' }}>
                      <TaskList userRole={userRole} projectId={project.id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* THE MODALS */}
      <NewCustomerModal 
        isOpen={isCustomerModalOpen} 
        onClose={() => setIsCustomerModalOpen(false)} 
        onSubmit={handleAddCustomer}
        title="Lisää uusi asiakas"
        label="Asiakkaan nimi"
      />
      <NewTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
        onSubmit={handleAddTask}
        title="Lisää uusi tehtävä"
      />
      <NewProjectModal 
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleAddProject}
        title="Lisää uusi projekti"
      />
    </div>
  );
};

const btnStyle = { padding: '8px 16px', cursor: 'pointer', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '5px' };

const dashboardContainerStyle: React.CSSProperties = {
  display: 'flex',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden'
};

const mainContentStyle: React.CSSProperties = {
  flex: 1, 
  height: '100vh',
  overflowY: 'auto',
  padding: '40px'
};

const projectContainerStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '10px',
  border: '1px solid #e5e5e7',
  overflow: 'hidden'
};

const projectHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px 20px',
  backgroundColor: '#fafafa'
};

const smallBtnStyle = { 
  padding: '4px 10px', 
  fontSize: '12px', 
  cursor: 'pointer', 
  backgroundColor: 'transparent', 
  color: '#007AFF', 
  border: '1px solid #007AFF', 
  borderRadius: '4px' 
};