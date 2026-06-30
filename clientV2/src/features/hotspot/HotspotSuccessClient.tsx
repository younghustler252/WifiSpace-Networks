"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import Card, { CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { hotspotApi } from "@/lib/api/hotspot";

interface ApiErrorResponse {
    success: boolean;
    code: string;
    message: string;
}

export default function HotspotSuccessClient() {

    
    const params = useSearchParams();
    const router = useRouter();
    const reference = params.get("reference");
    const hasRun = useRef(false);

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [payment, setPayment] = useState<any | null>(null);
    const [autoConnected, setAutoConnected] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    
    const [bypassStatus, setBypassStatus] = useState<"idle" | "success" | "error">("idle");
    const [bypassMessage, setBypassMessage] = useState("");

    const session = typeof window !== "undefined"
        ? JSON.parse(sessionStorage.getItem("hotspotSession") || "{}")
        : {};
    const linkOrig = session?.linkOrig || "https://google.com";

    const { mutate: confirmPayment } = useMutation({
        mutationFn: hotspotApi.confirmPurchase,
        onSuccess: (res) => {
            const data = res?.data;
            setPayment(data?.payment);
            setAutoConnected(data?.autoConnected ?? false);
            
            setStatus("success");
        },
        onError: (error: AxiosError<ApiErrorResponse>) => {
            setErrorMessage(
                error.response?.data?.message ||
                "Unable to verify your payment. Please contact support."
            );
            setStatus("error");
        }
    });

    const { mutate: retryActivation, isPending: isActivating } = useMutation({
        mutationFn: hotspotApi.activateHotspot,
        onSuccess: () => {
            setAutoConnected(true);
            setBypassStatus("success");
            setBypassMessage("Device authenticated on router successfully! You are now online.");
        },
        onError: (error: any) => {
            setBypassStatus("error");
            setBypassMessage(error?.response?.data?.message || "Router activation failed. Please click below to try again.");
        }
    });

    useEffect(() => {
        if (!reference || hasRun.current) return;
        hasRun.current = true;
        confirmPayment({ reference });
    }, [reference]);

    const formatCurrency = (amount?: number) =>
        amount
            ? new Intl.NumberFormat("en-NG", {
                style: "currency",
                currency: "NGN"
              }).format(amount)
            : "₦0";

    const handleManualBypass = () => {
        if (!payment?.accountId) {
            setBypassStatus("error");
            setBypassMessage("Session profile parameters missing. Please refresh the page.");
            return;
        }

        setBypassStatus("idle");
        setBypassMessage("");

        const meta = payment?.metadata || {};
        retryActivation({
            accountId: payment.accountId,
            routerId: meta.routerId,
            macAddress: meta.macAddress || session?.macAddress || "",
            ipAddress: meta.ipAddress || session?.ipAddress || "",
            hostname: meta.userAgent || navigator.userAgent
        });
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <Card className="w-full max-w-md text-center">
                    <CardContent className="space-y-5 py-10">
                        <div className="w-14 h-14 mx-auto rounded-full border-4 border-accent border-t-transparent animate-spin" />
                        <h2 className="text-xl font-semibold">Activating your connection</h2>
                        <p className="text-sm text-muted-foreground">Hang on, we're getting you online...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-4">
                <Card className="w-full max-w-md border-red-500/20 bg-red-500/5">
                    <CardContent className="space-y-6 py-10 text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/15 flex items-center justify-center text-red-600 text-3xl">✕</div>
                        <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
                        <p className="text-sm text-muted-foreground">{errorMessage}</p>
                        <Button className="w-full" onClick={() => { if (!reference) return; setStatus("loading"); confirmPayment({ reference }); }}>Try Again</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <Card className={`w-full max-w-lg transition-all duration-300 shadow-xl ${
                autoConnected 
                    ? "border-green-500/20 bg-green-500/5" 
                    : "border-amber-500/30 bg-amber-500/5"
            }`}>
                <CardContent className="space-y-6 py-10">
                    
                    <div className="flex justify-center">
                        {autoConnected ? (
                            <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center text-green-600 text-3xl animate-bounce">
                                ✓
                            </div>
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-600 text-3xl font-bold animate-pulse">
                                !
                            </div>
                        )}
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className={`text-2xl font-bold ${autoConnected ? "text-green-600" : "text-amber-700"}`}>
                            {autoConnected ? "Payment Confirmed & Online!" : "Payment Verified Safely"}
                        </h2>
                        <p className="text-sm text-muted-foreground px-4">
                            {autoConnected
                                ? "Your device has been authenticated. You're ready to browse."
                                : "Your plan is active, but your phone is not yet authenticated on the router network."}
                        </p>
                    </div>

                    {!autoConnected && (
                        <div className="p-5 rounded-2xl bg-background border border-amber-500/20 shadow-sm text-center space-y-4 mx-2">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                To grant this phone full internet access instantly without restarting your Wi-Fi link, click the activation engine below.
                            </p>
                            
                            <Button className="w-full" variant="accent" onClick={handleManualBypass} isLoading={isActivating}>
                                Activate My Internet Connection
							</Button>
                        </div>
                    )}

                    {bypassStatus !== "idle" && (
                        <div className={`p-4 mx-2 rounded-xl border text-sm text-center font-medium ${
                            bypassStatus === "success" 
                                ? "bg-green-500/10 border-green-500/20 text-green-700" 
                                : "bg-red-500/10 border-red-500/20 text-red-700"
                        }`}>
                            {bypassMessage}
                        </div>
                    )}

                    <div className="rounded-xl border bg-background/80 p-4 space-y-3 text-sm mx-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Plan ID</span>
                            <span className="font-mono font-medium text-xs text-neutral-800 break-all">{payment?.planId.name || "Hotspot"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount paid</span>
                            <span className="font-semibold text-neutral-900">{formatCurrency(payment?.amount?.total)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Network Status</span>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                autoConnected 
                                    ? "bg-green-500/10 text-green-600" 
                                    : "bg-amber-500/10 text-amber-600"
                            }`}>
                                {autoConnected ? "Online" : "Action Required"}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2 px-2">
                        <Button className="w-full" disabled={!autoConnected && isActivating} onClick={() => window.location.href = linkOrig}>
                            {autoConnected ? "Start Browsing" : "Return to Login Portal"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
