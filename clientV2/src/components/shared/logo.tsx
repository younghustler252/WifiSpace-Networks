import Image from "next/image";
import { Wifi } from "lucide-react";
import { company } from "@/config/company";
import { cn } from "@/lib/utils";

const SIZES = {
	sm: { box: "size-7 rounded-md", icon: "size-4", text: "text-base", mark: 28, wordmark: 24 },
	md: { box: "size-9 rounded-lg", icon: "size-5", text: "text-lg", mark: 36, wordmark: 32 },
	lg: { box: "size-11 rounded-xl", icon: "size-6", text: "text-xl", mark: 44, wordmark: 40 },
} as const;

interface LogoImageProps {
	src: string;
	srcDark?: string;
	alt: string;
	height: number;
	square?: boolean;
}

function LogoImage({ src, srcDark, alt, height, square }: LogoImageProps) {
	const width = square ? height : height * 4;
	const style = { width: square ? height : "auto", height };

	return (
		<>
			<Image
				src={src}
				alt={alt}
				width={width}
				height={height}
				style={style}
				priority
				className={cn("object-contain", srcDark && "dark:hidden")}
			/>
			{srcDark && (
				<Image
					src={srcDark}
					alt={alt}
					width={width}
					height={height}
					style={style}
					priority
					className="hidden object-contain dark:block"
				/>
			)}
		</>
	);
}

interface LogoProps {
	className?: string;
	showName?: boolean;
	size?: keyof typeof SIZES;
	variant?: "full" | "mark" | "fiberlink";
}

export function Logo({
	className,
	showName = true,
	size = "md",
	variant = "full",
}: LogoProps) {
	const s = SIZES[size];
	const { mark, markDark, wordmark, wordmarkDark } = company.logo;

	// Explicit variant takes precedence over showName.
	if (variant === "mark") {
		return (
			<span className={cn("inline-flex items-center", className)}>
				{mark ? (
					<LogoImage
						src={mark}
						srcDark={markDark}
						alt={company.name}
						height={s.mark}
						square
					/>
				) : (
					<span
						className={cn(
							"flex items-center justify-center bg-primary text-primary-foreground signal-glow",
							s.box,
						)}
					>
						<Wifi className={s.icon} strokeWidth={2.5} />
					</span>
				)}

				<span className={cn("font-semibold tracking-tight", s.text)}>
					WifiSpace
				</span>
			</span>
		);
	}

	if (variant === "fiberlink") {
		return (
			<span className={cn("inline-flex items-center gap-2.5", className)}>
				{mark ? (
					<LogoImage
						src={mark}
						srcDark={markDark}
						alt=""
						height={s.mark}
						square
					/>
				) : (
					<span
						className={cn(
							"flex items-center justify-center bg-primary text-primary-foreground signal-glow",
							s.box,
						)}
					>
						<Wifi className={s.icon} strokeWidth={2.5} />
					</span>
				)}

				<span className={cn("font-semibold tracking-tight", s.text)}>
					Fiberlink
				</span>
			</span>
		);
	}

	// Full brand: use the supplied wordmark when available.
	if (wordmark && showName) {
		return (
			<span className={cn("inline-flex items-center", className)}>
				<LogoImage
					src={wordmark}
					srcDark={wordmarkDark}
					alt={company.name}
					height={s.wordmark}
				/>
			</span>
		);
	}

	return (
		<span className={cn("inline-flex items-center gap-2.5", className)}>
			{mark ? (
				<LogoImage
					src={mark}
					srcDark={markDark}
					alt={showName ? "" : company.name}
					height={s.mark}
					square
				/>
			) : (
				<span
					className={cn(
						"flex items-center justify-center bg-primary text-primary-foreground signal-glow",
						s.box,
					)}
				>
					<Wifi className={s.icon} strokeWidth={2.5} />
				</span>
			)}

			{showName && (
				<span className={cn("font-semibold tracking-tight", s.text)}>
					{company.name}
				</span>
			)}
		</span>
	);
}
