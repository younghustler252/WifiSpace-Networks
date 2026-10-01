"use client";

import { useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUploadAvatar } from "../hooks/use-users";
import type { UserProfile } from "../types/users.types";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export function AvatarUploader({ profile }: { profile: UserProfile }) {
	const inputRef = useRef<HTMLInputElement>(null);
	const upload = useUploadAvatar();
	const initials = `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase();

	async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file) return;

		if (!ACCEPTED.includes(file.type)) {
			toast.error("Use a JPG, PNG or WebP image");
			return;
		}
		if (file.size > MAX_BYTES) {
			toast.error("That image is too large. Keep it under 5 MB");
			return;
		}

		const res = await upload.mutateAsync(file);
		if (!res.success) {
			toast.error(res.message);
			return;
		}
		toast.success("Photo updated");
	}

	return (
		<div className="flex items-center gap-4">
			<Avatar className="size-16">
				<AvatarImage src={profile.avatar?.url} alt="" />
				<AvatarFallback className="bg-signal/15 text-lg font-semibold text-signal">{initials}</AvatarFallback>
			</Avatar>
			<div className="space-y-1.5">
				<Button type="button" variant="outline" size="sm" className="bg-surface-2" disabled={upload.isPending} onClick={() => inputRef.current?.click()}>
					{upload.isPending ? <Loader2 className="animate-spin" /> : <Camera />}
					Change photo
				</Button>
				<p className="text-[11px] text-muted-foreground">JPG, PNG or WebP, up to 5 MB.</p>
				<input ref={inputRef} type="file" accept={ACCEPTED.join(",")} className="sr-only" onChange={onFile} />
			</div>
		</div>
	);
}