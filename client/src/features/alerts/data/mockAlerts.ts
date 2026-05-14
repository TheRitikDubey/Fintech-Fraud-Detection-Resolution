import type { Alert } from '../types';

export const mockAlerts: Alert[] = [
  {
    id: 'ALRT-94021',
    transactionId: 'TXN_88294_HKG',
    amount: 12400.00,
    location: 'Hong Kong',
    riskLevel: 'CRITICAL',
    timestamp: '2 mins ago',
    status: 'Pending Review'
  },
  {
    id: 'ALRT-93988',
    transactionId: 'TXN_11203_USA',
    amount: 450.22,
    location: 'New York',
    riskLevel: 'HIGH',
    timestamp: '14 mins ago',
    status: 'Investigating'
  },
  {
    id: 'ALRT-93910',
    transactionId: 'TXN_77491_GBR',
    amount: 8120.00,
    location: 'London',
    riskLevel: 'CRITICAL',
    timestamp: '42 mins ago',
    status: 'Pending Review'
  },
  {
    id: 'ALRT-93855',
    transactionId: 'TXN_99211_DEU',
    amount: 2300.50,
    location: 'Berlin',
    riskLevel: 'HIGH',
    timestamp: '1 hour ago',
    status: 'Pending Review'
  }
];
