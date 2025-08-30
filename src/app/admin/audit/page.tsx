
"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLogs, AuditLog } from "@/services/auditLogService";
import { cn } from "@/lib/utils";

const actionColors: { [key: string]: string } = {
    CREATE: "bg-green-600",
    UPDATE: "bg-blue-500",
    DELETE: "bg-red-600",
};

const entityColors: { [key: string]: string } = {
    PRODUCT: "bg-sky-200 text-sky-800",
    CATEGORY: "bg-fuchsia-200 text-fuchsia-800",
    ORDER: "bg-amber-200 text-amber-800",
    COUPON: "bg-emerald-200 text-emerald-800",
};

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      const fetchedLogs = await getLogs();
      setLogs(fetchedLogs);
      setLoading(false);
    };

    fetchLogs();
  }, []);

  if (loading) {
    return <div>Loading audit logs...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
        <CardDescription>
          Review a chronological log of all administrative actions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Entity ID</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
                <TableCell>{log.userName}</TableCell>
                <TableCell>
                  <Badge className={cn("text-white", actionColors[log.action])}>
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(entityColors[log.entityType])}>
                    {log.entityType}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{log.entityId.substring(0,10)}...</TableCell>
                <TableCell>{log.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
