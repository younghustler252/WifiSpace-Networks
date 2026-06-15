"use client";

import { useState, useEffect } from "react";
import { useQuery }            from "@tanstack/react-query";
import { useSearchParams }     from "next/navigation";

import Logo                        from "@/components/ui/Logo";
import Button                      from "@/components/ui/Button";
import Modal, { ModalHeader, ModalBody } from "@/components/ui/Modal";
import { InputField }              from "@/components/ui/InputField";
import PlanCard                    from "@/features/plan/PlanCard";
import { hotspotApi }              from "@/lib/api/hotspot";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface HotspotSession {
    macAddress: string;
    ipAddress:  string;
    routerUid:  string;
    identity:   string;
    linkLogin:  string;
    linkOrig:   string;
}

interface FormErrors {
    firstName?: string;
    email?:     string;
    phone?:     string;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function HotspotClient() {
    const searchParams = useSearchParams();

    const session: HotspotSession = {
        macAddress: decodeURIComponent(searchParams.get("mac")       || ""),
        ipAddress:  searchParams.get("ip")                           || "",
        routerUid:  searchParams.get("uid")                          || "",
        identity:   searchParams.get("identity")                     || "",
        linkLogin:  searchParams.get("link-login")                   || "",
        linkOrig:   searchParams.get("link-orig")                    || "",
    };

    // Persist for callback/success pages
    useEffect(() => {
        if (session.macAddress) {
            sessionStorage.setItem("hotspotSession", JSON.stringify(session));
        }
    }, [session.macAddress]);

    // ── Returning user by MAC ──────────────────
    const {
        data:      returningData,
        isLoading: checkingMac
    } = useQuery({
        queryKey: ["hotspot-session", session.macAddress],
        queryFn:  () => hotspotApi.getSessionByMac(session.macAddress),
        enabled:  !!session.macAddress,
        retry:    false,
    });

    const existingAccount    = returningData?.data?.account;
    const activeSubscription = returningData?.data?.subscription;
    const returningUser      = returningData?.data?.user;

    // ── Plans ──────────────────────────────────
    const { data: plansData, isLoading: plansLoading } = useQuery({
        queryKey: ["hotspot-plans"],
        queryFn:  () => hotspotApi.getPlans(),
    });

    const plans = plansData?.data?.data || [];

    // ── Form state ─────────────────────────────
    const [selectedPlan,   setSelectedPlan]   = useState<any>(null);
    const [openCheckout,   setOpenCheckout]   = useState(false);
    const [firstName,      setFirstName]      = useState("");
    const [email,          setEmail]          = useState("");
    const [phone,          setPhone]          = useState("");
    const [errors,         setErrors]         = useState<FormErrors>({});
    const [loading,        setLoading]        = useState(false);
    const [submitError,    setSubmitError]    = useState("");

    // ── MAC-change flow ────────────────────────
    const [showMacChange,  setShowMacChange]  = useState(false);
    const [lookupEmail,    setLookupEmail]    = useState("");
    const [lookupLoading,  setLookupLoading]  = useState(false);
    const [lookupError,    setLookupError]    = useState("");

    // Pre-fill returning user
    useEffect(() => {
        if (returningUser) {
            setFirstName(returningUser.firstName || "");
            setEmail(returningUser.email         || "");
            setPhone(returningUser.phone         || "");
        }
    }, [returningUser]);

    // ── Validation ─────────────────────────────
    const validate = (): boolean => {
        const e: FormErrors = {};
        if (!firstName.trim())                 e.firstName = "First name is required";
        if (!email.trim())                     e.email     = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email)) e.email     = "Enter a valid email";
        if (!phone.trim())                     e.phone     = "Phone is required";
        else if (phone.replace(/\D/g, "").length < 10) e.phone = "Enter a valid phone number";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── Handlers ───────────────────────────────
    const handleSelectPlan = (plan: any) => {
        setSelectedPlan(plan);
        setOpenCheckout(true);
        setErrors({});
        setSubmitError("");
    };

