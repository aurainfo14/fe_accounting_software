import React from 'react';
import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import moment from 'moment/moment.js';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: '/fonts/Roboto-Regular.ttf' },
    { src: '/fonts/Roboto-Bold.ttf', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    backgroundColor: '#fff',
    padding: 24,
  },
  joinedTable: {
    border: '1px solid #000',
    width: '100%',
    marginBottom: 0,
    marginTop: 0,
  },
  row: {
    flexDirection: 'row',
    borderBottom: '1px solid #000',
    minHeight: 26,
  },
  rowLast: {
    borderBottom: 0,
  },
  cell: {
    flex: 1,
    borderRight: '1px solid #000',
    fontSize: 13,
    paddingVertical: 4,
    paddingHorizontal: 6,
    justifyContent: 'center',
    display: 'flex',
  },
  cell2: {
    flex: 1,
    borderRight: '1px solid #000',
    fontSize: 10,
    paddingVertical: 4,
    paddingHorizontal: 6,
    justifyContent: 'center',
    display: 'flex',
  },
  cellLast: {
    borderRight: 0,
  },
  cellBold: {
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  cellHeader: {
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 2,
  },
  cellLeft: {
    textAlign: 'left',
  },
  cellRight: {
    textAlign: 'right',
  },
  cellMainHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
  branchTablesRow: {
    flexDirection: 'row',
    marginBottom: 0,
    justifyContent: 'flex-start',
  },
  branchTable: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '50%',
    border: '1px solid #000',
    marginRight: 0,
    marginBottom: 0,
    backgroundColor: '#fff',
  },
  branchTableLastInRow: {
    marginRight: 0,
  },
  branchTableFullWidth: {
    width: '100%',
    minWidth: '100%',
    maxWidth: '100%',
  },
});

export default function DayBookPdf({ companyAllData, monthYear }) {
  const formattedMonthYear =
    monthYear && monthYear !== 'this_month'
      ? moment(new Date(monthYear)).format('MMMM-YYYY')
      : null;
  const branches = companyAllData?.data ? Object.keys(companyAllData.data) : [];

  const summaryRows = [
    [
      { text: 'last month profit/loss', align: 'left' },
      { text: companyAllData.carryForward ?? '-', align: 'right' },
      { text: 'Total expence', align: 'left' },
      { text: companyAllData.totalExpenseThisMonth ?? '-', align: 'right' },
    ],
    [
      { text: 'This month profit/loss', align: 'left' },
      {
        text:
          (companyAllData.totalIncomeThisMonth ?? 0) - (companyAllData.totalExpenseThisMonth ?? 0),
        align: 'right',
      },
      { text: 'Total income', align: 'left' },
      { text: companyAllData.totalIncomeThisMonth ?? '-', align: 'right' },
    ],
    [
      { text: 'Total loss/profit', align: 'left' },
      { text: companyAllData.netIncludingCarryForward ?? '-', align: 'right' },
      { text: 'total:', align: 'left' },
      { text: companyAllData.total ?? '-', align: 'right' },
    ],
  ];

  let allTypesSet = new Set();
  branches.forEach((branch) => {
    const branchData = companyAllData.data[branch];
    if (branchData.income) Object.keys(branchData.income).forEach((t) => allTypesSet.add(t));
    if (branchData.expense) Object.keys(branchData.expense).forEach((t) => allTypesSet.add(t));
  });
  const allTypes = Array.from(allTypesSet);
  const maxRows = Math.max(allTypes.length, 5);

  const branchPairs = [];
  for (let i = 0; i < branches.length; i += 2) {
    branchPairs.push(branches.slice(i, i + 2));
  }

  function renderBranchTable(branch, isLastInRow = false, isFullWidth = false) {
    const branchData = companyAllData.data[branch];
    const subHeaderRow = [
      { text: 'Type', header: true },
      { text: 'Expense', header: true },
      { text: 'Income', header: true },
    ];

    const dataRows = [];
    for (let i = 0; i < maxRows; i++) {
      const type = allTypes[i] || '';
      dataRows.push([
        type,
        type ? (branchData.expense && branchData.expense[type] ? branchData.expense[type] : 0) : '',
        type ? (branchData.income && branchData.income[type] ? branchData.income[type] : 0) : '',
      ]);
    }
    const totalRow = ['Total', branchData.totalExpense ?? '', branchData.totalIncome ?? ''];

    return (
      <View
        key={branch}
        style={[
          styles.branchTable,
          isLastInRow && styles.branchTableLastInRow,
          isFullWidth && styles.branchTableFullWidth,
        ]}
        wrap={false}
      >
        <View style={styles.row}>
          <Text
            style={[
              styles.cell,
              styles.cellMainHeader,
              { flex: 3, borderBottom: '1px solid #000' },
            ]}
          >
            {branch}
          </Text>
        </View>
        <View style={styles.row}>
          {subHeaderRow.map((cell, cidx) => (
            <Text
              key={cidx}
              style={[
                styles.cell,
                cidx === subHeaderRow.length - 1 && styles.cellLast,
                styles.cellHeader,
              ]}
            >
              {cell.text}
            </Text>
          ))}
        </View>
        {dataRows.map((row, ridx) => (
          <View style={styles.row} key={ridx}>
            {row.map((cell, cidx) => (
              <Text
                key={cidx}
                style={[
                  styles.cell,
                  cidx === row.length - 1 && styles.cellLast,
                  cidx === 0 && styles.cellLeft,
                ]}
              >
                {cell}
              </Text>
            ))}
          </View>
        ))}
        <View style={[styles.row, styles.rowLast]}>
          {totalRow.map((cell, cidx) => (
            <Text
              key={cidx}
              style={[
                styles.cell,
                cidx === totalRow.length - 1 && styles.cellLast,
                cidx === 0 && styles.cellLeft,
              ]}
            >
              {cell}
            </Text>
          ))}
        </View>
      </View>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text
          style={{
            fontSize: 36,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 8,
            marginTop: 0,
            textTransform: 'uppercase',
          }}
        >
          Company Report
        </Text>
        {formattedMonthYear && (
          <Text
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 12,
              marginTop: 0,
            }}
          >
            {formattedMonthYear}
          </Text>
        )}
        <View style={styles.joinedTable}>
          {summaryRows.map((row, ridx) => (
            <View
              style={[styles.row, ridx === summaryRows.length - 1 && styles.rowLast]}
              key={ridx}
            >
              {row.map((cell, cidx) => (
                <Text
                  key={cidx}
                  style={[
                    styles.cell2,
                    cidx === row.length - 1 && styles.cellLast,
                    cell.align === 'right' && styles.cellRight,
                    cell.align === 'left' && styles.cellLeft,
                    cell.mainHeader && styles.cellMainHeader,
                  ]}
                >
                  {cell.text}
                </Text>
              ))}
            </View>
          ))}
        </View>
        {branchPairs.map((pair, rowIdx) => (
          <View key={rowIdx} style={styles.branchTablesRow} wrap={false}>
            {pair.map((branch, idx) =>
              renderBranchTable(branch, idx === pair.length - 1, pair.length === 1)
            )}
          </View>
        ))}
      </Page>
    </Document>
  );
}
