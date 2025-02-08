package main

import (
	"forum/database"
	"forum/handlers"
	"forum/middleware"
	"forum/utils"
	"log"
	"net/http"
	"path/filepath"
)

// serveTemplate handles serving HTML templates
func serveTemplate(w http.ResponseWriter, r *http.Request, templatePath string) {
	path := filepath.Join("../frontend/templates", templatePath)
	http.ServeFile(w, r, path)
}

// corsMiddleware handles CORS headers for all API routes
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle OPTIONS requests
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	// Initialize database
	err := database.InitDB("./forum.db")
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Create a new mux for all API routes
	apiMux := http.NewServeMux()

	// Public API routes
	apiMux.HandleFunc("/login", handlers.LoginHandler)
	apiMux.HandleFunc("/register", handlers.RegisterHandler)
	apiMux.HandleFunc("/posts", handlers.GetPostsHandler)
	apiMux.HandleFunc("/categories", handlers.GetCategoriesHandler)
	apiMux.HandleFunc("/posts/", handlers.GetSinglePostHandler)
	apiMux.HandleFunc("/stats", handlers.GetForumStatsHandler)

	// Protected API routes - wrapped with auth middleware
	apiMux.Handle("/protected/logout", middleware.AuthMiddleware(http.HandlerFunc(handlers.LogoutHandler)))
	apiMux.Handle("/protected/posts", middleware.AuthMiddleware(http.HandlerFunc(handlers.GetPostsHandler)))
	apiMux.Handle("/protected/posts/create", middleware.AuthMiddleware(http.HandlerFunc(handlers.CreatePostHandler)))
	apiMux.Handle("/protected/comments", middleware.AuthMiddleware(http.HandlerFunc(handlers.CreateCommentHandler)))
	apiMux.Handle("/protected/likes", middleware.AuthMiddleware(http.HandlerFunc(handlers.CreateLikeDislikeHandler)))
	apiMux.Handle("/protected/auth/status", middleware.AuthMiddleware(http.HandlerFunc(handlers.AuthStatusHandler)))
	apiMux.Handle("/protected/comments/like", middleware.AuthMiddleware(http.HandlerFunc(handlers.CreateCommentLikeHandler)))

	// Serve static files
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("../frontend/static"))))

	// Root handler for serving the main page and handling 404s
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			serveTemplate(w, r, "index.html")
			return
		}
		utils.RenderErrorPage(w, http.StatusNotFound)
	})

	// Mount the API routes with CORS middleware
	http.Handle("/api/", corsMiddleware(http.StripPrefix("/api", apiMux)))

	// Start server
	log.Println("Server started on http://localhost:9111")
	log.Fatal(http.ListenAndServe(":9111", nil))
}
