import { deleteDoc, doc } from "firebase/firestore";
import { Trash2 } from "lucide-react";
import { db } from "../firebase";
import { Customer } from "src/types";

interface SideNavProps {
    userRole: 'TeamLead' | 'Creator';
    customers: Customer[];
    selectedCustomer: Customer | null;
    setSelectedCustomer: (cust: Customer) => void;
    openCustomerModal: () => void;
}

export const SideNav = ({
    userRole,
    customers,
    selectedCustomer,
    setSelectedCustomer,
    openCustomerModal
}: SideNavProps) => {

      const deleteCustomer = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation(); 
        if (window.confirm("Poistetaanko asiakas? Tätä ei voi peruuttaa.")) {
          await deleteDoc(doc(db, "customers", id));
        }
    };
    
    return (
        <nav style={sidebarStyle}>
                {userRole === 'TeamLead' && (
                <button 
                    onClick={() => openCustomerModal()} 
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

            )
}

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

const btnStyle = { padding: '8px 16px', cursor: 'pointer', backgroundColor: '#007AFF', color: 'white', border: 'none', borderRadius: '5px' };