/**
 * Shared types for the $25 Online Diagnostic feature.
 */

/** Lifecycle of a diagnostic order. */
export type DiagnosticStatus =
  | 'pending_payment' // order created, customer hasn't paid yet
  | 'paid' // payment confirmed, awaiting admin review (portal: "Pending")
  | 'processing' // admin started reviewing, entering verdict + notes (portal: "Processing")
  | 'awaiting_custom_verdict' // admin tapped "Custom verdict" in Telegram, waiting for text input
  | 'verdict_repairable' // admin saved a fixable verdict (portal: "Verdict" — pre-final)
  | 'verdict_unfixable' // admin saved an unfixable verdict (portal: "Verdict" — pre-final)
  | 'verdict_custom' // admin wrote a custom verdict (portal: "Verdict" — pre-final)
  | 'need_more_info' // admin needs more photos/info from customer
  | 'booked_in_home' // customer converted the $25 credit into an in-home visit
  | 'completed' // order finalized, PDF generated, email sent to customer
  | 'abandoned'; // customer never completed payment (Stripe session expired)

/** A single uploaded media file (photo or video). */
export interface DiagnosticMedia {
  /** S3 object key, used to (re)generate presigned URLs. */
  key: string;
  /** Original file name from the user's device. */
  fileName: string;
  /** MIME type, e.g. image/png, video/mp4. */
  mimeType: string;
  /** File size in bytes. */
  size: number;
  /** Presigned URL (may expire; regenerate from `key` when needed). */
  url: string;
}

/** A row in the `diagnostic_orders` table. */
export interface DiagnosticOrder {
  id: string;
  status: DiagnosticStatus;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  tvBrand: string | null;
  tvModel: string | null;
  issueDescription: string;
  media: DiagnosticMedia[];
  stripeSessionId: string | null;
  stripePaymentIntent: string | null;
  amountCents: number;
  verdictNote: string | null;
  adminTelegramMessageId: number | null;
  customVerdictText: string | null;
  customAskMessageId: number | null;
  pdfS3Key: string | null;
  pdfGeneratedAt: string | null;
  completedAt: string | null;
  notesData: OrderNotes | null;
  verdictCategory: string | null;
  createdAt: string;
  paidAt: string | null;
  verdictAt: string | null;
}

/** Notes section stored as JSONB in the `notes_data` column. */
export interface OrderNotes {
  tvRetailPrice?: string;
  identifiedProblems?: string;
  repairPricePrediction?: string;
  adminNotes?: string;
}

/** Verdict preset template for quick-fill in the portal. */
export interface VerdictPreset {
  id: string;
  name: string;
  category: 'fixable' | 'unfixable';
  text: string;
}

/** Built-in verdict presets shown as quick-fill buttons in the portal. */
export const VERDICT_PRESETS: VerdictPreset[] = [
  {
    id: 'main_board',
    name: 'Main Board',
    category: 'fixable',
    text: 'Diagnosis: Main board failure detected. The main board controls the TV\'s processing and image output. Replacement is available and economically viable. Your $25 diagnostic fee is credited toward the repair.',
  },
  {
    id: 'power_board',
    name: 'Power Board',
    category: 'fixable',
    text: 'Diagnosis: Power board / SMPS failure detected. The power supply board is not delivering proper voltage to the main components. Replacement is available and economically viable. Your $25 diagnostic fee is credited toward the repair.',
  },
  {
    id: 'tcon',
    name: 'T-Con',
    category: 'fixable',
    text: 'Diagnosis: T-Con (Timing Control) board failure detected. The T-Con board controls the timing signals to the display panel. Replacement is available and economically viable. Your $25 diagnostic fee is credited toward the repair.',
  },
  {
    id: 'cracked_panel',
    name: 'Cracked Panel',
    category: 'unfixable',
    text: 'Diagnosis: The display panel (LCD/OLED matrix) is cracked or physically damaged. Panel replacement typically costs more than a new TV of equivalent size and model. This issue is not economically repairable.',
  },
];

/** Payload sent from the client form to POST /api/online-diagnostic. */
export interface DiagnosticSubmissionPayload {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  tvBrand?: string;
  tvModel?: string;
  issueDescription: string;
  /** Media is uploaded directly to S3 by the server in the same request (multipart). */
}

/** Response from POST /api/online-diagnostic on success. */
export interface DiagnosticSubmissionResponse {
  orderId: string;
  /** Stripe Checkout Session client_secret for embedded checkout (ui_mode: embedded). */
  clientSecret: string;
}

/** Actions the admin can take via Telegram inline keyboard. */
export type DiagnosticAction =
  | 'repairable'
  | 'unfixable'
  | 'need_more'
  | 'book_in_home'
  | 'custom'
  | 'cust_confirm'
  | 'cust_rewrite'
  | 'cust_cancel';

/** Allowed upload MIME types. */
export const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'video/mp4',
  'video/quicktime',
] as const;

/** Allowed file extensions (used for client-side validation fallback). */
export const ALLOWED_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.mp4',
  '.mov',
] as const;

/** Max total upload size per submission, in bytes (50 MB). */
export const MAX_TOTAL_UPLOAD_BYTES = 50 * 1024 * 1024;

/** Max number of files per submission. */
export const MAX_FILE_COUNT = 6;

/** Diagnostic fee in cents ($25.00). */
export const DIAGNOSTIC_FEE_CENTS = 2500;
