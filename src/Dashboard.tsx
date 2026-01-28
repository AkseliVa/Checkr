import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, query, where, addDoc, doc, deleteDoc, getDocs, orderBy } from 'firebase/firestore';
import { TaskList } from './TaskList';
import NewCustomerModal from './components/NewCustomerModal';
import NewTaskModal from './components/NewTaskModal';
import NewProjectModal from './components/NewProjectModal';
import { Trash2 } from 'lucide-react';

import { Task, Customer, Project } from './types';

export const Dashboard = ({ userRole }: { userRole: 'TeamLead' | 'Creator' }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const deleteCustomer = async (e: React.MouseEvent, id: string) => {
  e.stopPropagation(); 
  if (window.confirm("Poistetaanko asiakas? Tätä ei voi peruuttaa.")) {
    await deleteDoc(doc(db, "customers", id));
    if (selectedCustomer?.id === id) setSelectedCustomer(null);
  }
};

const deleteProject = async (projectId: string) => {
  if (window.confirm("Poistetaanko projekti ja kaikki sen tehtävät?")) {
    // 1. Delete the project itself
    await deleteDoc(doc(db, "projects", projectId));

    // 2. Fetch and delete all tasks associated with this project
    const taskQuery = query(collection(db, "tasks"), where("projectId", "==", projectId));
    const taskSnap = await getDocs(taskQuery); // Note: You'll need to import 'getDocs' from firestore
    
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
          // Convert Firestore timestamp back to JS Date for the UI if needed
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt 
        };
      }) as Project[];
  
  setProjects(projs);
}, (error) => {
  console.error("Sorting error:", error);
});

      return () => unsub();
    }, [selectedCustomer]);

  const handleAddTask = async (title: string) => {
    if (title.trim() && selectedCustomer && activeProjectId) {
      await addDoc(collection(db, "tasks"), {
        title,
        customerId: selectedCustomer.id,
        projectId: activeProjectId,
        isDone: false,
        createdAt: new Date(),
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
      <nav style={sidebarStyle}>
        {userRole === 'TeamLead' && (
          <button 
            onClick={() => setIsCustomerModalOpen(true)} 
            style={{ ...btnStyle, marginTop: '30px' }}
          >
            + Uusi asiakas
          </button>
        )}
        {customers.map(cust => (
          <div 
            key={cust.id}
            onClick={() => setSelectedCustomer(cust)}
            className="sidebar-item"
            style={customerItemStyle(selectedCustomer?.id === cust.id)}
          >
            <span>{cust.name}</span>
            
            {userRole === 'TeamLead' && (
              <Trash2 
                size={14} 
                onClick={(e) => deleteCustomer(e, cust.id)} 
                className="delete-hover"
              />
            )}
          </div>
        ))}
      </nav>

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

const sidebarStyle: React.CSSProperties = {
  width: '260px',
  minWidth: '260px', // Prevents it from shrinking
  backgroundColor: '#f5f5f7', 
  borderRight: '1px solid #d2d2d7',
  display: 'flex',
  flexDirection: 'column',
  padding: '20px 10px',
  height: '100vh', 
  position: 'sticky', 
  top: 0,
  left: 0,
  boxSizing: 'border-box'
};
const mainContentStyle: React.CSSProperties = {
  flex: 1, 
  height: '100vh',
  overflowY: 'auto',
  padding: '40px'
};

const customerItemStyle = (selected: boolean): React.CSSProperties => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: '6px',
  backgroundColor: selected ? '#e6f0ff' : 'transparent',
  cursor: 'pointer',
  marginBottom: '8px'
});

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