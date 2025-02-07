# Use the official Golang image from the Docker Hub
FROM golang:1.23

# Set the working directory inside the container
WORKDIR /app

# Copy the backend directory content into the container
COPY backend/ .

# Download dependencies
RUN go mod tidy

# Build the Go application
RUN go build -o forum

# Copy the frontend files into the container
COPY frontend/ /app/frontend

# Specify the command to run the application
CMD ["./forum"]