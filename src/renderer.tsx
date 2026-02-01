import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Dashboard } from './Dashboard';
import './index.css';
import SignInPage from './SignInPage';
import { auth, db } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const RootApp: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<'TeamLead' | 'Creator'>('Creator');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const roleDoc = await getDoc(doc(db, 'allowedUsers', u.uid));
          const data = roleDoc.data();
          if (data && data.role === 'TeamLead') setRole('TeamLead');
          else setRole('Creator');
        } catch (err) {
          setRole('Creator');
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Ladataan…</div>;

  if (!user) return <SignInPage />;

  return <Dashboard userRole={role} />;
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);