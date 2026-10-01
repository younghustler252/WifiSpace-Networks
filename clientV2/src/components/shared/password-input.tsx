"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PasswordInput({ className, ...props }: React.ComponentProps<typeof Input>) {
	const [visible, setVisible] = useState(false);

	return (
		<div className="relative">
			<Input {...props} type={visible ? "text" : "password"} className={cn("pr-11", className)} />
			<Button
				type="button"
				variant="ghost"
				size="icon"
				className="absolute right-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground"
				onClick={() => setVisible((v) => !v)}
				aria-label={visible ? "Hide password" : "Show password"}
			>
				{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
			</Button>
		</div>
	);
}