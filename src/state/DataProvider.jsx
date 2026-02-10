import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { loadData, saveData } from '../utils/fileStorage';
import { DEFAULT_SETTINGS, allExamData, config } from '../config/appConfig';
import { dataReducer } from './dataReducer';

const DataContext = createContext(null);

const initialState = {
  examData: allExamData,
  settings: DEFAULT_SETTINGS,
  isLoaded: false
};

// --- Normalization Helpers (Moved from App.jsx) ---
const normalizeDomainItem = (d) => {
  if (typeof d === 'string') return { name: d, isDeleted: false };
  if (!d || typeof d !== 'object') return null;
  const name = d.name || d.domain || d.title || '';
  if (!name) return null;
  return { name, isDeleted: Boolean(d.isDeleted ?? d.deleted ?? false) };
};

const normalizeTestItem = (t) => {
  if (!t || typeof t !== 'object') return null;
  return { ...t, isDeleted: Boolean(t.isDeleted ?? t.deleted ?? false) };
};

const normalizeCert = (cert) => {
  if (!cert || typeof cert !== 'object') return cert;
  const next = { ...cert };

  next.tests = Array.isArray(next.tests) ? next.tests.map(normalizeTestItem).filter(Boolean) : [];
  next.domains = Array.isArray(next.domains) ? next.domains.map(normalizeDomainItem).filter(Boolean) : [];
  if (!Array.isArray(next.studySessions)) next.studySessions = [];
  if (!Array.isArray(next.journalEntries)) next.journalEntries = [];

  // Backfill domains logic
  const fromTests = new Set();
  next.tests.forEach((test) => {
    if (test?.isDeleted) return;
    const keys = Object.keys(test?.domains || {});
    keys.forEach((k) => {
      if (k === config.ALL_DOMAINS_KEY || k === config.UNCATEGORIZED_KEY) return;
      fromTests.add(k);
    });
  });

  const have = new Set(next.domains.map((d) => d.name).filter(Boolean));
  fromTests.forEach((name) => {
    if (!have.has(name)) next.domains.push({ name, isDeleted: false });
  });

  return next;
};

const normalizeExamData = (data) => {
  if (!data || typeof data !== 'object') return data;
  const next = structuredClone(data);
  Object.keys(next).forEach((certKey) => {
    next[certKey] = normalizeCert(next[certKey]);
  });
  return next;
};

// --- Provider ---

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const initialLoadRef = useRef(true);

  // 1. Initial Load & Normalization
  useEffect(() => {
    const init = async () => {
      const result = await loadData();
      
      // Normalize data immediately upon load
      const rawData = (result && result.data) || allExamData;
      const normalizedData = normalizeExamData(rawData);
      
      const loadedSettings = (result && result.settings) || DEFAULT_SETTINGS;

      dispatch({
        type: 'INIT',
        payload: {
          data: normalizedData,
          settings: loadedSettings
        }
      });
    };

    init();
  }, []);

  // 2. Auto-Save on State Change
  useEffect(() => {
    // Skip save on initial mount or before data is loaded
    if (!state.isLoaded) return;
    if (initialLoadRef.current) { 
      initialLoadRef.current = false; 
      return; 
    }

    const timer = setTimeout(() => {
        saveData(state.examData, state.settings);
    }, 500); // 500ms debounce to prevent thrashing disk on rapid updates

    return () => clearTimeout(timer);
  }, [state.examData, state.settings, state.isLoaded]);

  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};