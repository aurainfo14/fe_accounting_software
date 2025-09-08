import React from 'react';
import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import moment from 'moment/moment.js';

Font.register({
  family: 'CircularStd',
  fonts: [
    {
      src: '/fonts/CircularStd-Book.otf',
      fontWeight: 'normal',
    },
    {
      src: '/fonts/CircularStd-Medium.otf',
      fontWeight: 'medium',
    },
    {
      src: '/fonts/CircularStd-Bold.otf',
      fontWeight: 'bold',
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontFamily: 'CircularStd',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '2px solid #000',
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  dateRange: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #000',
    minHeight: 30,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    borderBottom: '2px solid #000',
  },
  tableCell: {
    padding: 8,
    borderRight: '1px solid #000',
    fontSize: 9,
    flex: 1,
  },
  tableCellNumber: {
    padding: 8,
    borderRight: '1px solid #000',
    fontSize: 9,
    flex: 0.5,
    textAlign: 'center',
  },
  tableCellTitle: {
    padding: 8,
    borderRight: '1px solid #000',
    fontSize: 9,
    flex: 2,
  },
  tableCellDescription: {
    padding: 8,
    borderRight: '1px solid #000',
    fontSize: 9,
    flex: 3,
  },
  tableCellDate: {
    padding: 8,
    borderRight: '1px solid #000',
    fontSize: 9,
    flex: 1,
  },
  tableCellBranch: {
    padding: 8,
    borderRight: '1px solid #000',
    fontSize: 9,
    flex: 1.5,
  },
  tableCellInvoice: {
    padding: 8,
    fontSize: 9,
    flex: 1.5,
  },
  summary: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    border: '1px solid #ccc',
  },
  summaryText: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 8,
    color: '#666',
  },
});

export default function NotesPdf({ notesData, filterData }) {
  const currentDate = new Date();
  const formattedDate = moment(currentDate).format('DD/MM/YYYY HH:mm');

  const getDateRangeText = () => {
    if (filterData?.startDate && filterData?.endDate) {
      return `From ${moment(filterData.startDate).format('DD/MM/YYYY')} to ${moment(filterData.endDate).format('DD/MM/YYYY')}`;
    }
    if (filterData?.startDate) {
      return `From ${moment(filterData.startDate).format('DD/MM/YYYY')}`;
    }
    if (filterData?.endDate) {
      return `To ${moment(filterData.endDate).format('DD/MM/YYYY')}`;
    }
    return 'All Notes';
  };

  const renderTableHeader = () => (
    <View style={[styles.tableRow, styles.tableHeader]}>
      <Text style={styles.tableCellNumber}>#</Text>
      <Text style={styles.tableCellTitle}>Title</Text>
      <Text style={styles.tableCellDescription}>Description</Text>
      <Text style={styles.tableCellDate}>Date</Text>
      <Text style={styles.tableCellBranch}>Branch</Text>
      <Text style={styles.tableCellInvoice}>Invoice Files</Text>
    </View>
  );

  const renderTableRow = (note, index) => (
    <View key={note._id} style={styles.tableRow}>
      <Text style={styles.tableCellNumber}>{index + 1}</Text>
      <Text style={styles.tableCellTitle}>{note.title || '-'}</Text>
      <Text style={styles.tableCellDescription}>
        {note.description ? (note.description.length > 50 ? `${note.description.substring(0, 50)}...` : note.description) : '-'}
      </Text>
      <Text style={styles.tableCellDate}>
        {note.date ? moment(note.date).format('DD/MM/YYYY') : '-'}
      </Text>
      <Text style={styles.tableCellBranch}>
        {note.branch?.branchName || '-'}
      </Text>
      <Text style={styles.tableCellInvoice}>
        {note.invoice && note.invoice.length > 0 ? note.invoice.join(', ') : '-'}
      </Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.companyName}>Company Report</Text>
          <Text style={{ fontSize: 10 }}>Generated: {formattedDate}</Text>
        </View>

        <Text style={styles.reportTitle}>Notes Report</Text>
        <Text style={styles.dateRange}>{getDateRangeText()}</Text>

        <View style={styles.table}>
          {renderTableHeader()}
          {notesData?.map((note, index) => renderTableRow(note, index))}
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            Total Notes: {notesData?.length || 0}
          </Text>
        </View>

        <Text style={styles.footer}>
          This report was generated on {formattedDate}
        </Text>
      </Page>
    </Document>
  );
}
