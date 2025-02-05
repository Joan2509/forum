package handlers

import (
	"encoding/json"
	"net/http"

	"forum/database"
	"forum/models"
)

func CreateLikeDislikeHandler(w http.ResponseWriter, r *http.Request) {
	var like models.LikeDislike
	err := json.NewDecoder(r.Body).Decode(&like)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	err = database.CreateLikeDislike(like)
	if err != nil {
		http.Error(w, "Failed to like/dislike", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Like/Dislike created successfully"})
}