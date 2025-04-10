import { useEffect } from "react";

function LoadingScreen({
  isLoading,
  text,
}: {
  isLoading: boolean;
  text: string;
}) {
  useEffect(() => {
    if (isLoading) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isLoading]);

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 z-51 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-white">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
              ></path>
            </svg>
            <span>{text}...</span>
          </div>
        </div>
      )}
    </>
  );
}

export default LoadingScreen;
