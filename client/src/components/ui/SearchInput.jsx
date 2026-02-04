const SearchInput = ({ value, onChange, placeholder }) => {
	return (
		<input
			type="text"
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			className="
				w-full
				px-4 py-2
				card
				shadow-none
				focus-ring
				text-sm
			"
		/>
	);
};

export default SearchInput;
