export interface SalesRecord {
  id: string;
  saleDate: Date;
  companyName: string;
  aggregateType: string;
  aggregateQuantity: number;
  driverName: string;
  plateNumber: string;
  hauler: string;
  cashPoNumber: string;
  drIsInvNumber: string;
  loadedBy: string;
  amount: number;
  paymentType: 'CASH' | 'ACCOUNTS_RECEIVABLE';
}

export const generateMockSalesData = (): SalesRecord[] => {
  const cashSales: Partial<SalesRecord>[] = [
    { companyName: 'FOUR N', aggregateType: 'S-1', aggregateQuantity: 2, driverName: 'J. ROXAS', plateNumber: 'CAJ 1435', hauler: 'FOUR N', drIsInvNumber: 'IS#1046', loadedBy: 'LOADER E. PERALTA', amount: 1400.00 },
    { companyName: 'RA ROQUE', aggregateType: 'S-1', aggregateQuantity: 2, driverName: 'E. TUAZON', plateNumber: 'AAT 2245', hauler: 'RA ROQUE', drIsInvNumber: 'IS#1047', loadedBy: 'LOADER E. PERALTA', amount: 1400.00 },
    { companyName: 'RA ROQUE', aggregateType: 'G-1', aggregateQuantity: 2, driverName: 'J. AQUINO', plateNumber: 'CBJ 6104', hauler: 'RA ROQUE', drIsInvNumber: 'IS#1048', loadedBy: 'LOADER E. PERALTA', amount: 2100.00 },
    { companyName: 'AUSTRIA', aggregateType: '3/4', aggregateQuantity: 2, driverName: 'J. AUSTRIA', plateNumber: 'WQC 152', hauler: 'AUSTRIA', drIsInvNumber: 'IS#1049', loadedBy: 'LOADER D. DURAINE', amount: 2400.00 },
    { companyName: 'JHAKE & JHAIDA', aggregateType: '3/4', aggregateQuantity: 2, driverName: 'BOGS', plateNumber: 'CAM 7933', hauler: 'JHAKE & JHAIDA', drIsInvNumber: 'IS#1050', loadedBy: 'LOADER N. TUAZON', amount: 2400.00 },
    { companyName: 'REY DONAIRE', aggregateType: 'G-1', aggregateQuantity: 20, driverName: 'R. MURILLO JR.', plateNumber: 'NIU 9301', hauler: 'REY DONAIRE', drIsInvNumber: 'IS#1051', loadedBy: 'LOADER N. TUAZON', amount: 22000.00 },
    { companyName: 'RA ROQUE', aggregateType: 'G-1', aggregateQuantity: 2, driverName: 'G. PADUA', plateNumber: 'CBP 9456', hauler: 'RA ROQUE', drIsInvNumber: 'IS#1052', loadedBy: 'LOADER N. TUAZON', amount: 2400.00 },
    { companyName: 'RNR TRUCK', aggregateType: '3/8', aggregateQuantity: 2, driverName: 'S. MANLAPID', plateNumber: 'CBR 9141', hauler: 'RNR TRUCK', drIsInvNumber: 'IS#1053', loadedBy: 'LOADER N. TUAZON', amount: 2000.00 },
    { companyName: 'RA ROQUE', aggregateType: 'S-1', aggregateQuantity: 2, driverName: 'E. TUAZON', plateNumber: 'AAT 2245', hauler: 'RA ROQUE', drIsInvNumber: 'IS#1054', loadedBy: 'LOADER N. TUAZON', amount: 1400.00 },
    { companyName: 'BRIAN GOMEZ', aggregateType: 'S-1', aggregateQuantity: 2, driverName: 'J. GARCIA', plateNumber: 'CBA 1724', hauler: 'B.GOMEZ', drIsInvNumber: 'IS#1055', loadedBy: 'LOADER N. TUAZON', amount: 1400.00 },
    { companyName: 'RA ROQUE', aggregateType: 'G-1', aggregateQuantity: 2, driverName: 'J. AQUINO', plateNumber: 'CBJ 6104', hauler: 'RA ROQUE', drIsInvNumber: 'IS#1056', loadedBy: 'LOADER N. TUAZON', amount: 2100.00 },
    { companyName: 'FOUR N', aggregateType: 'S-1', aggregateQuantity: 2, driverName: 'J. ROXAS', plateNumber: 'CAJ 1435', hauler: 'FOUR N', drIsInvNumber: 'IS#1057', loadedBy: 'LOADER N. TUAZON', amount: 1400.00 },
    { companyName: 'RA ROQUE', aggregateType: 'G-1', aggregateQuantity: 2, driverName: 'J. AQUINO', plateNumber: 'CBJ 6104', hauler: 'RA ROQUE', drIsInvNumber: 'IS#1058', loadedBy: 'LOADER N. TUAZON', amount: 2400.00 },
    { companyName: 'RA ROQUE', aggregateType: '3/4', aggregateQuantity: 2, driverName: 'F. REYES', plateNumber: 'CAN 6486', hauler: 'RA ROQUE', drIsInvNumber: 'IS#1059', loadedBy: 'LOADER N. TUAZON', amount: 2400.00 },
    { companyName: 'BRIAN GOMEZ', aggregateType: 'S-1', aggregateQuantity: 2, driverName: 'J. GARCIA', plateNumber: 'CBA 1724', hauler: 'B.GOMEZ', drIsInvNumber: 'IS#1060', loadedBy: 'LOADER N. TUAZON', amount: 1400.00 },
    { companyName: 'BRIAN GOMEZ', aggregateType: 'S-1', aggregateQuantity: 2, driverName: 'J. GARCIA', plateNumber: 'CBA 1724', hauler: 'B.GOMEZ', drIsInvNumber: 'IS#1061', loadedBy: 'LOADER N. TUAZON', amount: 1400.00 },
  ];

  const arSales: Partial<SalesRecord>[] = [
    { companyName: 'PASCAL CONSTRUCTION', aggregateType: '3/4', aggregateQuantity: 30, driverName: 'D. NAVA', plateNumber: 'NKQ 9756', hauler: 'PASCAL CONSTRUCTION', cashPoNumber: 'PO#3260', drIsInvNumber: 'DR#5369', loadedBy: 'BACKHOE G. NENILGA', amount: 35400.00 },
    { companyName: 'JAREB CORPORATION', aggregateType: '3/4', aggregateQuantity: 23, driverName: 'R. DELGADO', plateNumber: 'NHH 7902', hauler: 'JAREB CORPORATION', cashPoNumber: 'PO#2025-001', drIsInvNumber: 'DR#5370', loadedBy: 'LOADER N. TUAZON', amount: 24840.00 },
    { companyName: 'JAREB CORPORATION', aggregateType: '3/4', aggregateQuantity: 22, driverName: 'A. PAKIWAG', plateNumber: 'NHH 7894', hauler: 'JAREB CORPORATION', cashPoNumber: 'PO#2025-001', drIsInvNumber: 'DR#5371', loadedBy: 'LOADER N. TUAZON', amount: 23760.00 },
    { companyName: 'JAREB CORPORATION', aggregateType: '3/4', aggregateQuantity: 23, driverName: 'G. LOPEZ', plateNumber: 'NHE 3945', hauler: 'JAREB CORPORATION', cashPoNumber: 'PO#2025-001', drIsInvNumber: 'DR#5372', loadedBy: 'LOADER N. TUAZON', amount: 24840.00 },
    { companyName: 'SUPREME BUILDERS', aggregateType: 'S-1', aggregateQuantity: 17, driverName: 'H. NISAY', plateNumber: 'NBK 1131', hauler: 'SUPREME BUILDERS', cashPoNumber: 'PO#405', drIsInvNumber: 'DR#5373', loadedBy: 'LOADER N. TUAZON', amount: 11900.00 },
    { companyName: 'SUPREME BUILDERS', aggregateType: 'S-1', aggregateQuantity: 14, driverName: 'R. MAYUGBA', plateNumber: 'CBP 9279', hauler: 'SUPREME BUILDERS', cashPoNumber: 'PO#406', drIsInvNumber: 'DR#5374', loadedBy: 'LOADER N. TUAZON', amount: 9800.00 },
    { companyName: 'JAREB CORPORATION', aggregateType: 'G-1', aggregateQuantity: 21, driverName: 'A. PAKIWAG', plateNumber: 'NHH 7894', hauler: 'JAREB CORPORATION', cashPoNumber: 'PO#2025-001', drIsInvNumber: 'DR#5375', loadedBy: 'LOADER N. TUAZON', amount: 20580.00 },
    { companyName: 'JAREB CORPORATION', aggregateType: '3/4', aggregateQuantity: 22, driverName: 'R. DELGADO', plateNumber: 'NHH 7902', hauler: 'JAREB CORPORATION', cashPoNumber: 'PO#2025-001', drIsInvNumber: 'DR#32501', loadedBy: 'LOADER N. TUAZON', amount: 23760.00 },
  ];

  const today = new Date();
  const records: SalesRecord[] = [];

  const generateRecordsForDateRange = (startDaysAgo: number, endDaysAgo: number) => {
    for (let daysAgo = startDaysAgo; daysAgo >= endDaysAgo; daysAgo--) {
      const date = new Date(today);
      date.setDate(date.getDate() - daysAgo);

      const numCashSales = Math.floor(Math.random() * 8) + 8;
      const numArSales = Math.floor(Math.random() * 4) + 4;

      for (let i = 0; i < numCashSales; i++) {
        const template = cashSales[Math.floor(Math.random() * cashSales.length)];
        records.push({
          id: `${date.toISOString()}-cash-${i}`,
          saleDate: date,
          paymentType: 'CASH',
          ...template,
        } as SalesRecord);
      }

      for (let i = 0; i < numArSales; i++) {
        const template = arSales[Math.floor(Math.random() * arSales.length)];
        records.push({
          id: `${date.toISOString()}-ar-${i}`,
          saleDate: date,
          paymentType: 'ACCOUNTS_RECEIVABLE',
          ...template,
        } as SalesRecord);
      }
    }
  };

  generateRecordsForDateRange(365, 0);

  return records;
};
