import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { SelectedService, FrequencyKey } from '../data/serviceCatalog';

export interface ClientInfo {
  companyName: string;
  registrationNo: string;
  siteAddress: string;
  city: string;
  postcode: string;
  contactName: string;
  position: string;
  telephone: string;
  email: string;
  startDate: string;
  endDate: string;
  isRolling: boolean;
  paymentTerms: string;
  escalationRate: string;
}

export interface AgreementState {
  step: number;
  clientInfo: ClientInfo;
  selections: Record<string, SelectedService>;
  termsAccepted: boolean;
  clientSignature: string | null;
  cfSignature: string | null;
  clientPrintName: string;
  cfPrintName: string;
}

const defaultClientInfo: ClientInfo = {
  companyName: '',
  registrationNo: '',
  siteAddress: '',
  city: '',
  postcode: '',
  contactName: '',
  position: '',
  telephone: '',
  email: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  isRolling: false,
  paymentTerms: 'Net 30 Days',
  escalationRate: '3.5',
};

const defaultState: AgreementState = {
  step: 0,
  clientInfo: { ...defaultClientInfo },
  selections: {},
  termsAccepted: false,
  clientSignature: null,
  cfSignature: null,
  clientPrintName: '',
  cfPrintName: '',
};

type Action =
  | { type: 'SET_STEP'; step: number }
  | { type: 'UPDATE_CLIENT'; field: keyof ClientInfo; value: string | boolean }
  | { type: 'TOGGLE_SERVICE'; serviceId: string; categoryId: string; freq: FrequencyKey; unitPrice: number }
  | { type: 'UPDATE_SERVICE_PRICE'; serviceId: string; price: number }
  | { type: 'UPDATE_SERVICE_QTY'; serviceId: string; qty: number }
  | { type: 'SET_TERMS_ACCEPTED'; accepted: boolean }
  | { type: 'SET_CLIENT_PRINT_NAME'; name: string }
  | { type: 'SET_CF_PRINT_NAME'; name: string }
  | { type: 'RESET' };

function reducer(state: AgreementState, action: Action): AgreementState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'UPDATE_CLIENT':
      return { ...state, clientInfo: { ...state.clientInfo, [action.field]: action.value } };
    case 'TOGGLE_SERVICE': {
      const next = { ...state.selections };
      if (next[action.serviceId]) {
        delete next[action.serviceId];
      } else {
        next[action.serviceId] = {
          serviceId: action.serviceId,
          categoryId: action.categoryId,
          freq: action.freq,
          qty: 1,
          unitPrice: action.unitPrice,
        };
      }
      return { ...state, selections: next };
    }
    case 'UPDATE_SERVICE_PRICE': {
      if (!state.selections[action.serviceId]) return state;
      return { ...state, selections: { ...state.selections, [action.serviceId]: { ...state.selections[action.serviceId], unitPrice: action.price } } };
    }
    case 'UPDATE_SERVICE_QTY': {
      if (!state.selections[action.serviceId]) return state;
      return { ...state, selections: { ...state.selections, [action.serviceId]: { ...state.selections[action.serviceId], qty: Math.max(1, action.qty) } } };
    }
    case 'SET_TERMS_ACCEPTED':
      return { ...state, termsAccepted: action.accepted };
    case 'SET_CLIENT_PRINT_NAME':
      return { ...state, clientPrintName: action.name };
    case 'SET_CF_PRINT_NAME':
      return { ...state, cfPrintName: action.name };
    case 'RESET':
      return { ...defaultState };
    default:
      return state;
  }
}

interface ContextType {
  state: AgreementState;
  dispatch: React.Dispatch<Action>;
}

const AgreementCtx = createContext<ContextType | null>(null);

export function AgreementProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState);
  return <AgreementCtx.Provider value={{ state, dispatch }}>{children}</AgreementCtx.Provider>;
}

export function useAgreement() {
  const ctx = useContext(AgreementCtx);
  if (!ctx) throw new Error('useAgreement must be inside AgreementProvider');
  return ctx;
}
