package middleware

import (
	"net/http"
)

type contextKey string

const userIDKey contextKey = "UserID"

func GetUserID(r *http.Request) (id int, ok bool) {
	id, ok = r.Context().Value(userIDKey).(int)
	return
}
