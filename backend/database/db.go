package database

import (
	"database/sql"
	"log"
)

var DB *sql.DB

func InitDB() (err error) {
	DB, err = sql.Open("sqlite3", "./forum.db")
	if err != nil {
		return
	}
	// Create tables 
	err = CreateTables(TableCreationStatements)
	if err != nil {
		return
	}
	log.Println("Database initialized successfully")
	return
}
