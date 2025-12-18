
export const Spinner = ({size = "w-8 h-8"}) => {
    return (
        <div className={`animate-spin ${size} border-4 border-b-blue-500 border-t-transparent rounded-full`} />
    )
}

export const FullScreenSpinner = () => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <Spinner size="w-12 h-12" />
        </div>
    );
};


export const DotsLoader = () => {
    return (
        <div className="flex space-x-2 items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" />
            <div
                className="w-3 h-3 rounded-full bg-blue-500 animate-bounce"
                style={{ animationDelay: "0.2s" }}
            />
            <div
                className="w-3 h-3 rounded-full bg-blue-500 animate-bounce"
                style={{ animationDelay: "0.4s" }}
            />
        </div>
    );
};


export const BarLoader = () => {
    return (
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="h-2 w-1/3 bg-blue-500 animate-pulse" />
        </div>
    );
};
