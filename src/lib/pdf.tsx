/**
 * PDF conclusion statement generator for diagnostic orders.
 * Uses @react-pdf/renderer to render a React template to a PDF buffer.
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { DiagnosticOrder } from '@/types/diagnostic';

Font.registerHyphenationCallback((word) => [word]);

/** Editable fields for the PDF template. Populated from order data with overrides. */
export interface PdfTemplateData {
  companyName: string;
  companyPhone: string;
  companyEmail: string;
  companyAddress: string;
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  tvBrand: string;
  tvModel: string;
  issueDescription: string;
  verdictTitle: string;
  verdictText: string;
  additionalNotes: string;
  creditNote: string;
  tvRetailPrice: string;
  identifiedProblems: string;
  repairPricePrediction: string;
}

/** Build default template data from an order. */
export function buildDefaultTemplateData(order: DiagnosticOrder): PdfTemplateData {
  const shortId = order.id.slice(0, 8).toUpperCase();
  const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const verdictTitle =
    order.status === 'verdict_repairable' ? 'Repairable — Book Your In-Home Visit'
    : order.status === 'verdict_unfixable' ? 'Not Economically Repairable'
    : order.status === 'verdict_custom' ? 'Diagnostic Conclusion'
    : order.status === 'need_more_info' ? 'Additional Information Needed'
    : order.status === 'booked_in_home' ? 'In-Home Visit Scheduled'
    : 'Diagnostic Conclusion';

  const isRepairable = order.status === 'verdict_repairable' || order.status === 'booked_in_home' || order.status === 'verdict_custom';

  return {
    companyName: 'InHome TV Repair',
    companyPhone: '(980) 987-0005',
    companyEmail: 'diagnostics@inhometvrepair.com',
    companyAddress: 'Charlotte, NC',
    orderNumber: `#${shortId}`,
    orderDate: dateStr,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail || 'Not provided',
    tvBrand: order.tvBrand || 'Not specified',
    tvModel: order.tvModel || '',
    issueDescription: order.issueDescription,
    verdictTitle,
    verdictText: order.verdictNote || order.customVerdictText || '',
    additionalNotes: order.notesData?.adminNotes || '',
    creditNote: isRepairable
      ? 'Your $25 diagnostic fee is credited toward your repair. Book your in-home visit and we will deduct it from the final bill.'
      : '',
    tvRetailPrice: order.notesData?.tvRetailPrice || '',
    identifiedProblems: order.notesData?.identifiedProblems || '',
    repairPricePrediction: order.notesData?.repairPricePrediction || '',
  };
}

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#FF5722',
    marginBottom: 24,
  },
  companyName: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#FF5722',
  },
  companyInfo: {
    fontSize: 9,
    color: '#64748b',
    marginTop: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 20,
    color: '#1e293b',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1,
  },
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  fieldLabel: {
    width: 120,
    fontSize: 10,
    color: '#64748b',
    fontFamily: 'Helvetica-Bold',
  },
  fieldValue: {
    flex: 1,
    fontSize: 10,
    color: '#1e293b',
  },
  verdictBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  verdictTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#FF5722',
    marginBottom: 8,
  },
  verdictText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#1e293b',
  },
  notesBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  notesTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1,
  },
  notesText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#1e293b',
  },
  creditBox: {
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  creditText: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#16a34a',
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#94a3b8',
  },
});

function PdfDocument({ data }: { data: PdfTemplateData }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{data.companyName}</Text>
            <Text style={styles.companyInfo}>
              {data.companyAddress} · {data.companyPhone} · {data.companyEmail}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 10, color: '#64748b' }}>Diagnostic Report</Text>
            <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#1e293b', marginTop: 4 }}>
              {data.orderNumber}
            </Text>
            <Text style={{ fontSize: 9, color: '#94a3b8', marginTop: 2 }}>{data.orderDate}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>TV Diagnostic Conclusion Statement</Text>

        {/* Customer info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Name:</Text>
            <Text style={styles.fieldValue}>{data.customerName}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Phone:</Text>
            <Text style={styles.fieldValue}>{data.customerPhone}</Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Email:</Text>
            <Text style={styles.fieldValue}>{data.customerEmail}</Text>
          </View>
        </View>

        {/* TV info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Television</Text>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Brand & Model:</Text>
            <Text style={styles.fieldValue}>
              {data.tvBrand} {data.tvModel}
            </Text>
          </View>
          <View style={styles.fieldRow}>
            <Text style={styles.fieldLabel}>Reported Issue:</Text>
            <Text style={styles.fieldValue}>{data.issueDescription}</Text>
          </View>
        </View>

        {/* Verdict */}
        <View style={styles.verdictBox}>
          <Text style={styles.verdictTitle}>{data.verdictTitle}</Text>
          <Text style={styles.verdictText}>{data.verdictText}</Text>
        </View>

        {/* Technical notes (from portal notes section) */}
        {(data.tvRetailPrice || data.repairPricePrediction || data.identifiedProblems) ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Technical Assessment</Text>
            {data.tvRetailPrice ? (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>TV Retail Price:</Text>
                <Text style={styles.fieldValue}>{data.tvRetailPrice}</Text>
              </View>
            ) : null}
            {data.repairPricePrediction ? (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Est. Repair Cost:</Text>
                <Text style={styles.fieldValue}>{data.repairPricePrediction}</Text>
              </View>
            ) : null}
            {data.identifiedProblems ? (
              <View style={{ marginTop: 4 }}>
                <Text style={styles.fieldLabel}>Identified Problems:</Text>
                <Text style={[styles.fieldValue, { marginTop: 2 }]}>{data.identifiedProblems}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Additional notes */}
        {data.additionalNotes ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Additional Notes</Text>
            <Text style={styles.notesText}>{data.additionalNotes}</Text>
          </View>
        ) : null}

        {/* Credit note */}
        {data.creditNote ? (
          <View style={styles.creditBox}>
            <Text style={styles.creditText}>{data.creditNote}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>{data.companyName} · {data.companyPhone} · {data.companyEmail}</Text>
          <Text>Order {data.orderNumber} · {data.orderDate}</Text>
        </View>
      </Page>
    </Document>
  );
}

/** Render the PDF template to a Buffer. */
export async function renderPdf(data: PdfTemplateData): Promise<Buffer> {
  const { renderToBuffer } = await import('@react-pdf/renderer');
  const buffer = await renderToBuffer(<PdfDocument data={data} />);
  return Buffer.from(buffer);
}
