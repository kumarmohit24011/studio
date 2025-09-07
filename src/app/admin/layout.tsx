
import { AdminShell } from './_components/admin-shell';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark">
        <AdminShell>
            {children}
        </AdminShell>
    </div>
  );
}
