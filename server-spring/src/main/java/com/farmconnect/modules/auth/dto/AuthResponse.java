package com.farmconnect.modules.auth.dto;

import com.farmconnect.modules.users.model.Role;

public class AuthResponse {

    private String accessToken;
    private String tokenType = "Bearer";
    private long expiresIn = 900; // 15 minutes in seconds
    private UserDto user;

    public AuthResponse() {}

    public AuthResponse(String accessToken, UserDto user) {
        this.accessToken = accessToken;
        this.user = user;
    }

    public static class UserDto {
        private Long id;
        private String userId;
        private String username;
        private String email;
        private String mobile;
        private Role role;
        private String avatarUrl;

        public UserDto() {}

        public UserDto(Long id, String userId, String username, String email, String mobile, Role role, String avatarUrl) {
            this.id = id;
            this.userId = userId;
            this.username = username;
            this.email = email;
            this.mobile = mobile;
            this.role = role;
            this.avatarUrl = avatarUrl;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getMobile() { return mobile; }
        public void setMobile(String mobile) { this.mobile = mobile; }
        public Role getRole() { return role; }
        public void setRole(Role role) { this.role = role; }
        public String getAvatarUrl() { return avatarUrl; }
        public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }

    public UserDto getUser() { return user; }
    public void setUser(UserDto user) { this.user = user; }
}
