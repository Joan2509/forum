package models

type LikeDislike struct {
	ID        int    `json:"id"`
	UserID    int    `json:"user_id"`
	PostID    int    `json:"post_id"`
	CommentID int    `json:"comment_id"`
	IsLike    bool   `json:"is_like"`
	CreatedAt string `json:"created_at"`
}
