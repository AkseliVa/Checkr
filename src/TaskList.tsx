import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, updateDoc, doc, deleteDoc, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Trash2 } from 'lucide-react';
import { Task } from './types';

import { deleteTask } from './api';

export const TaskList = ({ userRole, projectId }: { userRole: 'TeamLead' | 'Creator', projectId: string }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

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
    
    return {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      marginBottom: '8px',
      transition: 'background-color 0.3s ease',
      backgroundColor: overdue ? '#ffe5e5' : 'transparent',
      border: overdue ? '1px solid #ffb2b2' : '1px solid transparent'
    };
  };

  return (
    <div className="task-container">
      {!tasks.length && <p style={{ color: '#8e8e93' }}>Ei tehtäviä tässä projektissa.</p>}
      
      {tasks.map(task => {
        const overdue = isOverdue(task.deadline, task.isDone);
        
        return (
          <div key={task.id} className="task-item" style={getTaskStyle(task.deadline, task.isDone)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="checkbox" 
                checked={task.isDone} 
                onChange={() => toggleTask(task.id, task.isDone)}
              />
              <span style={{ textDecoration: task.isDone ? 'line-through' : 'none' }}>
                {task.title}
              </span>
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
            
            <Trash2 
              size={16} 
              color="#ff3b30"
              style={{ cursor: 'pointer', opacity: 0.6 }} 
              onClick={() => deleteTask(task.id)}
              className="delete-icon"
            />
          </div>
        );
      })}
    </div>
  );
};