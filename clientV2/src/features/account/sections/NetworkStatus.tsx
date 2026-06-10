"use client";

import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

import {
    Wifi,
    RefreshCcw,
    AlertCircle,
    CheckCircle,
    Clock3
} from "lucide-react";

type Props = {
    account: any;
    role?: "customer" | "staff" | "superAdmin";
    onRetry?: (accountId: string) => void;
    retrying?: boolean;
};

const NetworkStatus = ({
    account,
    role = "customer",
    onRetry,
    retrying = false
}: Props) => {

    if (!account) return null;

    const provision = account.routerProvision || {};
    const status = provision.status || "pending";

    const canRetry =
        role !== "customer" &&
        onRetry &&
        (status === "failed" || status === "pending");

    const statusMap: Record<string, any> = {
        pending: {
            label: "Not Provisioned",
            color: "text-yellow-600",
            bg: "bg-yellow-500/10",
            icon: <RefreshCcw size={16} />
        },
        synced: {
            label: "Active on Router",
            color: "text-green-600",
            bg: "bg-green-500/10",
            icon: <CheckCircle size={16} />
        },
        failed: {
            label: "Provision Failed",
            color: "text-red-600",
            bg: "bg-red-500/10",
            icon: <AlertCircle size={16} />
        }
    };

    const current = statusMap[status] || statusMap.pending;

    return (
        <Card>

            <CardHeader>
                <div className="flex items-center gap-2">
                    <Wifi size={18} className="text-success" />
                    Router Provisioning
                </div>
            </CardHeader>

            <CardContent className="space-y-4">

                {/* STATUS */}
                <div className="rounded-lg border border-border bg-muted/30 p-4 flex items-center justify-between">

                    <div className="flex items-center gap-3">

                        <div className={`p-2 rounded-full ${current.bg}`}>
                            {current.icon}
                        </div>

                        <div>
                            <p className={`text-sm font-medium ${current.color}`}>
                                {current.label}
                            </p>

                            <p className="text-xs text-muted-foreground mt-1">
                                MikroTik synchronization status
                            </p>
                        </div>

                    </div>

                    {canRetry && (
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={retrying}
                            onClick={() => onRetry?.(account.id)}
                        >
                            {retrying ? "Processing..." : "Retry"}
                        </Button>
                    )}

                </div>

                {/* ERROR */}
                {provision.lastError && (
                    <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                        <p className="text-xs font-medium text-red-500">
                            Last Error
                        </p>

                        <p className="text-xs text-red-400 mt-1 break-words">
                            {provision.lastError}
                        </p>
                    </div>
                )}

                {/* LAST ATTEMPT ONLY (useful info) */}
                <div className="rounded-lg border border-border p-3 flex items-center justify-between">

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock3 size={14} />
                        Last Sync Attempt
                    </div>

                    <p className="text-xs font-medium">
                        {provision.lastAttemptAt
                            ? new Date(provision.lastAttemptAt).toLocaleString()
                            : "Never"}
                    </p>

                </div>

            </CardContent>
        </Card>
    );
};

export default NetworkStatus;