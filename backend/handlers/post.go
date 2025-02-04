package handlers

import (
	"encoding/json"
	"forum/backend/database"
	"forum/backend/middleware"
	"forum/backend/models"
	"net/http"
)

func CreatePost(w http.ResponseWriter, r *http.Request) {
	userId, ok := middleware.GetUserID(r)
	if !ok {
		http.Error(w, "Unauthorized: No user ID", http.StatusUnauthorized)
        return
	}
	var postData models.Post
	postData.UserID = userId
	if err := json.NewDecoder(r.Body).Decode(&postData); err != nil {
		http.Error(w, "Cannot get decode post body", http.StatusBadRequest)
        return
	}
	if err := database.CreatePost(postData); err != nil {
		http.Error(w, "Cannot create post", http.StatusInternalServerError)
        return
	}
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Post created successfully",
	})
}
