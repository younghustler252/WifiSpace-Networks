export const formatDate = (value?: string | null) => {
    if (!value) return "—";

    return new Date(value).toLocaleDateString(
        "en-NG",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
};