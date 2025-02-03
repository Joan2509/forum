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

// Get user by email
func GetUserByEmail(email string) (models.User, error) {
	var user models.User
	err := DB.QueryRow("SELECT id, username, email, password FROM users WHERE email = ?", email).Scan(&user.ID, &user.Username, &user.Email, &user.Password)
	return user, err
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

// Get likes/dislikes for a post
func GetLikesDislikes(postID int) ([]models.LikeDislike, error) {
	query := "SELECT id, user_id, post_id, is_like, created_at FROM likes WHERE post_id = ?"

	rows, err := DB.Query(query, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var likes []models.LikeDislike
	for rows.Next() {
		var like models.LikeDislike
		err := rows.Scan(&like.ID, &like.UserID, &like.PostID, &like.IsLike, &like.CreatedAt)
		if err != nil {
			return nil, err
		}
		likes = append(likes, like)
	}
	return likes, nil
}

// Get all categories
func GetCategories() ([]models.Category, error) {
	rows, err := DB.Query("SELECT id, name FROM categories ORDER BY name")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []models.Category
	for rows.Next() {
		var category models.Category
		if err := rows.Scan(&category.ID, &category.Name); err != nil {
			return nil, err
		}
		categories = append(categories, category)
	}
	return categories, nil
}
