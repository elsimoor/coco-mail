import React from 'react';
import { Layout } from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user, loading } = useAuth();

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-3xl font-bold">Welcome to Cocoinbox</h1>
        <p className="mt-4">
          Your all-in-one privacy-focused super-application.
        </p>
        {loading && <p className="mt-4">Loading user information...</p>}
        {user && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold">Hello, {user.name}!</h2>
            <p>You are logged in as {user.email}.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;