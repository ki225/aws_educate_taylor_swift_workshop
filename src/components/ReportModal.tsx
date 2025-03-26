import React from "react";
import BusinessAnalysisCard from "./BusinessAnalysisCard";

interface ReportModalProps {
  handleCloseModal: () => void;
  imageUrl: string;
  description: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  handleCloseModal,
  imageUrl,
  description,
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto"
      onClick={handleCloseModal}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleCloseModal}
            className="text-gray-600 hover:text-gray-900 bg-white rounded-full p-2 shadow-md transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto max-h-[85vh] p-4">
          <BusinessAnalysisCard imageUrl={imageUrl} description={description} />
        </div>
      </div>
    </div>
  );
};
