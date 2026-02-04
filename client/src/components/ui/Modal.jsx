import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Modal Component
 *
 * Props:
 * - open: boolean -> whether modal is open
 * - onClose: function -> callback to close modal
 * - children: ReactNode -> modal content
 * - closeOnOutsideClick: boolean -> close modal on clicking outside (default: false)
 */
const Modal = ({ open, onClose, children, closeOnOutsideClick = false }) => {
	const modalRef = useRef();

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target)) {
				onClose();
			}
		};

		const handleEsc = (e) => {
			if (e.key === "Escape") onClose();
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEsc);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEsc);
		};
	}, [closeOnOutsideClick, onClose]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-auto">
			<div
				ref={modalRef}
				className="relative w-full max-w-xl bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg transform transition-transform duration-300 scale-100 md:scale-100"
			>
				{/* Close Button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-muted hover:text-primary transition"
					aria-label="Close Modal"
				>
					<X size={20} />
				</button>

				{/* Modal Content */}
				<div className="mt-2">{children}</div>
			</div>
		</div>
	);
};

export default Modal;
