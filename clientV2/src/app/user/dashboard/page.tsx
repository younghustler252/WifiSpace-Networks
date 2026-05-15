

"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";



export default function Dashboard() {
    const { user } = useAuth();

    // console.log(user)

    return (
        <div>
            <PageHeader title="Dashboard" subtitle={`Hello, ${user?.firstName}!`} />
        </div>
    );
}