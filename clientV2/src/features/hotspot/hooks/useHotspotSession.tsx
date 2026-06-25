"use client";

import { useEffect, useState } from "react";

import {
    hotspotApi,
    HotspotPlan,
    HotspotSession,
} from "@/lib/api/hotspot";


declare global {
    interface Window {
        PaystackPop: any;
    }
}



type State =
    | "LOADING"
    | "SELECT_PLAN"
    | "IDENTITY_LOOKUP"
    | "REGISTER_USER"
    | "PAYMENT_PROCESSING"
    | "SUCCESS"
    | "ERROR";




export function useHotspotSession(
    macAddress?: string,
    email?: string,
    ipAddress?: string
) {


    const [state,setState] =
        useState<State>("LOADING");


    const [session,setSession] =
        useState<HotspotSession | null>(null);


    const [plans,setPlans] =
        useState<HotspotPlan[]>([]);


    const [selectedPlan,setSelectedPlan] =
        useState<HotspotPlan | null>(null);


    const [paymentResult,setPaymentResult] =
        useState<any>(null);


    const [error,setError] =
        useState("");




    // ==========================
    // LOAD SESSION
    // ==========================

    const loadSession = async()=>{

        try{

            setState("LOADING");
            setError("");



            const sessionRes =
                await hotspotApi.getSession({
                    macAddress,
                    email
                });



            const session =
                sessionRes.data;



            setSession(
                session
            );




            const plansRes =
                await hotspotApi.getPlans();



            setPlans(
                plansRes.data.data
            );



            // IMPORTANT:
            // Always show plans first

            setState(
                "SELECT_PLAN"
            );


        }
        catch(err:any){

            setState(
                "ERROR"
            );


            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed loading hotspot"
            );

        }

    };






    // ==========================
    // EMAIL ACCOUNT LOOKUP
    // ==========================


    const lookupAccount =
        async(userEmail:string)=>{


        try{

            setState(
                "LOADING"
            );


            const res =
                await hotspotApi.getSession({
                    email:userEmail
                });



            const foundSession =
                res.data;



            setSession(
                foundSession
            );



            if(
                foundSession.hasHotspotAccount
            ){

                setState(
                    "SELECT_PLAN"
                );

                return;
            }




            setError(
                "No hotspot account found. Continue as new user."
            );


            setState(
                "SELECT_PLAN"
            );



        }
        catch(err:any){


            setState(
                "IDENTITY_LOOKUP"
            );


            setError(
                err?.response?.data?.message ||
                "Account lookup failed"
            );

        }

    };







    // ==========================
    // START PAYMENT
    // ==========================


    const startPayment = async(
        customer:{
            firstName:string;
            email:string;
            phone:string;
        },
        plan:HotspotPlan
    )=>{


        try{


            setState(
                "PAYMENT_PROCESSING"
            );



            const res =
                await hotspotApi.startPurchase({

                    firstName:
                        customer.firstName,


                    email:
                        customer.email,


                    phone:
                        customer.phone,


                    planId:
                        plan.id,


                    macAddress:
                        macAddress || "",


                    ipAddress: ipAddress || "",


                    userAgent:
                        navigator.userAgent

                });





            const paystack =
                res.data.payment.paystack;




            const url =
                paystack.data.authorization_url;




            if(!url){

                throw new Error(
                    "Paystack URL missing"
                );
            }





            window.location.href =
                url;



        }
        catch(err:any){


            setState(
                "ERROR"
            );


            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Payment failed"
            );


        }

    };








    // ==========================
    // CONFIRM PAYMENT
    // ==========================


    const confirmPayment =
        async(reference:string)=>{


        try{


            const res =
                await hotspotApi.confirmPurchase({
                    reference
                });



            setPaymentResult(
                res.data
            );



            setState(
                "SUCCESS"
            );


        }
        catch(err:any){


            setState(
                "ERROR"
            );


            setError(
                err?.response?.data?.message ||
                "Payment confirmation failed"
            );


        }

    };









    // ==========================
    // ACTIONS
    // ==========================


    const actions = {



        selectPlan:
        async(plan:HotspotPlan)=>{


            setSelectedPlan(
                plan
            );



            // Existing hotspot customer

            if(
                session?.user
            ){

                await startPayment(
                    {
                        firstName:
                            session.user.firstName,

                        email:
                            session.user.email,

                        phone:
                            session.user.phone
                    },

                    plan
                );


                return;

            }





            // New customer

            setState(
                "REGISTER_USER"
            );

        },







        registerUser:
        async(form:any)=>{


            if(!selectedPlan){

                throw new Error(
                    "Select plan first"
                );

            }



            await startPayment(
                form,
                selectedPlan
            );

        },






        lookupAccount,





        showIdentity:()=>{

            setState(
                "IDENTITY_LOOKUP"
            );

        },





        retry:
            loadSession,





        browse:()=>{

            window.location.href="/";

        },





        dashboard:()=>{

            window.location.href="/dashboard";

        }

    };






    useEffect(()=>{

        loadSession();

    },[]);







    return {

        state,

        error,

        session,

        plans,

        selectedPlan,

        paymentResult,


        actions,


        reload:
            loadSession,


        confirmPayment

    };

}