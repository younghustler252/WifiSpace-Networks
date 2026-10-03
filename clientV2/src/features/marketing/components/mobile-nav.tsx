"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "../constants";

export function MobileNav() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button variant="ghost" size="icon" aria-label="Open menu">
					<Menu className="size-5" />
				</Button>
			</SheetTrigger>
			<SheetContent side="right" className="w-72">
				<SheetHeader>
					<SheetTitle>
						<Logo size="sm" />
					</SheetTitle>
					<SheetDescription className="sr-only">Site navigation</SheetDescription>
				</SheetHeader>

				<nav className="flex flex-col gap-1 px-4">
					{NAV_LINKS.map((link) => (
						<SheetClose asChild key={link.href}>
							<Link href={link.href} className="rounded-md px-3 py-3 text-[15px] hover:bg-muted">
								{link.label}
							</Link>
						</SheetClose>
					))}
				</nav>

				<div className="mt-auto space-y-3 p-4">
					<SheetClose asChild>
						<Link href="/register" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
							Get started
						</Link>
					</SheetClose>
					<SheetClose asChild>
						<Link href="/login" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "w-full bg-surface-2")}>
							Sign in
						</Link>
					</SheetClose>
				</div>
			</SheetContent>
		</Sheet>
	);
}