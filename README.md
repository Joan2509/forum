# Forum Project

## Project Overview

This project is a web forum that allows users to communicate through posts and comments. It includes features such as authentication, post categorization, likes/dislikes, filtering, and is containerized using Docker.

## Features

### User Authentication

- Register with email, username, and password.

- Login/logout with session management using cookies.

- Encrypted password storage .

### Posts & Comments

- Only registered users can create posts and comments.

- Posts are categorized.

- Visible to all users (registered or not).

### Likes & Dislikes

- Only registered users can like/dislike posts and comments.

- Like/dislike counts are visible to all users.

#### Filtering

- Filter posts by categories.

- Registered users can filter by created posts and liked posts.

### Database (SQLite)

- Stores users, posts, comments, likes/dislikes, and categories.

- Implements SELECT, CREATE, and INSERT queries.

## Setup & Installation

### Prerequisites

Docker installed on your system.

## Run the Project

1. Clone the repository:
   ```
   git clone https://learn.zone01kisumu.ke/git/johnotieno0/forum.git
   ```
2. Navigate to the Project Directory:
   ```
   cd forum
   ```
3. Build and run the Docker container:
   ```
   ./launch_docker_forum.sh
   ````
4. Access the forum at:
   ``` 
   http://localhost:9111

   ````

## Technologies Used

Go (Golang) – Backend API

SQLite – Database

HTML, CSS, JavaScript – Frontend

Docker – Containerization

## Contribution

We welcome contributions to project! To contribute, follow these steps:
1. Fork the repository.
2. Create a new branch (git checkout -b feature/your-feature-name).
3. Make your changes and commit them (git commit -m 'Add some feature').
4. Push to the branch (git push origin feature/your-feature-name).
5. Open a pull request.

## Authors

[STEPHEN OGINGA](https://learn.zone01kisumu.ke/git/steodhiambo)

[JOHN OTIENO](https://learn.zone01kisumu.ke/git/johnotieno0)

[KAUNDA RODGERS](https://learn.zone01kisumu.ke/git/krodgers)

[JOAN WAMBUGU](https://learn.zone01kisumu.ke/git/jwambugu)




## License

This project is licensed under the [MIT](https://opensource.org/license/mit) License.
