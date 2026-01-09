'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  addresses: string[];
  totalOrders: number;
}

interface CustomerAuthContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshCustomer: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('customer_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/auth/customer/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCustomer(data.customer);
      } else {
        localStorage.removeItem('customer_token');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('customer_token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, password: string) => {
    try {
      const response = await fetch('/api/auth/customer/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('customer_token', data.token);
        setCustomer(data.customer);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Đã xảy ra lỗi khi đăng nhập' };
    }
  };

  const register = async (name: string, phone: string, password: string) => {
    try {
      const response = await fetch('/api/auth/customer/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, phone, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('customer_token', data.token);
        setCustomer(data.customer);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Đã xảy ra lỗi khi đăng ký' };
    }
  };

  const logout = () => {
    localStorage.removeItem('customer_token');
    setCustomer(null);
  };

  const refreshCustomer = async () => {
    await checkAuth();
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoading,
        login,
        register,
        logout,
        refreshCustomer,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return context;
}
