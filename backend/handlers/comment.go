package handlers

import (
	"encoding/json"
	"net/http"

	"forum/database"
	"forum/models"
)

func CreateCommentHandler(w http.ResponseWriter, r *http.Request) {
	var comment models.Comment
	err := json.NewDecoder(r.Body).Decode(&comment)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}

	err = database.CreateComment(comment)
	if err != nil {
		http.Error(w, "Failed to create comment", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Comment created successfully"})
}