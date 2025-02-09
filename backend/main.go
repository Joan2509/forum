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

func serveTemplate(w http.ResponseWriter, r *http.Request, templatePath string) {
	path := filepath.Join("../frontend/templates", templatePath)
	http.ServeFile(w, r, path)
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		} else {
			w.Header().Set("Access-Control-Allow-Origin", "*")
		}
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {

	err := database.InitDB("./forum.db")
	if err != nil {
		log.Fatalf("Database initialization failed: %v. Ensure the file exists and is accessible.", err)
	}

	staticPath, err := filepath.Abs("../frontend/static")
	if err != nil {
		log.Fatalf("Failed to get absolute path for static files: %v", err)
	}
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir(staticPath))))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			serveTemplate(w, r, "index.html")
			return
		}
		utils.RenderErrorPage(w, http.StatusNotFound)
	})

	// API routes - Public
	http.HandleFunc("/api/login", handlers.LoginHandler)
	http.HandleFunc("/api/register", handlers.RegisterHandler)
	http.HandleFunc("/api/posts", handlers.GetPostsHandler)
	http.HandleFunc("/api/categories", handlers.GetCategoriesHandler)
	http.HandleFunc("/api/posts/", handlers.GetSinglePostHandler)
	http.HandleFunc("/api/stats", handlers.GetForumStatsHandler)

	// API routes - Protected
	protectedMux := http.NewServeMux()
	protectedMux.HandleFunc("/api/logout", handlers.LogoutHandler)
	protectedMux.HandleFunc("/api/posts", handlers.GetPostsHandler)
	protectedMux.HandleFunc("/api/posts/create", handlers.CreatePostHandler)
	protectedMux.HandleFunc("/api/comments", handlers.CreateCommentHandler)
	protectedMux.HandleFunc("/api/likes", handlers.CreateLikeDislikeHandler)
	protectedMux.HandleFunc("/api/auth/status", handlers.AuthStatusHandler)
	protectedMux.HandleFunc("/api/comments/like", handlers.CreateCommentLikeHandler)

	// Registering routes
	http.Handle("/api/protected/", middleware.AuthMiddleware(http.StripPrefix("/api/protected", protectedMux)))

	// Applying CORS middleware to all API routes
	http.Handle("/api/", corsMiddleware(http.DefaultServeMux))

	// Start server
	log.Println("Server started on http://localhost:9111")
	log.Fatal(http.ListenAndServe(":9111", nil))
}
