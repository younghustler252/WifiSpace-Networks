"use client";

import React from "react";
import { useForm } from "react-hook-form";

import {
	CreditCard,
	Hash,
	Wallet,
	CalendarDays,
	User,
} from "lucide-react";

import Button from "@/components/ui/Button";
import { InputField } from "@/components/ui/InputField";

interface FormValues {
	userId: string;
	accountId?: string;
	wsnId?: string;

	amount: number;
	method: "paystack" | "credit_card" | "bank_transfer";

	status: "pending" | "successful" | "failed" | "expired";

	transactionId?: string;

	paymentDate: string;
}

interface Props {
	onSubmit: (data: any) => void;
	isLoading?: boolean;
}

export default function PaymentForm({
	onSubmit,
	isLoading,
}: Props) {
	const {
		register,
		handleSubmit,
	} = useForm<FormValues>({
		defaultValues: {
			userId: "",
			accountId: "",
			wsnId: "",
			amount: 0,
			method: "bank_transfer",
			status: "successful",
			transactionId: "",
			paymentDate: new Date().toISOString().slice(0, 10),
		},
	});

	const submit = (data: FormValues) => {
		onSubmit({
			...data,
			amount: Number(data.amount),
		});
	};

	return (
		<form onSubmit={handleSubmit(submit)} className="space-y-8 max-w-3xl">

			{/* ================= USER INFO ================= */}
			<section className="ui-card space-y-6">

				<div>
					<h3 className="text-base font-semibold">
						Customer Details
					</h3>
					<p className="text-sm text-muted-foreground">
						Link this payment to a user/account.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">

					<InputField
						label="User ID"
						placeholder="user_123"
						leftIcon={<User className="w-4 h-4 text-muted-foreground" />}
						{...register("userId", { required: true })}
					/>

					<InputField
						label="Account ID"
						placeholder="account_123"
						{...register("accountId")}
					/>

					<InputField
						label="WSN ID"
						placeholder="WSN-XXXX"
						leftIcon={<Hash className="w-4 h-4 text-muted-foreground" />}
						{...register("wsnId")}
					/>

				</div>
			</section>

			{/* ================= PAYMENT INFO ================= */}
			<section className="ui-card space-y-6">

				<div>
					<h3 className="text-base font-semibold">
						Payment Details
					</h3>
					<p className="text-sm text-muted-foreground">
						Set amount, method and status.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">

					<InputField
						label="Amount (₦)"
						type="number"
						leftIcon={<Wallet className="w-4 h-4 text-muted-foreground" />}
						{...register("amount", { required: true })}
					/>

					<SelectField label="Method" {...register("method")}>
						<option value="bank_transfer">Bank Transfer</option>
						<option value="paystack">Paystack</option>
						<option value="credit_card">Credit Card</option>
					</SelectField>

					<SelectField label="Status" {...register("status")}>
						<option value="pending">Pending</option>
						<option value="successful">Successful</option>
						<option value="failed">Failed</option>
						<option value="expired">Expired</option>
					</SelectField>

					<InputField
						label="Transaction ID"
						placeholder="TXN-XXXX"
						leftIcon={<CreditCard className="w-4 h-4 text-muted-foreground" />}
						{...register("transactionId")}
					/>

					<InputField
						label="Payment Date"
						type="date"
						leftIcon={<CalendarDays className="w-4 h-4 text-muted-foreground" />}
						{...register("paymentDate")}
					/>

				</div>

			</section>

			{/* ================= ACTION ================= */}
			<div className="flex justify-end">

				<Button
					type="submit"
					variant="accent"
					size="lg"
					isLoading={isLoading}
					className="min-w-[200px]"
					leftIcon={<CreditCard size={16} />}
				>
					Create Payment
				</Button>

			</div>

		</form>
	);
}

/* ================= SELECT FIELD ================= */

function SelectField({
	label,
	children,
	...props
}: any) {
	return (
		<div className="space-y-2">
			<label className="text-sm font-medium">
				{label}
			</label>

			<select
				className="ui-input"
				{...props}
			>
				{children}
			</select>
		</div>
	);
}