import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { addSession, getAllSessions } from '../database/db';
import { showFloatingBubble } from 'react-native-floating-bubble';

type SessionState = {
  isActive: boolean;
  checkCount: number;
  crossCount: number;
  accuracy: number;
  history: any[];
  bubbleSize: 'small' | 'medium' | 'large';
  template: 'standard' | 'compact';
};

type Action =
  | { type: 'START_SESSION' }
  | { type: 'INCREMENT_CHECK' }
  | { type: 'INCREMENT_CROSS' }
  | { type: 'END_SESSION' }
  | { type: 'LOAD_HISTORY'; payload: any[] }
  | { type: 'SET_SIZE'; payload: 'small' | 'medium' | 'large' }
  | { type: 'SET_TEMPLATE'; payload: 'standard' | 'compact' };

const initialState: SessionState = {
  isActive: false,
  checkCount: 0,
  crossCount: 0,
  accuracy: 100,
  history: [],
  bubbleSize: 'medium',
  template: 'standard',
};

function calculateAccuracy(check: number, cross: number): number {
  const total = check + cross;
  return total === 0 ? 100 : (check / total) * 100;
}

function sessionReducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'START_SESSION':
      showFloatingBubble();
      return { ...state, isActive: true, checkCount: 0, crossCount: 0, accuracy: 100 };
    case 'INCREMENT_CHECK': {
      const newCheck = state.checkCount + 1;
      return { ...state, checkCount: newCheck, accuracy: calculateAccuracy(newCheck, state.crossCount) };
    }
    case 'INCREMENT_CROSS': {
      const newCross = state.crossCount + 1;
      return { ...state, crossCount: newCross, accuracy: calculateAccuracy(state.checkCount, newCross) };
    }
    case 'END_SESSION': {
      addSession(state.checkCount, state.crossCount, state.accuracy);
      return { ...state, isActive: false };
    }
    case 'LOAD_HISTORY':
      return { ...state, history: action.payload };
    case 'SET_SIZE':
      return { ...state, bubbleSize: action.payload };
    case 'SET_TEMPLATE':
      return { ...state, template: action.payload };
    default:
      return state;
  }
}

const SessionContext = createContext<{
  state: SessionState;
  startSession: () => void;
  incrementCheck: () => void;
  incrementCross: () => void;
  endSession: () => void;
  loadHistory: () => Promise<void>;
  bubbleSize: 'small' | 'medium' | 'large';
  template: 'standard' | 'compact';
  setBubbleSize: (size: 'small' | 'medium' | 'large') => void;
  setTemplate: (tpl: 'standard' | 'compact') => void;
  checkCount: number;
  crossCount: number;
  accuracy: number;
  isActive: boolean;
  history: any[];
}>({
  state: initialState,
  startSession: () => {},
  incrementCheck: () => {},
  incrementCross: () => {},
  endSession: () => {},
  loadHistory: async () => {},
  bubbleSize: 'medium',
  template: 'standard',
  setBubbleSize: () => {},
  setTemplate: () => {},
  checkCount: 0,
  crossCount: 0,
  accuracy: 100,
  isActive: false,
  history: [],
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);

  const startSession = () => dispatch({ type: 'START_SESSION' });
  const incrementCheck = () => dispatch({ type: 'INCREMENT_CHECK' });
  const incrementCross = () => dispatch({ type: 'INCREMENT_CROSS' });
  const endSession = async () => {
    dispatch({ type: 'END_SESSION' });
    // Reload history after saving
    const sessions = await getAllSessions();
    dispatch({ type: 'LOAD_HISTORY', payload: sessions });
  };
  const loadHistory = async () => {
    const sessions = await getAllSessions();
    dispatch({ type: 'LOAD_HISTORY', payload: sessions });
  };
  const setBubbleSize = (size: 'small' | 'medium' | 'large') => dispatch({ type: 'SET_SIZE', payload: size });
  const setTemplate = (tpl: 'standard' | 'compact') => dispatch({ type: 'SET_TEMPLATE', payload: tpl });

  return (
    <SessionContext.Provider
      value={{
        state,
        startSession,
        incrementCheck,
        incrementCross,
        endSession,
        loadHistory,
        bubbleSize: state.bubbleSize,
        template: state.template,
        setBubbleSize,
        setTemplate,
        checkCount: state.checkCount,
        crossCount: state.crossCount,
        accuracy: state.accuracy,
        isActive: state.isActive,
        history: state.history,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}