"use client";

import { useEffect, useState } from "react";

import {
	useQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";

import {
	X,
	Calendar,
	Copy,
	ReceiptText,
	RefreshCw,
} from "lucide-react";

import { paymentApi, Payment } from "@/lib/api/payment";

import Button from "@/components/ui/Button";

interface Props {
	paymentId: string | null;
	open: boolean;
	onClose: () => void;
}

export default function PaymentDetailsDrawer({
	paymentId,
	open,
	onClose,
}: Props) {

	const queryClient = useQueryClient();

	const [successMessage, setSuccessMessage] =
		useState<string | null>(null);

	const {
		data,
		isLoading,
	} = useQuery({

		queryKey: ["payment", paymentId],

		queryFn: () =>
			paymentApi.getById(paymentId as string),

		enabled: !!paymentId && open,

		placeholderData: (prev) => prev,

		staleTime: 1000 * 60 * 5,
	});

	const payment: Payment | undefined =
		data?.data;

	// =========================
	// REPROCESS PAYMENT
	// =========================

	const {
		mutate: reprocessPayment,
		isPending: isReprocessing,
		error: reprocessError,
	} = useMutation({

		mutationFn: async () => {
			return paymentApi.reprocess(
				paymentId as string
			);
		},

		onSuccess: async (response) => {

			setSuccessMessage(
				response.message ||
				"Payment processed successfully"
			);

			await queryClient.invalidateQueries({
				queryKey: ["payment", paymentId],
			});

			setTimeout(() => {
				setSuccessMessage(null);
			}, 4000);
		},
	});

	useEffect(() => {

		if (open)
			document.body.style.overflow = "hidden";

		else
			document.body.style.overflow = "";

		return () => {
			document.body.style.overflow = "";
		};

	}, [open]);

	if (!open) return null;

	// FIX: proper plan handling
	const plan = payment?.planId as any;

	// BUSINESS LOGIC
	const needsProcessing =
		payment?.status === "successful" &&
		!payment?.businessProcessed;

	const isProcessed =
		payment?.status === "successful" &&
		payment?.businessProcessed;

	return (
		<div className="fixed inset-0 z-50">

			{/* BACKDROP */}
			<div
				onClick={onClose}
				className="
					absolute inset-0
					bg-black/40
					backdrop-blur-sm
				"
			/>

			{/* PANEL */}
			<div className="
				absolute right-0 top-0
				h-full w-full sm:w-[420px]
				bg-background
				shadow-2xl
				border-l border-border/50
				flex flex-col
			">

				{/* HEADER */}
				<div className="
					flex items-center justify-between
					p-4 border-b border-border/50
				">

					<div>
						<h2 className="font-semibold text-lg">
							Payment Details
						</h2>

						<p className="
							text-xs text-muted-foreground
						">
							Transaction information
						</p>
					</div>

					<button
						onClick={onClose}
						className="
							p-2 rounded-xl
							hover:bg-muted
						"
					>
						<X size={18} />
					</button>

				</div>

				{/* CONTENT */}
				<div className="
					flex-1 overflow-y-auto
					p-4 space-y-4
				">

					{isLoading && (
						<div className="space-y-3">

							<div className="
								h-20 bg-muted
								animate-pulse rounded-2xl
							" />

							<div className="
								h-40 bg-muted
								animate-pulse rounded-2xl
							" />

							<div className="
								h-24 bg-muted
								animate-pulse rounded-2xl
							" />

						</div>
					)}

					{payment && (
						<>

							{/* AMOUNT */}
							<div className="
								rounded-3xl
								border border-border/50
								p-4 bg-primary/5
							">

								<p className="
									text-sm text-muted-foreground
								">
									Amount Paid
								</p>

								<h1 className="
									text-2xl font-bold
								">
									₦{payment.amount?.total?.toLocaleString()}
								</h1>

								<span
									className={`
										inline-flex mt-2
										text-xs px-2 py-1
										rounded-full
										${
											payment.status === "successful"
												? "bg-emerald-100 text-emerald-700"
												: payment.status === "pending"
												? "bg-amber-100 text-amber-700"
												: "bg-red-100 text-red-700"
										}
									`}
								>
									{payment.status}
								</span>

								{needsProcessing && (
									<span className="
										ml-2 text-xs
										px-2 py-1
										rounded-full
										bg-orange-100
										text-orange-700
									">
										Processing Required
									</span>
								)}

								{isProcessed && (
									<span className="
										ml-2 text-xs
										px-2 py-1
										rounded-full
										bg-blue-100
										text-blue-700
									">
										Active
									</span>
								)}

							</div>

							{/* INFO */}
							<div className="
								rounded-3xl
								border border-border/50
								p-4 space-y-3
							">

								<Item
									label="Plan"
									value={plan?.name || "—"}
								/>

								<Item
									label="Speed"
									value={plan?.speedRate || "—"}
								/>

								<Item
									label="Cycles"
									value={payment.cycles}
								/>

								<Item
									label="Reference"
									value={
										payment.gatewayReference || "—"
									}
								/>

								<div className="
									flex items-center
									justify-between text-sm
								">

									<span className="
										text-muted-foreground
									">
										Date
									</span>

									<span className="
										flex items-center gap-1
									">
										<Calendar size={14} />

										{new Date(
											payment.paymentDate
										).toLocaleString()}
									</span>

								</div>

							</div>

							{/* TIMELINE */}
							<div className="
								rounded-3xl
								border border-border/50
								p-4 space-y-2
							">

								<p className="
									font-medium text-sm
								">
									Transaction Status
								</p>

								<div className="
									text-xs text-muted-foreground
									space-y-2
								">

									<div>
										✔ Payment received
									</div>

									<div>
										{payment.businessProcessed
											? "✔ Subscription active"
											: "⏳ Awaiting system sync"}
									</div>

								</div>

							</div>

							{/* SUCCESS MESSAGE */}
							{successMessage && (
								<div className="
									text-sm
									text-emerald-700
									bg-emerald-50
									border border-emerald-200
									rounded-2xl
									p-3
								">
									{successMessage}
								</div>
							)}

							{/* ERROR MESSAGE */}
							{reprocessError && (
								<div className="
									text-sm
									text-red-600
									bg-red-50
									border border-red-200
									rounded-2xl
									p-3
								">

									{
										(reprocessError as any)
											?.response
											?.data
											?.message ||

										(reprocessError as any)
											?.message ||

										"Failed to process payment"
									}

								</div>
							)}

							{/* ACTIONS */}
							<div className="space-y-2">

								{/* ONLY SHOW IF NOT PROCESSED */}
								{needsProcessing && (
									<Button
										fullWidth
										isLoading={isReprocessing}
										onClick={() =>
											reprocessPayment()
										}
										leftIcon={
											<RefreshCw
												size={16}
												className={
													isReprocessing
														? "animate-spin"
														: ""
												}
											/>
										}
									>
										Sync Payment / Process
									</Button>
								)}

								<Button
									fullWidth
									variant="outline"
									leftIcon={
										<ReceiptText size={16} />
									}
								>
									Download Receipt
								</Button>

								<Button
									fullWidth
									variant="outline"
									className="
										text-muted-foreground
									"
									leftIcon={
										<Copy size={16} />
									}
								>
									Copy Reference
								</Button>

							</div>

						</>
					)}
				</div>
			</div>
		</div>
	);
}

/* =========================
   ROW
========================= */

function Item({
	label,
	value,
}: {
	label: string;
	value: any;
}) {

	return (
		<div className="
			flex items-center
			justify-between text-sm
		">

			<span className="
				text-muted-foreground
			">
				{label}
			</span>

			<span className="
				font-medium text-right
				max-w-[60%] truncate
			">
				{String(value)}
			</span>

		</div>
	);
}