"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import Card, { CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { hotspotApi } from "@/lib/api/hotspot";
import type { Payment } from "@/lib/api/payment";

interface ApiErrorResponse {
    success: boolean;
    code: string;
    message: string;
}

export default function HotspotSuccessPage() {
    const params   = useSearchParams();
    const router   = useRouter();
    const reference = params.get("reference");
    const hasRun   = useRef(false);

    const [status,       setStatus]       = useState<"loading" | "success" | "error">("loading");
    const [payment,      setPayment]      = useState<Payment | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    const { mutate: confirmPayment } = useMutation({
        mutationFn: hotspotApi.confirmPurchase,

        onSuccess: (res) => {
            const { payment, autoConnected } = res?.data;

            setPayment(payment);

            if (!autoConnected) {
                // HTTP login failed on backend — send to MikroTik login page
                const session = JSON.parse(
                    sessionStorage.getItem("hotspotSession") || "{}"
                );
                router.replace(
                    `/hotspot/login?reference=${reference}&linkLogin=${encodeURIComponent(session.linkLogin || "")}`
                );
                return;
            }

            setStatus("success");
        },

        onError: (error: AxiosError<ApiErrorResponse>) => {
            setErrorMessage(
                error.response?.data?.message ||
                "Unable to verify hotspot connection."
            );
            setStatus("error");
        }
    });

    useEffect(() => {
        if (!reference || hasRun.current) return;
        hasRun.current = true;
        confirmPayment({ reference });
    }, [reference]);

    const formatCurrency = (amount?: number) =>
        amount
            ? new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount)
            : "₦0";

    // Get linkOrig for "start browsing" redirect
    const session  = typeof window !== "undefined"
        ? JSON.parse(sessionStorage.getItem("hotspotSession") || "{}")
        : {};
    const linkOrig = session?.linkOrig || "https://google.com";

    // ── Loading ──────────────────────────────────────────
    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="space-y-5 py-10">
                        <div className="w-14 h-14 mx-auto rounded-full border-4 border-accent border-t-transparent animate-spin" />
                        <h2 className="text-xl font-semibold">Activating your connection</h2>
                        <p className="text-sm text-muted-foreground">
                            Hang on, we're getting you online...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────
    if (status === "error") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <Card className="w-full max-w-md border-red-500/20 bg-red-500/5">
                    <CardContent className="space-y-6 py-10 text-center">
                        <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center text-red-600 text-3xl">
                            ✕
                        </div>
                        <h2 className="text-2xl font-bold text-red-600">Connection Failed</h2>
                        <p className="text-sm text-muted-foreground">{errorMessage}</p>
                        <Button className="w-full" onClick={() => {
                            if (!reference) return;
                            setStatus("loading");
                            confirmPayment({ reference });
                        }}>
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ── Success ───────────────────────────────────────────
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className="w-full max-w-lg border-green-500/20 bg-green-500/5 shadow-xl">
                <CardContent className="space-y-6 py-10">

                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center text-green-600 text-3xl">
                            ✓
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-green-600">You're Connected!</h2>
                        <p className="text-sm text-muted-foreground">
                            Your device is online and ready to browse.
                        </p>
                    </div>

                    <div className="rounded-xl border bg-background/80 p-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Plan</span>
                            <span className="font-medium">
                                {payment?.planId?.name || "Hotspot Plan"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount paid</span>
                            <span className="font-semibold">
                                {formatCurrency(payment?.amount?.total)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <span className="inline-flex px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                                Online
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            className="w-full"
                            onClick={() => window.location.href = linkOrig}
                        >
                            Start Browsing
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full"
                            onClick={() => router.push("/auth/login")}
                        >
                            My Dashboard
                        </Button>
                    </div>

                    <p className="text-center text-xs text-muted-foreground">
                        Your session is active. Enjoy browsing.
                    </p>

                </CardContent>
            </Card>
        </div>
    );
}