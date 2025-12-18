import { useState } from "react";

const RowActions = ({ actions }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="action-btn"
                aria-label="Row actions"
            >
                ⋮
            </button>

            {open && (
                <div
                    className="dropdown absolute right-0 mt-2 w-44 z-20"
                    onMouseLeave={() => setOpen(false)}
                >
                    {actions.map((action) => (
                        <button
                            key={action.label}
                            onClick={action.onClick}
                            disabled={action.disabled}
                            className={`w-full text-left px-4 py-2 text-sm transition
                                ${action.disabled
                                    ? "text-muted cursor-not-allowed"
                                    : "hover:bg-surface-muted"
                                }
                                ${action.variant === "danger"
                                    ? "text-danger"
                                    : "text-primary"
                                }
                            `}
                        >
                            {action.label}

                            {action.hint && (
                                <span className="block text-xs text-muted mt-0.5">
                                    {action.hint}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RowActions;
