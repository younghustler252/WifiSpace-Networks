"use client";

import React from "react";
import PageHeader from "../ui/PageHeader";
import TableToolbar from "../ui/TableToolbar";
import Pagination from "../ui/Pagination";
import { CenterLoader } from "../ui/Loader";

interface AdminTableLayoutProps {
	title: string;

	primary?: React.ReactNode;
	secondary?: React.ReactNode;
	actions?: React.ReactNode;

	loading?: boolean;
	fetching?: boolean;
	isEmpty?: boolean;
	emptyText?: string;

	table: React.ReactNode;
	mobile: React.ReactNode;

	page: number;
	totalPages: number;
	limit: number;
	onPageChange: (p: number) => void;
	onLimitChange: (l: number) => void;
}

export default function AdminTableLayout({
	title,

	primary,
	secondary,
	actions,

	loading = false,
	fetching = false,
	isEmpty = false,
	emptyText = "No data found",

	table,
	mobile,

	page,
	totalPages,
	limit,
	onPageChange,
	onLimitChange,
}: AdminTableLayoutProps) {
	const isFirstLoad = loading && !fetching;

	return (
		<>
			<PageHeader title={title} />

			<main className="p-6">
				<div className="max-w-6xl mx-auto ui-stack-lg">

					{/* 🔥 Toolbar */}
					<TableToolbar
						primary={primary}
						secondary={secondary}
						right={actions}
						loading={fetching}
					/>

					{/* 📱 Mobile */}
					<div className="md:hidden">
						{isFirstLoad ? (
							<CenterLoader label="Loading..." />
						) : isEmpty ? (
							<p className="text-center text-muted-foreground">
								{emptyText}
							</p>
						) : (
							<div
								className={`transition-opacity duration-200 ${
									fetching
										? "opacity-60"
										: "opacity-100"
								}`}
							>
								{mobile}
							</div>
						)}
					</div>

					{/* 🖥 Desktop */}
					<div className="hidden md:block ui-card p-0 overflow-hidden relative">
						{isFirstLoad ? (
							<div className="py-10">
								<CenterLoader label="Loading..." />
							</div>
						) : isEmpty ? (
							<p className="text-center py-10 text-muted-foreground">
								{emptyText}
							</p>
						) : (
							<div
								className={`transition-opacity duration-200 ${
									fetching
										? "opacity-60"
										: "opacity-100"
								}`}
							>
								{table}
							</div>
						)}

						{/* 🔵 optional fetching indicator */}
						{fetching && (
							<div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse" />
						)}
					</div>

					{/* 📄 Pagination */}
					<Pagination
						page={page}
						totalPages={totalPages}
						limit={limit}
						onPageChange={onPageChange}
						onLimitChange={(l) => {
							onLimitChange(l);
							onPageChange(1);
						}}
					/>

				</div>
			</main>
		</>
	);
}