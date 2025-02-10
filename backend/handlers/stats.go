package handlers

import (
	"encoding/json"
	"net/http"
	"forum/database"
)

func GetForumStatsHandler(w http.ResponseWriter, r *http.Request) {
	stats, err := database.GetForumStats()
	if err != nil {
		http.Error(w, "Failed to fetch forum stats", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
} 