package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"forum/database"
	"forum/middleware"
	"forum/models"
)

func CreatePostHandler(w http.ResponseWriter, r *http.Request) {
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

func GetPostsHandler(w http.ResponseWriter, r *http.Request) {
	// Get page from query parameters
	page := r.URL.Query().Get("page")
	pageNum := 1
	if page != "" {
		if num, err := strconv.Atoi(page); err == nil {
			pageNum = num
		}
	}

	offset := (pageNum - 1) * database.PostsPerPage
	posts, err := database.GetAllPosts(offset)
	if err != nil {
		http.Error(w, "Failed to fetch posts", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(posts)
}