    const handleSubmit = async () => {
        if (!selectedPlan || !validate()) return;

        setLoading(true);
        setSubmitError("");

        try {
            const res = await hotspotApi.startPurchase({
                firstName,
                email,
                phone,
                planId:     selectedPlan.id,
                routerUid:  session.routerUid,
                identity:   session.identity,
                macAddress: session.macAddress,
                ipAddress:  session.ipAddress,
            });

            window.location.href =
                res.data.payment.paystack.data.authorization_url;

        } catch (err: any) {
            setSubmitError(
                err?.response?.data?.message || "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // MAC changed — look up by email then reactivate
    const handleEmailLookup = async () => {
        if (!lookupEmail.trim()) {
            setLookupError("Enter your email");
            return;
        }

        setLookupLoading(true);
        setLookupError("");

        try {
            const res = await hotspotApi.getSessionByMac(
                session.macAddress,
                lookupEmail
            );

            const found = res?.data;

            if (!found?.account) {
                setLookupError("No account found for this email");
                return;
            }

            // Pre-fill and close MAC-change panel
            setFirstName(found.user?.firstName || "");
            setEmail(found.user?.email         || "");
            setPhone(found.user?.phone         || "");
            setShowMacChange(false);

        } catch {
            setLookupError("Could not find account. Please try again.");
        } finally {
            setLookupLoading(false);
        }
    };

    // ── Loading ────────────────────────────────
    if (plansLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-3">
                <Logo size="lg" />
                <p className="text-sm text-muted-foreground animate-pulse">
                    Getting things ready...
                </p>
            </div>
        );
    }

    // ── UI ─────────────────────────────────────
    return (
        <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">

            {/* HERO */}
            <div className="flex flex-col items-center justify-center pt-10 pb-6 px-4 text-center">
                <Logo size="lg" />

                <h1 className="mt-4 text-2xl font-bold">
                    {checkingMac
                        ? "Connect to High-Speed Internet"
                        : existingAccount
                            ? `Welcome back, ${returningUser?.firstName}`
                            : "Connect to High-Speed Internet"}
                </h1>

                <p className="text-sm text-muted-foreground max-w-md mt-2">
                    {activeSubscription
                        ? `Current plan expires ${new Date(activeSubscription.expiresAt).toLocaleDateString()}. Renew or upgrade below.`
                        : "Choose a plan and get online instantly."}
                </p>

                {session.macAddress && (
                    <div className="mt-3 px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                        Device recognised
                    </div>
                )}
            </div>

            {/* MAC CHANGE BANNER */}
            {!checkingMac && !existingAccount && session.macAddress && (
                <div className="max-w-5xl mx-auto px-4 mb-6">
                    {!showMacChange ? (
                        <div className="p-3 rounded-xl bg-muted text-sm flex items-center justify-between gap-3">
                            <p className="text-muted-foreground">
                                Bought a plan before? Your device may have a new MAC address.
                            </p>
                            <button
                                onClick={() => setShowMacChange(true)}
                                className="text-primary underline text-xs whitespace-nowrap"
                            >
                                Reconnect
                            </button>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl border bg-background space-y-3">
                            <p className="text-sm font-medium">
                                Enter your email to reconnect
                            </p>
                            <InputField
                                label="Email"
                                type="email"
                                value={lookupEmail}
                                onChange={(e) => setLookupEmail(e.target.value)}
                                errorMessage={lookupError}
                            />
                            <div className="flex gap-2">
                                <Button
                                    fullWidth
                                    disabled={lookupLoading}
                                    onClick={handleEmailLookup}
                                >
                                    {lookupLoading ? "Looking up..." : "Find my account"}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setShowMacChange(false);
                                        setLookupError("");
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* PLANS */}
            <div className="max-w-5xl mx-auto px-4 pb-16">
                {plans.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground text-sm">
                        No plans available right now. Please try again later.
                    </div>
                ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {plans.map((plan: any) => (
                            <div key={plan.id} className="transition hover:scale-[1.02]">
                                <PlanCard
                                    plan={plan}
                                    onSelect={() => handleSelectPlan(plan)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-center text-xs text-muted-foreground mt-10">
                    Already have a dashboard account?{" "}
                    <a href="/auth/login" className="underline text-primary">
                        Sign in
                    </a>
                </p>
            </div>

            {/* CHECKOUT MODAL */}
            <Modal
                open={openCheckout}
                onClose={() => setOpenCheckout(false)}
                size="md"
            >
                <ModalHeader>Complete your purchase</ModalHeader>

                <ModalBody>
                    <div className="space-y-4">

                        {/* Plan summary */}
                        <div className="p-3 rounded-xl bg-muted text-sm flex justify-between items-center">
                            <span className="font-medium">{selectedPlan?.name}</span>
                            <span className="text-primary font-bold">
                                ₦{selectedPlan?.price?.toLocaleString()}
                            </span>
                        </div>

                        <InputField
                            label="First name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            errorMessage={errors.firstName}
                        />

                        <InputField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            errorMessage={errors.email}
                        />

                        <InputField
                            label="Phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            errorMessage={errors.phone}
                        />

                        {/* Submit error */}
                        {submitError && (
                            <p className="text-xs text-red-500 text-center">
                                {submitError}
                            </p>
                        )}

                        <Button
                            fullWidth
                            disabled={loading}
                            onClick={handleSubmit}
                        >
                            {loading
                                ? "Redirecting to payment..."
                                : `Pay ₦${selectedPlan?.price?.toLocaleString()}`}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            Secured by Paystack • You'll be connected after payment
                        </p>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    );
}