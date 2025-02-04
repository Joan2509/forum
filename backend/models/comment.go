package models

type Comment struct {
	ID        int    `json:"id"`
	UserID    int    `json:"user_id"`
	PostID    int    `json:"post_id"`
	Username  string `json:"username"`
	Content   string `json:"content"`
	CreatedAt string `json:"created_at"`
	Likes     int    `json:"likes"`
	Dislikes  int    `json:"dislikes"`
}
