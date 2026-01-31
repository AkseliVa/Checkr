import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, updateDoc, doc, deleteDoc, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Trash2 } from 'lucide-react';
import { Task } from './types';

import { deleteTask } from './api';

export const TaskList = ({ userRole, projectId }: { userRole: 'TeamLead' | 'Creator', projectId: string }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "tasks"),
      where("projectId", "==", projectId),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          deadline: data.deadline?.toDate ? data.deadline.toDate() : data.deadline 
        };
      }) as Task[];
  
      setTasks(fetchedTasks);

      snapshot.docChanges().forEach((change) => {
      if (change.type === "modified") {
        const taskData = change.doc.data() as Task;
        if (taskData.isDone && userRole === 'TeamLead') {
          new window.Notification(`${taskData.clientName}`, {
            body: `${taskData.title} ${taskData.project} merkattu valmiiksi!`
          });
        }
      }
    });
  }, (error) => {
    console.error("Firestore error:", error);
  });
    
    return () => unsubscribe();
  }, [projectId]);

  const toggleTask = async (id: string, currentStatus: boolean) => {
    const taskRef = doc(db, "tasks", id);
    await updateDoc(taskRef, { isDone: !currentStatus });
  };

  const isOverdue = (deadline: any, isDone: boolean) => {
    if (!deadline || isDone) return false;
    const now = new Date();
    const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline);

    return deadlineDate < now;
  };

  const getTaskStyle = (deadline: any, isDone: boolean): React.CSSProperties => {
    const overdue = isOverdue(deadline, isDone);
    
    let bgColor = 'transparent';
    let borderColor = 'transparent';

    if (overdue) {
      bgColor = '#ffe5e5';
      borderColor = '#ffb2b2';
    } else if (isDone) {
      bgColor = '#8aec92';
      borderColor = '#b0c4b2';
    }

    return {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      marginBottom: '8px',
      transition: 'all 0.2s ease',
      backgroundColor: bgColor,
      border: `1px solid ${borderColor}`
    };
  };

  return (
    <div className="task-container">
      {!tasks.length && <p style={{ color: '#8e8e93' }}>Ei tehtäviä tässä projektissa.</p>}

      {tasks.map(task => {
        const overdue = isOverdue(task.deadline, task.isDone);
        const isActive = activeTaskId === task.id;
        
        return (
          <div key={task.id} className="task-item" style={{...getTaskStyle(task.deadline, task.isDone), flexDirection: 'column', alignItems: 'stretch'}}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                checked={task.isDone} 
                onChange={() => toggleTask(task.id, task.isDone)}
              />
              <h4 
                style={{ margin: 0, cursor: 'pointer', flex: 1 }} 
                onClick={() => setActiveTaskId(activeTaskId === task.id ? null : task.id)}
              >
                {task.title}
              </h4>
              {task.deadline && (
                <span style={{ 
                  fontSize: '13px', 
                  color: overdue ? '#d32f2f' : '#8e8e93', 
                  fontWeight: overdue ? 'bold' : 'normal',
                  marginLeft: '10px' 
                }}>
                  {overdue ? '⚠️ ' : '🕒 '} 
                  {new Date(task.deadline).toLocaleDateString('fi-FI')}
                </span>
              )}
            </div>
            <div>
            {activeTaskId === task.id && (
              <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '6px' }}>
                <strong>Kuvaus:</strong>
                <p style={{ margin: '5px 0 0 0' }}>{task.description || 'Ei kuvausta.'}</p>
              </div>
            )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', paddingTop: '10px' }}>
                <button 
                  onClick={() => { setActiveTaskId(task.id) }}
                  style={smallBtnStyle}
                >
                  + Lisää kommentti
                </button>
                
                {userRole === 'TeamLead' && (
                  <Trash2 
                    size={16} 
                    color="#ff3b30" 
                    style={{ cursor: 'pointer', opacity: 0.6 }}
                    onClick={() => deleteTask(task.id)}
                  />
                )}
              </div>
          </div>
        );
      })}
    </div>
  );
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