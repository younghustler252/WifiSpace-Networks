"use client";

import React from "react";
import { cn } from "@/lib/cn";

/* ================================
TABLE WRAPPER
================================ */
export function Table({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={cn(
				"w-full overflow-x-auto rounded-xl border border-border",
				className
			)}
		>
			<table className="w-full border-collapse text-sm">
				{children}
			</table>
		</div>
	);
}

/* ================================
TABLE HEADER
================================ */
export function TableHeader({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<thead
			className={cn(
				"bg-muted/40 border-b border-border",
				className
			)}
		>
			{children}
		</thead>
	);
}

/* ================================
TABLE BODY
================================ */
export function TableBody({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<tbody
			className={cn(
				"bg-card divide-y divide-border",
				className
			)}
		>
			{children}
		</tbody>
	);
}

/* ================================
TABLE ROW (Clickable + Clean UX)
================================ */
export function TableRow({
	children,
	className,
	onClick,
}: {
	children: React.ReactNode;
	className?: string;
	onClick?: () => void;
}) {
	return (
		<tr
			onClick={onClick}
			className={cn(
				"group transition-all duration-150",
				"hover:bg-muted/40",
				onClick && "cursor-pointer",
				className
			)}
		>
			{children}
		</tr>
	);
}

/* ================================
TABLE HEAD CELL
================================ */
export function TableHead({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<th
			className={cn(
				"text-left px-4 py-3",
				"text-xs font-semibold uppercase tracking-wider",
				"text-muted-foreground",
				className
			)}
		>
			{children}
		</th>
	);
}

/* ================================
TABLE CELL
================================ */
export function TableCell({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<td
			className={cn(
				"px-4 py-4 align-middle",
				"text-sm text-foreground",
				className
			)}
		>
			{children}
		</td>
	);
}

/* ================================
TABLE FOOTER (optional)
================================ */
export function TableFooter({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<tfoot
			className={cn(
				"border-t border-border bg-muted/30",
				className
			)}
		>
			{children}
		</tfoot>
	);
}