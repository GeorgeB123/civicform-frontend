"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import FormStore from './FormStore';

const StoreContext = createContext<FormStore | null>(null);

let formStore: FormStore;

function getFormStore() {
  if (!formStore) {
    formStore = new FormStore();
  }
  return formStore;
}

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const store = getFormStore();

  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
}

export function useFormStore(): FormStore {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error('useFormStore must be used within a StoreProvider');
  }
  return store;
}