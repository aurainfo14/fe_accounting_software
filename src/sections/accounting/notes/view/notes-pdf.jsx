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
    padding: 30,
    fontFamily: 'CircularStd',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottom: '3px solid #2563eb',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  generatedDate: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: 'medium',
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1f2937',
  },
  dateRange: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 25,
    color: '#6b7280',
    fontWeight: 'medium',
    backgroundColor: '#f3f4f6',
    padding: '8px 16px',
    borderRadius: 6,
    alignSelf: 'center',
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginBottom: 25,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #e5e7eb',
    minHeight: 35,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#f8fafc',
    fontWeight: 'bold',
    borderBottom: '2px solid #2563eb',
  },
  tableCell: {
    padding: 12,
    borderRight: '1px solid #e5e7eb',
    fontSize: 10,
    flex: 1,
  },
  tableCellNumber: {
    padding: 12,
    borderRight: '1px solid #e5e7eb',
    fontSize: 10,
    flex: 0.6,
    textAlign: 'center',
    fontWeight: 'medium',
  },
  tableCellTitle: {
    padding: 12,
    borderRight: '1px solid #e5e7eb',
    fontSize: 10,
    flex: 2.2,
    fontWeight: 'medium',
  },
  tableCellDescription: {
    padding: 12,
    borderRight: '1px solid #e5e7eb',
    fontSize: 9,
    flex: 3,
    lineHeight: 1.4,
  },
  tableCellDate: {
    padding: 12,
    borderRight: '1px solid #e5e7eb',
    fontSize: 10,
    flex: 1.2,
    textAlign: 'center',
  },
  tableCellBranch: {
    padding: 12,
    borderRight: '1px solid #e5e7eb',
    fontSize: 10,
    flex: 1.5,
    textAlign: 'center',
  },
  tableCellInvoice: {
    padding: 12,
    fontSize: 9,
    flex: 2,
    lineHeight: 1.3,
  },
  summary: {
    marginTop: 25,
    padding: 20,
    backgroundColor: '#f8fafc',
    border: '2px solid #e5e7eb',
    borderRadius: 8,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1f2937',
  },
  summaryText: {
    fontSize: 12,
    fontWeight: 'medium',
    textAlign: 'center',
    color: '#374151',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#9ca3af',
    borderTop: '1px solid #e5e7eb',
    paddingTop: 10,
  },
  invoiceLink: {
    color: '#2563eb',
    textDecoration: 'none',
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
      {/* <Text style={styles.tableCellInvoice}>Invoice Files</Text> */}
    </View>
  );

  const renderTableRow = (note, index) => {
    const formatInvoiceFiles = () => {
      if (!note.invoice || note.invoice.length === 0) return '-';
      
      if (note.invoice.length === 1) {
        const fileName = note.invoice[0].split('/').pop() || 'File';
        return `${fileName}`;
      }
      
      return `${note.invoice.length} file(s)`;
    };

    return (
      <View key={note._id} style={styles.tableRow}>
        <Text style={styles.tableCellNumber}>{index + 1}</Text>
        <Text style={styles.tableCellTitle}>{note.title || '-'}</Text>
        <Text style={styles.tableCellDescription}>
          {note.description ? (note.description.length > 60 ? `${note.description.substring(0, 60)}...` : note.description) : '-'}
        </Text>
        <Text style={styles.tableCellDate}>
          {note.date ? moment(note.date).format('DD/MM/YYYY') : '-'}
        </Text>
        <Text style={styles.tableCellBranch}>
          {note.branch?.branchName || note.branch?.name || '-'}
        </Text>
        {/* <Text style={styles.tableCellInvoice}>
          {formatInvoiceFiles()}
        </Text> */}
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.companyName}>Company Report</Text>
          <Text style={styles.generatedDate}>Generated: {formattedDate}</Text>
        </View>

        <Text style={styles.reportTitle}>Notes Report</Text>
        <Text style={styles.dateRange}>{getDateRangeText()}</Text>

        <View style={styles.table}>
          {renderTableHeader()}
          {notesData?.map((note, index) => renderTableRow(note, index))}
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Report Summary</Text>
          <Text style={styles.summaryText}>
            Total Notes: {notesData?.length || 0}
          </Text>
        </View>

        <Text style={styles.footer}>
          This report was generated automatically on {formattedDate} • Notes Management System
        </Text>
      </Page>
    </Document>
  );
}
