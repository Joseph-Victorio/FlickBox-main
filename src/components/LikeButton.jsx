import { useState, useEffect } from "react";
import { FaHeart } from "react-icons/fa";

const API_BASE_URL = "http://flickbox.test/";

const LikeButton = ({ review, currentUserId, onLikeUpdate }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(review.likes || 0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!currentUserId) return;
      
      try {
        const response = await fetch(
          `${API_BASE_URL}/check_like.php?review_id=${review.id}&user_id=${currentUserId}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to check like status');
        }
        
        const data = await response.json();
        setIsLiked(data.isLiked);
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };

    checkLikeStatus();
  }, [review.id, currentUserId]);

  const handleLike = async () => {
    if (!currentUserId || isLoading) return;
    
    setIsLoading(true);
    try {
      const action = isLiked ? 'unlike' : 'like';
      const response = await fetch(`${API_BASE_URL}/like_handler.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          review_id: review.id,
          user_id: currentUserId,
          action: action
        })
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const result = await response.json();
      
      if (result.status === "success") {
        const newLikeStatus = !isLiked;
        setIsLiked(newLikeStatus);
        setLikeCount(result.likes);
        
        if (onLikeUpdate) {
          onLikeUpdate(review.id, result.likes, newLikeStatus);
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading || !currentUserId}
      className={`flex items-center gap-2 px-3 py-1 rounded-md transition-all duration-200 flex-grow-0 h-10 cursor-pointer ${
        isLiked 
          ? "bg-red-500 hover:bg-red-600 text-white" 
          : "bg-gray-600 hover:bg-gray-500 text-gray-300"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-label={isLiked ? "Unlike this review" : "Like this review"}
    >
      <FaHeart className={isLiked ? "text-white" : "text-gray-300"} />
      <span>{likeCount}</span>
    </button>
  );
};

export default LikeButton;