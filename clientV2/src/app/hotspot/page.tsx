"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import Modal, { ModalHeader, ModalBody } from "@/components/ui/Modal";
import { InputField } from "@/components/ui/InputField";
import PlanCard from "@/features/plan/PlanCard";
import { hotspotApi } from "@/lib/api/hotspot";

// -------------------------------------------------------
// Types
// -------------------------------------------------------
interface HotspotSession {
    macAddress:  string;
    ipAddress:   string;
    routerUid:   string;
    identity:    string;
    linkLogin:   string;
    linkOrig:    string;
}

interface FormErrors {
    firstName?: string;
    email?:     string;
    phone?:     string;
}

// -------------------------------------------------------
// Page
// -------------------------------------------------------
export default function HotspotPage() {
    const searchParams = useSearchParams();

    // Capture everything MikroTik gives us
    const session: HotspotSession = {
        macAddress: decodeURIComponent(searchParams.get("mac")        || ""),
        ipAddress:  searchParams.get("ip")                            || "",
        routerUid:  searchParams.get("uid")                           || "",
        identity:   searchParams.get("identity")                      || "",
        linkLogin:  searchParams.get("link-login")                    || "",
        linkOrig:   searchParams.get("link-orig")                     || "",
    };
    console.log(session.ipAddress)

    // Persist session so callback/login pages can access it
    useEffect(() => {
        if (session.macAddress) {
            sessionStorage.setItem("hotspotSession", JSON.stringify(session));
        }
    }, [session.macAddress]);

    // -------------------------------------------------------
    // Returning user check
    // -------------------------------------------------------
    const { data: returningUser, isLoading: checkingUser } = useQuery({
        queryKey: ["hotspot-session", session.macAddress],
        queryFn:  () => hotspotApi.getSessionByMac(session.macAddress),
        enabled:  !!session.macAddress,
        retry:    false,
    });

    const existingAccount    = returningUser?.data?.account;
    const activeSubscription = returningUser?.data?.subscription;

    // -------------------------------------------------------
    // Plans
    // -------------------------------------------------------
    const { data: plansData, isLoading: plansLoading } = useQuery({
        queryKey: ["hotspot-plans"],
        queryFn:  () => hotspotApi.getPlans(),
    });
   
    const plans = plansData?.data?.data || [];
    

    // -------------------------------------------------------
    // State
    // -------------------------------------------------------
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [openCheckout, setOpenCheckout] = useState(false);
    const [firstName,    setFirstName]    = useState("");
    const [email,        setEmail]        = useState("");
    const [phone,        setPhone]        = useState("");
    const [errors,       setErrors]       = useState<FormErrors>({});
    const [loading,      setLoading]      = useState(false);

    // Pre-fill if returning user
    useEffect(() => {
        if (existingAccount) {
            setFirstName(returningUser?.data?.user?.firstName || "");
            setEmail(returningUser?.data?.user?.email         || "");
            setPhone(returningUser?.data?.user?.phone         || "");
        }
    }, [existingAccount]);

    // -------------------------------------------------------
    // Validation
    // -------------------------------------------------------
    const validate = (): boolean => {
        const e: FormErrors = {};
        if (!firstName.trim())              e.firstName = "First name is required";
        if (!email.trim())                  e.email     = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email)) e.email  = "Enter a valid email";
        if (!phone.trim())                  e.phone     = "Phone is required";
        else if (phone.length < 10)         e.phone     = "Enter a valid phone number";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // -------------------------------------------------------
    // Handlers
    // -------------------------------------------------------
    const handleSelectPlan = (plan: any) => {
        setSelectedPlan(plan);
        setOpenCheckout(true);
        setErrors({});
    };

    const handleSubmit = async () => {
        if (!selectedPlan || !validate()) return;

        setLoading(true);
        try {
            const res = await hotspotApi.startPurchase({
                firstName,
                email,
                phone,
                planId:    selectedPlan.id,
                routerUid: session.routerUid,
                identity:  session.identity,
                macAddress: session.macAddress,
                ipAddress:  session.ipAddress,   // ← was missing
            });

            window.location.href =
                res.data.payment.paystack.data.authorization_url;

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // -------------------------------------------------------
    // Loading state
    // -------------------------------------------------------
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

    // -------------------------------------------------------
    // UI
    // -------------------------------------------------------
    return (
        <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">

            {/* HERO */}
            <div className="flex flex-col items-center justify-center pt-10 pb-6 px-4 text-center">
                <Logo size="lg" />

                <h1 className="mt-4 text-2xl font-bold">
                    {existingAccount
                        ? `Welcome back, ${returningUser?.data?.user?.firstName}`
                        : "Connect to High-Speed Internet"}
                </h1>

                <p className="text-sm text-muted-foreground max-w-md mt-2">
                    {activeSubscription
                        ? `Your current plan expires ${new Date(activeSubscription.expiresAt).toLocaleDateString()}. Renew or upgrade below.`
                        : "Choose a plan and get online instantly."}
                </p>

                {/* Friendly device indicator — not raw MAC */}
                {session.macAddress && (
                    <div className="mt-3 px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                        Device recognised
                    </div>
                )}
            </div>

            {/* PLANS */}
            <div className="max-w-5xl mx-auto px-4 pb-16">
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

                {/* Portal login link */}
                <p className="text-center text-xs text-muted-foreground mt-10">
                    Already have an account?{" "}
                    <a href="/auth/login" className="underline text-primary">
                        Sign in to your dashboard
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
                            <span className="font-semibold">{selectedPlan?.name}</span>
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
                            Secured by Paystack • You'll be online immediately after payment
                        </p>
                    </div>
                </ModalBody>
            </Modal>
        </div>
    );
}