# Use the official Golang image from the Docker Hub
FROM golang:1.19-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the backend directory content into the container
COPY backend/ .

# Download dependencies
RUN go mod download

# Build the Go application
RUN go build -o forum

# Copy the frontend files into the container
COPY frontend/ /app/frontend

# Specify the command to run the application
CMD ["./forum"]