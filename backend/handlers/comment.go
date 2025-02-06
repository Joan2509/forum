package handlers

import (
	"encoding/json"
	"net/http"

	"forum/database"
	"forum/middleware"
	"forum/models"
)

func CreateCommentHandler(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context
	userID, ok := middleware.GetUserID(r)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var comment models.Comment
	err := json.NewDecoder(r.Body).Decode(&comment)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Override the user_id with the authenticated user's ID
	comment.UserID = userID

	err = database.CreateComment(comment)
	if err != nil {
		http.Error(w, "Failed to create comment", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Comment created successfully"})
}

func CreateCommentLikeHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var like struct {
		CommentID int  `json:"comment_id"`
		IsLike    bool `json:"is_like"`
	}

	if err := json.NewDecoder(r.Body).Decode(&like); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Insert or update the comment like in the database
	_, err := database.DB.Exec(`
		INSERT INTO comment_likes (user_id, comment_id, is_like)
		VALUES (?, ?, ?)
		ON CONFLICT(user_id, comment_id)
		DO UPDATE SET is_like = ?`,
		userID, like.CommentID, like.IsLike, like.IsLike)
	if err != nil {
		http.Error(w, "Failed to update comment like", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Comment like updated successfully"})
}
