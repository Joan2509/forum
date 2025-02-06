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
	req := httptest.NewRequest(http.MethodGet, "/api/register", &buffer)
	res.Code = http.StatusOK

	RegisterHandler(res, req)
	if res.Code != http.StatusCreated {
		t.Errorf("RegisterHandler() got = %v, want %v", res.Code, http.StatusCreated)
	}
}

func TestLoginHandler(t *testing.T) {
	// mock response
	res := httptest.NewRecorder()

	// mock registration request request
	var buffer bytes.Buffer
	json.NewEncoder(&buffer).Encode(map[string]string{
		"username": "testuser",
		"email":    "test@example.com",
		"password": "testpassword",
	})
	req := httptest.NewRequest(http.MethodGet, "/api/login", &buffer)
	res.Code = http.StatusOK

	LoginHandler(res, req)
	if res.Code != http.StatusOK {
		t.Errorf("LoginHandler() got = %v, want %v", res.Code, http.StatusOK)
	}
	if res.Result().Cookies()[0].Value == "" {
		t.Error("No session token in response")
	}
}

func TestLogoutHandler(t *testing.T) {
	// mock response
	res := httptest.NewRecorder()

	// mock registration request request
	var buffer bytes.Buffer
	json.NewEncoder(&buffer).Encode(map[string]string{
		"username": "testuser",
		"email":    "test@example.com",
		"password": "testpassword",
	})

	req := httptest.NewRequest(http.MethodGet, "/api/register", &buffer)
	res.Code = http.StatusOK

	RegisterHandler(res, req)
	req = httptest.NewRequest(http.MethodGet, "/api/login", &buffer)
	res.Code = http.StatusOK

	LoginHandler(res, req)
	req = httptest.NewRequest(http.MethodGet, "/api/protected/api/logout", &buffer)
	res.Code = http.StatusOK

	LogoutHandler(res, req)
	if res.Code != http.StatusOK {
		t.Errorf("LoginHandler() got = %v, want %v", res.Code, http.StatusOK)
	}
	if len(res.Result().Cookies())!= 0 {
        t.Error("Session token still present in response")
    }
}
