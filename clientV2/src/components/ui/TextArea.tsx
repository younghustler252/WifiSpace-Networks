interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	error?: boolean;
}

export const Textarea = ({
	className = "",
	error = false,
	...props
}: TextareaProps) => {

	return (
		<textarea
			className={`
				w-full
				min-h-120px
				rounded-xl
				bg-muted
				border
				${error ? "border-danger focus:ring-danger/30" : "border-border focus:ring-primary/20"}
				text-sm
				px-4
				py-3
				placeholder:text-muted-foreground
				focus:outline-none
				focus:ring-2
				transition-all
				resize-none
				${className}
			`}
			{...props}
		/>
	);
};