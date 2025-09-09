import React from "react";

const SkeletonLoader = ({ variant = "default" }) => {
  const renderLoader = () => {
    switch (variant) {
      case "card":
        return (
          <div className="animate-pulse">
            <div className="bg-gray-200 rounded-xl aspect-[2/3] mb-3" />
            <div className="h-5 bg-gray-200 rounded mb-2 w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
          </div>
        );
      
      case "text":
        return (
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-4/5" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        );
      
      case "banner":
        return (
          <div className="animate-pulse bg-gray-200 rounded-xl aspect-video w-full" />
        );
      
      default:
        return (
          <div className="animate-pulse">
            <div className="bg-gray-200 rounded-xl aspect-[2/3] mb-3" />
            <div className="h-5 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/4" />
          </div>
        );
    }
  };

  return renderLoader();
};

export default SkeletonLoader;