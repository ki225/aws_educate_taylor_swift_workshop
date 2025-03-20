import Image from "next/image";
import { useState } from "react";

const BusinessAnalysisCard = ({ imageUrl, description }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  // switch to full-screen mode to view the image
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleDownloadImage = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "chart.png"; // download filename
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* gradient header */}
        <div className="bg-gradient-to-r from-[#f2dfb5] to-[#fbc1f1] p-3">
          <h2 className="text-xl font-bold text-white text-center">報告結果</h2>
        </div>

        <div className="p-6">
          {/* display image */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner mb-6">
            <div
              className="relative w-full h-100 rounded-md overflow-hidden border border-gray-200"
              onClick={toggleFullScreen}
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="分析圖表"
                  fill
                  objectFit="contain"
                  className="transition-transform hover:scale-105 duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <span className="text-gray-400">圖表預覽</span>
                </div>
              )}

              {/* click to view image in full-screen mode */}
              <div className="absolute bottom-2 right-2 bg-[#f4b8c4] bg-opacity-50 text-white text-xs px-2 py-1 rounded-md flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
                點擊放大
              </div>
            </div>
          </div>

          {/* description */}
          <div className="space-y-4">
            <div className="p-4 bg-[#fffaf3] rounded-lg border-l-4 border-[#f7d6b5]">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          </div>
        </div>

        {/* footer */}
        <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-t border-gray-100">
          <span className="text-xs text-gray-500">
            最後更新: {new Date().toLocaleDateString("zh-TW")}
          </span>
          <button
            className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-[#f7c09e] hover:border-[#f7c09e] transition-colors"
            onClick={handleDownloadImage}
          >
            下載圖表
          </button>
        </div>
      </div>
      {/* full-screen mode */}
      {isFullScreen && imageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={toggleFullScreen}
        >
          <div className="relative w-full h-full max-w-6xl max-h-screen">
            {/* closed button */}
            <button
              className="absolute top-4 right-4 bg-white rounded-full p-2 text-gray-800 z-10 hover:bg-gray-200 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullScreen();
              }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="relative w-full h-full">
              <Image
                src={imageUrl}
                alt="分析圖表大圖顯示"
                fill
                objectFit="contain"
                className="p-4"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BusinessAnalysisCard;
