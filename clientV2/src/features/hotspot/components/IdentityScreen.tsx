"use client";

import { useState } from "react";
import { InputField } from "@/components/ui/InputField";
import Button from "@/components/ui/Button";
import { Mail } from "lucide-react";

interface Props {
    onLookup: (email: string) => void;
    loading?: boolean;
    error?: string;
}


export function HotspotIdentityScreen({
    onLookup,
    loading,
    error,
}: Props) {

    const [email, setEmail] = useState("");


    return (
        <div
            className="
                rounded-xl
                border
                bg-card
                p-6
                space-y-5
            "
        >

            <div className="text-center">

                <h2
                    className="
                        text-xl
                        font-bold
                    "
                >
                    Already have an account?
                </h2>


                <p
                    className="
                        text-sm
                        text-muted-foreground
                        mt-2
                    "
                >
                    Enter your email to find your hotspot account.
                </p>

            </div>


            <InputField
                label="Email address"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                    setEmail(e.target.value)
                }
                leftIcon={
                    <Mail size={16}/>
                }
            />


            {error && (
                <p className="text-sm text-danger">
                    {error}
                </p>
            )}


            <Button
                className="w-full"
                disabled={!email || loading}
                onClick={() =>
                    onLookup(email)
                }
            >
                {loading
                    ? "Checking..."
                    : "Find Account"
                }
            </Button>

        </div>
    );
}