package database

import (
	"fmt"
	"log"
	"math/rand"

	"forum/models"

	"github.com/bxcodec/faker/v3"
	"github.com/jmoiron/sqlx"
)

var categories = []string{
	"Technology", "Sports", "Entertainment", "Science", "Politics", "Health", "Travel",
}

func fakePosts(dbname string) {
	// Open the SQLite database (adjust the path if needed)
	db, err := sqlx.Connect("sqlite3", dbname)
	if err != nil {
		log.Fatalln(err)
	}
	defer db.Close()

	// Step 1: Insert dummy users (let's create 10 users)
	userIds := []int{}
	for i := 0; i < 10; i++ {
		username := faker.Username()
		email := faker.Email()
		password := faker.Password()

		// Insert into the users table
		_, err := db.Exec(`
			INSERT INTO users (username, email, password) 
			VALUES (?, ?, ?)`, username, email, password)
		if err != nil {
			log.Fatalln(err)
		}

		// Get the last inserted user ID
		var userId int
		err = db.Get(&userId, "SELECT last_insert_rowid()")
		if err != nil {
			log.Fatalln(err)
		}

		userIds = append(userIds, userId)
	}

	// Step 2: Insert 50 dummy posts with random categories
	for i := 0; i < 50; i++ {
		title := faker.Sentence()
		content := faker.Paragraph()

		// Pick a random category
		category := []int{rand.Intn(len(categories))}
		// Pick a random user_id from the previously inserted users
		userId := userIds[rand.Intn(len(userIds))]

		// Insert into the posts table
		post := models.Post{
			UserID:        userId,
			Title:         title,
			Content:       content,
			RawCategories: category,
		}
		err := CreatePost(post)
		if err != nil {
			log.Fatalln(err)
		}
	}

	fmt.Println("50 dummy posts inserted successfully!")
}
