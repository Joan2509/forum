package handlers

import (
	"encoding/json"
	"net/http"

	"forum/database"
	"forum/middleware"
	"forum/models"
)

func CreateLikeDislikeHandler(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var like models.LikeDislike
	err := json.NewDecoder(r.Body).Decode(&like)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	// Set the user ID from the authenticated user
	like.UserID = userID

	err = database.CreateLikeDislike(like)
	if err != nil {
		http.Error(w, "Failed to like/dislike", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Like/Dislike created successfully"})
}
