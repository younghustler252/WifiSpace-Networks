
const Modal = ({ title, children, onClose }) => {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose} // click on backdrop closes
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-xl w-full p-6 relative"
                onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                    ✕
                </button>

                {/* Title */}
                {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}

                {/* Content */}
                <div>{children}</div>
            </div>
        </div>
    );
};

export default Modal;
