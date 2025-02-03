package database

import (
	"database/sql"

	"forum/backend/models"
)

// Insert a new user
func CreateUser(user models.User) error {
	_, err := DB.Exec("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", user.Username, user.Email, user.Password)
	return err
}

// Insert a new post
func CreatePost(post models.Post) error {
	_, err := DB.Exec("INSERT INTO posts (user_id, title, content) VALUES (?, ?, ?)", post.UserID, post.Title, post.Content)
	return err
}

// Insert a new comment
func CreateComment(comment models.Comment) error {
	_, err := DB.Exec("INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)", comment.UserID, comment.PostID, comment.Content)
	return err
}

// Insert a like/dislike
func CreateLikeDislike(like models.LikeDislike) error {
	// First check if user already liked/disliked
	var existingID int
	err := DB.QueryRow(
		"SELECT id FROM likes WHERE user_id = ? AND post_id = ?",
		like.UserID, like.PostID,
	).Scan(&existingID)

	if err == sql.ErrNoRows {
		// Create new like
		_, err = DB.Exec(
			"INSERT INTO likes (user_id, post_id, is_like) VALUES (?, ?, ?)",
			like.UserID, like.PostID, map[bool]int{true: 1, false: 0}[like.IsLike],
		)
		return err
	}

	if err != nil {
		return err
	}

	// Update existing like
	_, err = DB.Exec(
		"UPDATE likes SET is_like = ? WHERE id = ?",
		map[bool]int{true: 1, false: 0}[like.IsLike], existingID,
	)
	return err
}
