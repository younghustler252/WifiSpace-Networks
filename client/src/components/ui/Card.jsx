export default function Card({ children }) {
	return (
		<div className="bg-surface border border-border rounded-xl shadow-md p-6 transition-colors duration-300">
			{children}
		</div>
	);
}
