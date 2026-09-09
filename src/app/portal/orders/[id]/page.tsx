import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/portal-auth';
import { getDiagnosticOrderById } from '@/lib/db';
import OrderDetail from '@/components/OrderDetail';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const authed = await isAuthenticated();
  if (!authed) redirect('/portal/login');

  const { id } = await params;
  const order = await getDiagnosticOrderById(id).catch(() => null);
  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-bold text-slate-700">Order not found.</p>
          <a href="/portal" className="text-primary hover:underline mt-2 inline-block">← Back to dashboard</a>
        </div>
      </div>
    );
  }

  return <OrderDetail order={order} />;
}
