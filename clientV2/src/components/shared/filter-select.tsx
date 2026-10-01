import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const FILTER_ALL = "all";

interface FilterSelectProps {
	value: string;
	onChange: (value: string) => void;
	label: string;
	allLabel?: string;
	options: readonly { value: string; label: string }[];
}

export function FilterSelect({ value, onChange, label, allLabel, options }: FilterSelectProps) {
	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger className="w-full sm:w-44" aria-label={label}>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{allLabel && <SelectItem value={FILTER_ALL}>{allLabel}</SelectItem>}
				{options.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}