import React from "react";

const NewCustomerModal = ({ isOpen, onClose, onSubmit, title, label }: any) => {
  const [value, setValue] = React.useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(value);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleSubmit();
    }
  }

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle} className="modal-content">
        <h3>{title}</h3>
        <input
          autoFocus
          onKeyDown={handleKeyDown}
          style={inputStyle}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={label}
        />
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <button onClick={handleSubmit} style={confirmBtn}>Lisää</button>
          <button onClick={onClose} style={cancelBtn}>Peruuta</button>
        </div>
      </div>
    </div>
  );
};

export default NewCustomerModal;

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
  zIndex: 1000
};

const modalContentStyle: React.CSSProperties = {
  background: 'white', padding: '20px', borderRadius: '12px', width: '300px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
};

const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' };
const confirmBtn = { padding: '8px 16px', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '6px' };
const cancelBtn = { padding: '8px 16px', backgroundColor: '#eee', border: 'none', borderRadius: '6px' };