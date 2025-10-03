import React, { createContext, useContext, useState, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';

const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
    }
  }
`;

interface AuthContextType {
  user: any;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data, loading, error } = useQuery(ME_QUERY, {
    skip: !isClient || !localStorage.getItem('token'),
    onCompleted: (data) => {
      setUser(data.me);
    },
    onError: () => {
      localStorage.removeItem('token');
      setUser(null);
    },
  });

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // A simple way is to force a reload to clear all state and re-run queries.
    window.location.reload();
  };

  // The context is loading if the query is loading OR if we are on the server.
  const authLoading = loading || !isClient;

  return (
    <AuthContext.Provider value={{ user, loading: authLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);