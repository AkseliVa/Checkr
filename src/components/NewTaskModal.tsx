import React from "react";
import { Task } from "src/types";

const NewTaskModal = ({ isOpen, onClose, onSubmit, title }: any) => {
  const [newTask, setNewTask] = React.useState<Task>({title: '', deadline: undefined, description: ''} as Task)

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(newTask);
    setNewTask({ title: '', deadline: undefined, description: '' } as Task);
  };

  const handleCancel = () => {
    onClose();
    setNewTask({ title: '', deadline: undefined, description: '' } as Task);
  }

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle} className="modal-content">
        <h3>{title}</h3>
        <input
          autoFocus
          style={inputStyle}
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value } )}
          placeholder="Tehtävän nimi"
        />
        <textarea
          style={inputStyle}
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value } )}
          placeholder="Tehtävän kuvaus"
        />
        <input 
          style={inputStyle}
          value={newTask.deadline ? newTask.deadline.toISOString().slice(0, 10) : ''}
          onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value ? new Date(e.target.value) : undefined })}
          type="date"
          placeholder="Määräaika"
        />
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <button onClick={handleSubmit} style={confirmBtn}>Lisää</button>
          <button onClick={handleCancel} style={cancelBtn}>Peruuta</button>
        </div>
      </div>
    </div>
  );
};

export default NewTaskModal;

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 1000
};

const modalContentStyle: React.CSSProperties = {
  background: 'white', padding: '20px', borderRadius: '12px', width: '300px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
};

const inputStyle = { width: '90%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' };
const confirmBtn = { padding: '8px 16px', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '6px' };
const cancelBtn = { padding: '8px 16px', backgroundColor: '#eee', border: 'none', borderRadius: '6px' };