import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/portal-auth';
import { listDiagnosticOrders } from '@/lib/db';
import PortalDashboard from '@/components/PortalDashboard';

export const dynamic = 'force-dynamic';

export default async function PortalPage() {
  const authed = await isAuthenticated();
  if (!authed) redirect('/portal/login');

  const orders = await listDiagnosticOrders().catch(() => []);

  return <PortalDashboard initialOrders={orders} />;
}
