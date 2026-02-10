import { config } from '../config/appConfig';

// Helper to create a skeleton cert if one is missing (for Premade integration)
const createSkeletonCert = (name) => ({
  fullName: name,
  shortName: name.length > 18 ? name.slice(0, 15) + '…' : name,
  tests: [],
  domains: [],
  studySessions: [],
  journalEntries: [],
  isPremade: true, // Marker to distinguish origin
  isHidden: false  // Flag for UI filtering
});

export const dataReducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case 'INIT':
      return {
        ...state,
        examData: payload?.data || state.examData,
        settings: payload?.settings || state.settings,
        isLoaded: true
      };

    case 'SET_EXAM_DATA':
      return { ...state, examData: payload };

    case 'SET_SETTINGS':
      return { ...state, settings: payload };

    // --- Granular Data Actions ---

    case 'ADD_CERT': {
      const { key, name } = payload;
      if (state.examData[key]) return state;

      return {
        ...state,
        examData: {
          ...state.examData,
          [key]: createSkeletonCert(name)
        }
      };
    }

    // Atomic creation for premade content
    case 'ADD_PREMADE_CERT': {
      const { key, name, domains } = payload;
      if (state.examData[key]) return state;

      const newCert = createSkeletonCert(name);
      
      if (Array.isArray(domains)) {
        newCert.domains = domains.map(d => ({ name: d, isDeleted: false }));
      }

      return {
        ...state,
        examData: {
          ...state.examData,
          [key]: newCert
        }
      };
    }

    case 'TOGGLE_CERT_VISIBILITY': {
      const { key, isHidden } = payload;
      const nextExamData = { ...state.examData };
      
      if (nextExamData[key]) {
        nextExamData[key] = {
          ...nextExamData[key],
          isHidden: isHidden
        };
      }

      return { ...state, examData: nextExamData };
    }

    case 'ADD_TEST_RESULT': {
      const { certId, testData } = payload;
      const nextExamData = { ...state.examData };

      if (!nextExamData[certId]) {
        nextExamData[certId] = createSkeletonCert(certId.replace(/_/g, ' '));
      }

      const targetCert = { ...nextExamData[certId] };
      targetCert.tests = [...targetCert.tests, testData];
      nextExamData[certId] = targetCert;

      return { ...state, examData: nextExamData };
    }

    case 'ADD_DOMAIN': {
      const { certId, domainName } = payload;
      const nextExamData = { ...state.examData };
      if (!nextExamData[certId]) return state;

      const targetCert = { ...nextExamData[certId] };
      const exists = targetCert.domains.find(d => d.name === domainName);
      if (exists) {
        if (exists.isDeleted) exists.isDeleted = false; 
      } else {
        targetCert.domains = [...targetCert.domains, { name: domainName, isDeleted: false }];
      }
      
      nextExamData[certId] = targetCert;
      return { ...state, examData: nextExamData };
    }

    case 'ADD_SESSION': {
      const { certId, sessionData } = payload;
      const nextExamData = { ...state.examData };
      if (!nextExamData[certId]) return state;

      const targetCert = { ...nextExamData[certId] };
      targetCert.studySessions = [...targetCert.studySessions, sessionData];
      nextExamData[certId] = targetCert;

      return { ...state, examData: nextExamData };
    }

    // --- Deletion Actions ---

    case 'DELETE_CERT': {
      const nextExamData = { ...state.examData };
      delete nextExamData[payload]; 
      return { ...state, examData: nextExamData };
    }

    case 'SOFT_DELETE_TEST': {
      const { certId, testId } = payload;
      const nextExamData = { ...state.examData };
      if (!nextExamData[certId]) return state;

      const targetCert = { ...nextExamData[certId] };
      targetCert.tests = targetCert.tests.map(t => 
        t.id === testId ? { ...t, isDeleted: true } : t
      );
      nextExamData[certId] = targetCert;

      return { ...state, examData: nextExamData };
    }

    default:
      return state;
  }
};