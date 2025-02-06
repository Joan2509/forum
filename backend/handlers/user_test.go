package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRegisterHandler(t *testing.T) {
	// mock response
	res := httptest.NewRecorder()

	// mock registration request request
	var buffer bytes.Buffer
	json.NewEncoder(&buffer).Encode(map[string]string{
		"username": "testuser",
		"email":    "test@example.com",
		"password": "testpassword",
	})
	req := httptest.NewRequest(http.MethodGet, "/register", &buffer)
	res.Code = http.StatusOK

	RegisterHandler(res, req)
	if res.Code != http.StatusCreated {
		t.Errorf("RegisterHandler() got = %v, want %v", res.Code, http.StatusOK)
	}
}

// func TestCreatePostHandler(t *testing.T) {
// 	type args struct {
// 		w http.ResponseWriter
// 		r *http.Request
// 	}
// 	tests := []struct {
// 		name string
// 		args args
// 	}{
// 		{},
// 	}
// 	for _, tt := range tests {
// 		t.Run(tt.name, func(t *testing.T) {
// 			CreatePostHandler(tt.args.w, tt.args.r)
// 		})
// 	}
// }
