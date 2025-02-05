package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

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
	w.Header().Set("Content-Type", "application/json")
	// Get filter parameters
	categoryID := r.URL.Query().Get("category")
	filterID := r.URL.Query().Get("filter")
	userID, _ := middleware.GetUserID(r)
	var (
		posts []models.Post
		err   error
	)

	if filterID == "my-posts" && userID > 0 {
		posts, err = database.GetUserPosts(userID)
	} else if filterID == "liked-posts" && userID > 0 {
		posts, err = database.GetLikedPosts(userID)
	} else if categoryID != "" {
		posts, err = database.GetPostsByCategory(categoryID)
	} else {
		posts, err = database.GetAllPosts()
	}
	// If no posts found, return empty array
	if err == sql.ErrNoRows {
		json.NewEncoder(w).Encode([]models.Post{})
		return
	}
	if err != nil {
		log.Printf("Error fetching posts: %v", err)
		http.Error(w, "Failed to fetch posts", http.StatusInternalServerError)
		return
	}

	// Get comments and likes for each post
	for i := range posts {
		err = database.DB.QueryRow("SELECT COUNT(*) FROM likes WHERE post_id = ? AND is_like = 1", posts[i].ID).Scan(&posts[i].Likes)
		if err != nil {
			log.Printf("Error counting likes: %v", err)
			continue
		}
		err = database.DB.QueryRow("SELECT COUNT(*) FROM likes WHERE post_id = ? AND is_like = 0", posts[i].ID).Scan(&posts[i].Dislikes)
		if err != nil {
			log.Printf("Error counting dislikes: %v", err)
			continue
		}
		comments, err := database.GetCommentsByPostID(posts[i].ID)
		if err != nil {
			log.Printf("Error fetching comments: %v", err)
			continue
		}
		posts[i].Comments = comments
	}
	json.NewEncoder(w).Encode(posts)
}
