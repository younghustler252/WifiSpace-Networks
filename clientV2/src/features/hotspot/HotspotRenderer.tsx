"use client";

import { HotspotNewUserScreen } from "@/features/hotspot/components/NewUserScreen";
import { HotspotPlanSelector } from "@/features/hotspot/components/PlanSelector";
import { HotspotPaymentProcessing } from "@/features/hotspot/components/PaymentProcessing";
import { HotspotSuccessScreen } from "@/features/hotspot/components/SuccessScreen";
import { HotspotErrorScreen } from "@/features/hotspot/components/ErrorScreen";
import { HotspotIdentityScreen } from "@/features/hotspot/components/IdentityScreen";

import Logo from "@/components/ui/Logo";
import { CenterLoader } from "@/components/ui/Loader";


export type HotspotUIState =
    | "LOADING"
    | "REGISTER_USER"
    | "IDENTITY_LOOKUP"
    | "SELECT_PLAN"
    | "PAYMENT_PROCESSING"
    | "SUCCESS"
    | "ERROR";



interface Props {

    state: HotspotUIState;

    session:any;

    plans:any[];

    paymentResult:any;

    error:string;

    actions:any;

}



export function HotspotRenderer({
    state,
    session,
    plans,
    paymentResult,
    error,
    actions,

}:Props) {


    const account =
        session?.accounts?.[0]?.account;



    return (

        <main
            className="
                min-h-screen
                bg-background
                px-4
                py-8
                flex
                flex-col
                items-center
            "
        >


            <header
                className="
                    flex
                    flex-col
                    items-center
                    text-center
                    mb-8
                "
            >

                <Logo size="lg"/>


                <p
                    className="
                        mt-3
                        text-sm
                        text-muted-foreground
                    "
                >
                    Fast and reliable internet access
                </p>

            </header>





            <section
                className="
                    w-full
                    max-w-4xl
                "
            >



                {state === "LOADING" && (

                    <CenterLoader
                        label="Connecting to hotspot..."
                    />

                )}






                {state === "IDENTITY_LOOKUP" && (

                    <HotspotIdentityScreen

                        loading={false}

                        error={error}

                        onLookup={
                            actions.lookupAccount
                        }

                    />

                )}






                {state === "REGISTER_USER" && (

                    <div>


                        <div
                            className="
                                text-center
                                mb-6
                            "
                        >

                            <h1
                                className="
                                    text-2xl
                                    font-bold
                                "
                            >
                                Welcome 👋
                            </h1>


                            <p
                                className="
                                    text-muted-foreground
                                "
                            >
                                Enter your details to continue.
                                Your hotspot will activate after payment.
                            </p>


                        </div>



                        <HotspotNewUserScreen

                            onSubmit={
                                actions.registerUser
                            }

                        />

                    </div>

                )}







                {state === "SELECT_PLAN" && (

                    <div>


                        <div
                            className="
                                text-center
                                mb-8
                            "
                        >



                            {session?.hasHotspotAccount ? (

                                <>

                                    <h1
                                        className="
                                            text-2xl
                                            font-bold
                                        "
                                    >

                                        Welcome back{" "}
                                        {session.user.firstName} 👋

                                    </h1>



                                    <p
                                        className="
                                            text-muted-foreground
                                        "
                                    >
                                        Your hotspot account was found.
                                        Select a plan to continue.
                                    </p>



                                    {account?.wsnId && (

                                        <div
                                            className="
                                                mt-4
                                                inline-flex
                                                rounded-full
                                                bg-primary/10
                                                px-4
                                                py-2
                                                text-sm
                                                text-primary
                                                font-medium
                                            "
                                        >

                                            Account:
                                            <span className="ml-2">
                                                {account.wsnId}
                                            </span>

                                        </div>

                                    )}

                                </>


                            ) : (

                                <>


                                    <h1
                                        className="
                                            text-2xl
                                            font-bold
                                        "
                                    >
                                        Choose your internet plan
                                    </h1>


                                    <p
                                        className="
                                            text-muted-foreground
                                        "
                                    >
                                        Select a package to get connected.
                                    </p>


                                    <button
                                        onClick={
                                            actions.showIdentity
                                        }
                                        className="
                                            mt-4
                                            text-sm
                                            text-primary
                                            underline
                                        "
                                    >
                                        Already have an account?
                                    </button>


                                </>

                            )}

                        </div>






                        <HotspotPlanSelector

                            plans={
                                plans ?? []
                            }

                            onSelect={
                                actions.selectPlan
                            }

                        />


                    </div>

                )}









                {state === "PAYMENT_PROCESSING" && (

                    <HotspotPaymentProcessing />

                )}







                {state === "SUCCESS" && (

                    <HotspotSuccessScreen

                        payment={
                            paymentResult?.payment
                        }

                        autoConnected={
                            paymentResult?.autoConnected
                        }

                        onBrowse={
                            actions.browse
                        }

                        onDashboard={
                            actions.dashboard
                        }

                    />

                )}







                {state === "ERROR" && (

                    <HotspotErrorScreen

                        message={
                            error
                        }

                        onRetry={
                            actions.retry
                        }

                    />

                )}



            </section>





            <footer
                className="
                    mt-10
                    text-xs
                    text-muted-foreground
                "
            >

                Powered by Wifispace Networks

            </footer>


        </main>

    );

}