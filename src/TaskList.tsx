import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, updateDoc, doc, deleteDoc, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Trash2 } from 'lucide-react';
import { Task } from './types';

export const TaskList = ({ userRole, projectId }: { userRole: 'TeamLead' | 'Creator', projectId: string }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

    const deleteTask = async (taskId: string) => {
    if (window.confirm("Delete this task?")) {
      await deleteDoc(doc(db, "tasks", taskId));
    }
  };

  useEffect(() => {
    const q = query(
      collection(db, "tasks"),
      where("projectId", "==", projectId),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Task[];
  
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

  return (
    <div className="task-container">
      {tasks.map(task => (
        <div key={task.id} className="task-item" style={TaskItemStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input 
              type="checkbox" 
              checked={task.isDone} 
              onChange={() => toggleTask(task.id, task.isDone)}
            />
            <span>{task.title}</span>
          </div>
          
          <Trash2 
            size={16} 
            color="#ff3b30" // macOS Red
            style={{ cursor: 'pointer', opacity: 0.6 }} 
            onClick={() => deleteTask(task.id)}
            className="delete-icon"
          />
        </div>
      ))}
    </div>
  );
};

const TaskItemStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: '6px',
  cursor: 'pointer',
  marginBottom: '8px'
};