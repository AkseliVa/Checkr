import React, { useState } from 'react';
import SignIn from './components/SignIn';

const SignInPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);

  return (
    <div style={{ padding: 24 }}>
      {!user ? (
        <SignIn onSuccess={setUser} />
      ) : (
        <div style={{ maxWidth: 540, margin: '40px auto' }}>
          <h2>Tervetuloa, {user.email}</h2>
          <p>Olet kirjautunut sisään onnistuneesti.</p>
        </div>
      )}
    </div>
  );
};

export default SignInPage;
