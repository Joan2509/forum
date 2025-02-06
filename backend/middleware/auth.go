package middleware

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"forum/database"
	"forum/utils"
)

type contextKey string

const UserIDKey contextKey = "userID"

// AuthMiddleware checks if the user is authenticated
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		// Get the session token from the cookie
		cookie, err := r.Cookie("session_token")
		if err != nil {
			utils.RenderErrorPage(w, http.StatusUnauthorized)
			return
		}

		// Get user ID from session
		var userID int
		var expiresAt time.Time
		err = database.DB.QueryRow(
			"SELECT user_id, expires_at FROM sessions WHERE token = ?",
			cookie.Value,
		).Scan(&userID, &expiresAt)

		if err == sql.ErrNoRows {
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"message": "Unauthorized: Invalid session"})
			return
		}
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"message": "Internal server error"})
			return
		}

		// Check if session has expired
		if time.Now().After(expiresAt) {
			// Delete expired session
			database.DB.Exec("DELETE FROM sessions WHERE token = ?", cookie.Value)
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"message": "Unauthorized: Session expired"})
			return
		}

		// Add user ID to request context
		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// helps get user ID from context
func GetUserID(r *http.Request) (int, bool) {
	userID, ok := r.Context().Value(UserIDKey).(int)
	return userID, ok
}
