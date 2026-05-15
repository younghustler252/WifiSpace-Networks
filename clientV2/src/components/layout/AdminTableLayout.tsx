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

	loading,
	fetching,
	isEmpty,
	emptyText = "No data found",

	table,
	mobile,

	page,
	totalPages,
	limit,
	onPageChange,
	onLimitChange,
}: AdminTableLayoutProps) {
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
						loading={fetching && !loading}
					/>

					{/* 📱 Mobile */}
					<div className="md:hidden">
						{loading ? (
							<CenterLoader label="Loading..." />
						) : isEmpty ? (
							<p className="text-center text-muted-foreground">
								{emptyText}
							</p>
						) : (
							mobile
						)}
					</div>

					{/* 🖥 Desktop */}
					<div className="hidden md:block ui-card p-0 overflow-hidden">
						{loading ? (
							<div className="py-10">
								<CenterLoader label="Loading..." />
							</div>
						) : isEmpty ? (
							<p className="text-center py-10 text-muted-foreground">
								{emptyText}
							</p>
						) : (
							table
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