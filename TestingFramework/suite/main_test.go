package suite

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/suite"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

type MingleAPISuite struct {
	suite.Suite
	baseURL string
	client  *mongo.Client
	tokens  map[string]string
	users   map[string]User
	postIDs map[string]map[string]string
	userIDs map[string]string
}

type User struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Post struct {
	ID        string    `json:"_id"`
	Title     string    `json:"title"`
	Topic     []string  `json:"topic"`
	Body      string    `json:"body"`
	Owner     *Owner    `json:"owner"`
	Status    string    `json:"status"`
	Likes     []string  `json:"likes"`
	Dislikes  []string  `json:"dislikes"`
	Comments  []Comment `json:"comments"`
	CreatedAt time.Time `json:"createdAt"`
	ExpiresAt time.Time `json:"expiration"`
}
type Owner struct {
	ID    string `json:"_id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type Comment struct {
	User    User   `json:"user"`
	Comment string `json:"comment"`
}

func (s *MingleAPISuite) SetupSuite() {
	s.baseURL = initApp()
	s.tokens = make(map[string]string)
	s.userIDs = make(map[string]string)
	s.postIDs = make(map[string]map[string]string)

	s.users = map[string]User{
		"Olga":   {Name: "Olga", Email: "olga@mingle.com", Password: "olga12345678"},
		"Nick":   {Name: "Nick", Email: "nick@mingle.com", Password: "nick12345678"},
		"Mary":   {Name: "Mary", Email: "mary@mingle.com", Password: "mary12345678"},
		"Nestor": {Name: "Nestor", Email: "nestor@mingle.com", Password: "nestor12345678"},
	}

	for name := range s.users {
		s.postIDs[name] = make(map[string]string)
	}

	client, err := ConnectDB()
	if err != nil {
		s.T().Fatalf("Failed to connect to MongoDB: %v", err)
	}
	s.client = client

	s.cleanDatabase()

	fmt.Printf("\n Testing Mingle API: %s\n", s.baseURL)
	fmt.Println(" Database cleaned and ready")
}

func (s *MingleAPISuite) TearDownSuite() {
	if s.client != nil {
		s.client.Disconnect(context.TODO())
		fmt.Println("\n All tests completed")
	}
}

func (s *MingleAPISuite) cleanDatabase() {
	db := s.client.Database("DBMingle")

	collections := []string{"User", "Posts"}

	for _, collName := range collections {
		err := db.Collection(collName).Drop(context.TODO())
		if err != nil {
			s.T().Logf("Note: Collection %s: %v", collName, err)
		} else {
			s.T().Logf("Dropped collection: %s", collName)
		}
	}
}

// ============================================================================
// TC1: User Registration
// ============================================================================
func (s *MingleAPISuite) Test_TC01_UserRegistration() {
	s.T().Log("\n=== TC1: Olga, Nick, Mary, and Nestor register ===")

	for name, user := range s.users {
		body, _ := json.Marshal(user)

		resp, err := http.Post(
			s.baseURL+"/auth/register",
			"application/json",
			bytes.NewBuffer(body),
		)

		s.Require().NoError(err, "Should make request for "+name)

		bodyBytes, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		s.Require().True(
			resp.StatusCode == http.StatusOK || resp.StatusCode == http.StatusCreated,
			"User %s registration failed. Status: %d, Body: %s",
			name, resp.StatusCode, string(bodyBytes),
		)

		var registerResp map[string]interface{}
		json.Unmarshal(bodyBytes, &registerResp)

		if userObj, ok := registerResp["user"].(map[string]interface{}); ok {
			if id, ok := userObj["id"].(string); ok {
				s.userIDs[name] = id
			}
		}

		s.T().Logf(" Registered: %s (ID: %s)", name, s.userIDs[name])
	}
}

// ============================================================================
// TC2: OAuth Token Retrieval
// ============================================================================
func (s *MingleAPISuite) Test_TC02_GetOAuthTokens() {
	s.T().Log("\n=== TC2: Users get OAuth tokens ===")

	for name, user := range s.users {
		credentials := map[string]string{
			"email":    user.Email,
			"password": user.Password,
		}
		body, _ := json.Marshal(credentials)

		resp, err := http.Post(
			s.baseURL+"/auth/login",
			"application/json",
			bytes.NewBuffer(body),
		)

		s.Require().NoError(err)

		bodyBytes, _ := io.ReadAll(resp.Body)
		resp.Body.Close()

		s.Require().Equal(http.StatusOK, resp.StatusCode,
			"Login failed for %s. Status: %d, Body: %s",
			name, resp.StatusCode, string(bodyBytes))

		var tokenResp map[string]interface{}
		err = json.Unmarshal(bodyBytes, &tokenResp)
		s.Require().NoError(err)

		token, ok := tokenResp["token"].(string)
		s.Require().True(ok && token != "", "Token should be returned for "+name)
		s.tokens[name] = token

		if s.userIDs[name] == "" {
			if userObj, ok := tokenResp["user"].(map[string]interface{}); ok {
				if id, ok := userObj["id"].(string); ok {
					s.userIDs[name] = id
				}
			}
		}

		s.T().Logf(" Token retrieved: %s (ID: %s)", name, s.userIDs[name])
	}
}

// ============================================================================
// TC3: Unauthorized Access
// ============================================================================
func (s *MingleAPISuite) Test_TC03_UnauthorizedAccess() {
	s.T().Log("\n=== TC3: Olga tries to access API without token ===")

	req, _ := http.NewRequest("GET", s.baseURL+"/posts/topic/Tech", nil)

	resp, err := http.DefaultClient.Do(req)
	s.Require().NoError(err)

	s.Equal(http.StatusUnauthorized, resp.StatusCode,
		"Should reject unauthorized request")

	resp.Body.Close()
	s.T().Log(" Unauthorized access correctly rejected")
}

// ============================================================================
// TC4: Olga Posts Message
// ============================================================================
func (s *MingleAPISuite) Test_TC04_OlgaPostsMessage() {
	s.T().Log("\n=== TC4: Olga posts message in Tech topic ===")
	s.createPost("Olga", "Tech", "Olga's Tech Post", "AWS goes down.A Lesson learnt")
}

// ============================================================================
// TC5: Nick Posts Message
// ============================================================================
func (s *MingleAPISuite) Test_TC05_NickPostsMessage() {
	s.T().Log("\n=== TC5: Nick posts message in Tech topic ===")
	s.createPost("Nick", "Tech", "Nick's Tech Insights", "Cloud computing is the future")
}

// ============================================================================
// TC6: Mary Posts Message
// ============================================================================
func (s *MingleAPISuite) Test_TC06_MaryPostsMessage() {
	s.T().Log("\n=== TC6: Mary posts message in Tech topic ===")
	s.createPost("Mary", "Tech", "Mary's Tech Thoughts", "Cybersecurity matters")
}

// ============================================================================
// TC7: Browse Posts
// ============================================================================
func (s *MingleAPISuite) Test_TC07_BrowsePosts() {
	s.T().Log("\n=== TC7: Nick and Olga browse Tech topic posts ===")

	nickPosts := s.getPosts("Nick", "Tech")
	olgaPosts := s.getPosts("Olga", "Tech")

	var validNickPosts []Post
	var validOlgaPosts []Post

	for _, post := range nickPosts {
		if post.Owner != nil {
			validNickPosts = append(validNickPosts, post)
		}
	}

	for _, post := range olgaPosts {
		if post.Owner != nil {
			validOlgaPosts = append(validOlgaPosts, post)
		}
	}

	s.Require().Len(validNickPosts, 3, "Nick should see 3 posts in Tech")
	s.Require().Len(validOlgaPosts, 3, "Olga should see 3 posts in Tech")

	for _, post := range validNickPosts {
		s.Equal(0, len(post.Likes), "Post should have 0 likes")
		s.Equal(0, len(post.Dislikes), "Post should have 0 dislikes")
		s.Empty(post.Comments, "Post should have no comments")
	}

	s.T().Log(" All posts visible with zero interactions")
}

// ============================================================================
// TC8: Like Mary's Post
// ============================================================================
func (s *MingleAPISuite) Test_TC08_LikeMaryPost() {
	s.T().Log("\n=== TC8: Nick and Olga like Mary's post ===")

	maryPostID := s.postIDs["Mary"]["Tech"]
	s.Require().NotEmpty(maryPostID, "Mary's post ID should exist")

	s.likePost("Nick", maryPostID)
	s.likePost("Olga", maryPostID)

	s.T().Log(" Nick and Olga liked Mary's post")
}

// ============================================================================
// TC9: Nestor Interactions
// ============================================================================
func (s *MingleAPISuite) Test_TC09_NestorInteractions() {
	s.T().Log("\n=== TC9: Nestor likes Nick's post and dislikes Mary's ===")

	nickPostID := s.postIDs["Nick"]["Tech"]
	maryPostID := s.postIDs["Mary"]["Tech"]

	s.likePost("Nestor", nickPostID)
	s.dislikePost("Nestor", maryPostID)

	s.T().Log(" Nestor's interactions completed")
}

// ============================================================================
// TC10: Verify Interactions
// ============================================================================
func (s *MingleAPISuite) Test_TC10_VerifyInteractions() {
	s.T().Log("\n=== TC10: Nick verifies likes and dislikes ===")

	posts := s.getPosts("Nick", "Tech")

	maryPost := s.findPostByOwner(posts, "Mary")
	nickPost := s.findPostByOwner(posts, "Nick")

	s.Equal(2, len(maryPost.Likes), "Mary should have 2 likes")
	s.Equal(1, len(maryPost.Dislikes), "Mary should have 1 dislike")
	s.Equal(1, len(nickPost.Likes), "Nick should have 1 like")

	s.T().Log(" Interaction counts verified")
}

// ============================================================================
// TC11: Cannot Like Own Post
// ============================================================================
func (s *MingleAPISuite) Test_TC11_CannotLikeOwnPost() {
	s.T().Log("\n=== TC11: Mary tries to like her own post ===")

	maryPostID := s.postIDs["Mary"]["Tech"]

	req, _ := http.NewRequest("PATCH",
		s.baseURL+"/posts/"+maryPostID+"/like", nil)
	req.Header.Set("Authorization", "Bearer "+s.tokens["Mary"])

	resp, err := http.DefaultClient.Do(req)
	s.Require().NoError(err)

	bodyBytes, _ := io.ReadAll(resp.Body)
	resp.Body.Close()

	s.True(
		resp.StatusCode == http.StatusForbidden || resp.StatusCode == http.StatusBadRequest,
		"Should reject own post like. Status: %d, Body: %s",
		resp.StatusCode, string(bodyBytes),
	)

	s.T().Log(" Own post like correctly rejected")
}

// ============================================================================
// TC12: Comments
// ============================================================================
func (s *MingleAPISuite) Test_TC12_CommentsOnMaryPost() {
	s.T().Log("\n=== TC12: Nick and Olga comment on Mary's post ===")

	maryPostID := s.postIDs["Mary"]["Tech"]

	comments := []struct {
		user    string
		content string
	}{
		{"Nick", "Great insights Mary!"},
		{"Olga", "I completely agree"},
		{"Nick", "Very well written"},
		{"Olga", "Thanks for sharing"},
	}

	for _, c := range comments {
		s.commentOnPost(c.user, maryPostID, c.content)
	}

	s.T().Log(" 4 comments added")
}

// ============================================================================
// TC13: Verify Comments
// ============================================================================
func (s *MingleAPISuite) Test_TC13_VerifyComments() {
	s.T().Log("\n=== TC13: Nick verifies comments ===")

	posts := s.getPosts("Nick", "Tech")
	maryPost := s.findPostByOwner(posts, "Mary")

	s.GreaterOrEqual(len(maryPost.Comments), 4,
		"Mary's post should have at least 4 comments")

	s.T().Logf(" Verified %d comments", len(maryPost.Comments))
}

// ============================================================================
// TC14: Nestor Posts Health
// ============================================================================
func (s *MingleAPISuite) Test_TC14_NestorPostsHealth() {
	s.T().Log("\n=== TC14: Nestor posts in Health topic ===")
	s.createPost("Nestor", "Health", "Health Tips", "Exercise daily")
}

// ============================================================================
// TC15: Mary Browses Health
// ============================================================================
func (s *MingleAPISuite) Test_TC15_MaryBrowsesHealth() {
	s.T().Log("\n=== TC15: Mary browses Health topic ===")

	posts := s.getPosts("Mary", "Health")
	s.Require().Len(posts, 1, "Should see only Nestor's post")
	s.Equal("Nestor", posts[0].Owner.Name, "Post should be from Nestor")

	s.T().Log(" Mary sees Nestor's post")
}

// ============================================================================
// TC16: Mary Comments
// ============================================================================
func (s *MingleAPISuite) Test_TC16_MaryCommentsOnNestor() {
	s.T().Log("\n=== TC16: Mary comments on Nestor's post ===")

	nestorPostID := s.postIDs["Nestor"]["Health"]
	s.commentOnPost("Mary", nestorPostID, "Great advice!")

	s.T().Log(" Mary commented")
}

// ============================================================================
// TC17: Expired Post
// ============================================================================
func (s *MingleAPISuite) Test_TC17_ExpiredPostInteraction() {
	s.T().Log("\n=== TC17: Try to interact with expired post ===")

	// Create short-lived post
	postData := map[string]interface{}{
		"title":             "Expiring",
		"topic":             "Health",
		"message":           "Will expire",
		"expirationMinutes": 0.0333,
	}

	postID := s.createPostRaw("Nestor", postData)

	time.Sleep(3 * time.Second)

	req, _ := http.NewRequest("PATCH",
		s.baseURL+"/posts/"+postID+"/dislike", nil)
	req.Header.Set("Authorization", "Bearer "+s.tokens["Mary"])

	resp, err := http.DefaultClient.Do(req)
	s.Require().NoError(err)

	bodyBytes, _ := io.ReadAll(resp.Body)
	resp.Body.Close()

	s.True(
		resp.StatusCode == http.StatusForbidden || resp.StatusCode == http.StatusBadRequest,
		"Should reject expired post interaction. Status: %d, Body: %s",
		resp.StatusCode, string(bodyBytes),
	)

	s.T().Log(" Expired post interaction rejected")
}

// ============================================================================
// TC18: Nestor Browses Health
// ============================================================================
func (s *MingleAPISuite) Test_TC18_NestorBrowsesHealth() {
	s.T().Log("\n=== TC18: Nestor browses Health topic ===")

	posts := s.getPosts("Nestor", "Health")

	var found bool
	for _, post := range posts {
		if post.Owner != nil && post.Owner.Name == "Nestor" && post.Title == "Health Tips" {
			s.GreaterOrEqual(len(post.Comments), 1, "Should have comment")
			found = true
			break
		}
	}

	s.True(found, "Should find Nestor's post with comment")
	s.T().Log(" Nestor sees his post with comment")
}

// ============================================================================
// TC19: Empty Sports Topic
// ============================================================================
func (s *MingleAPISuite) Test_TC19_BrowseEmptySports() {
	s.T().Log("\n=== TC19: Browse expired Sports messages ===")

	req, _ := http.NewRequest("GET", s.baseURL+"/posts/topic/Sport/expired", nil)
	req.Header.Set("Authorization", "Bearer "+s.tokens["Nick"])

	resp, err := http.DefaultClient.Do(req)
	s.Require().NoError(err)

	var posts []Post
	json.NewDecoder(resp.Body).Decode(&posts)
	resp.Body.Close()

	s.Empty(posts, "Sport should be empty")
	s.T().Log(" Sports topic is empty")
}

// ============================================================================
// TC20: Most Active Post
// ============================================================================
func (s *MingleAPISuite) Test_TC20_MostActivePost() {
	s.T().Log("\n=== TC20: Query most active post in Tech ===")

	req, _ := http.NewRequest("GET", s.baseURL+"/posts/topic/Tech/most-active", nil)
	req.Header.Set("Authorization", "Bearer "+s.tokens["Nestor"])

	resp, err := http.DefaultClient.Do(req)
	s.Require().NoError(err)

	bodyBytes, _ := io.ReadAll(resp.Body)
	resp.Body.Close()

	s.Equal(http.StatusOK, resp.StatusCode, "Should return most active")

	var wrappedResp struct {
		Success bool `json:"success"`
		Post    Post `json:"post"`
	}
	err = json.Unmarshal(bodyBytes, &wrappedResp)
	s.Require().NoError(err, "Failed to parse: %s", string(bodyBytes))

	post := wrappedResp.Post

	s.Require().NotNil(post.Owner, "Post should have owner")
	s.Equal("Mary", post.Owner.Name, "Mary's post should be most active")
	s.T().Logf(" Most active: %s (Likes: %d, Dislikes: %d)",
		post.Owner.Name, len(post.Likes), len(post.Dislikes))
}

// ============================================================================
// TC21: Get All Users
// ============================================================================

func (s *MingleAPISuite) Test_TC21_ShowUsers() {
	s.T().Log("\n=== TC21: Nestor tries to view all users ===")
	req, _ := http.NewRequest("GET", s.baseURL+"/user", nil)

	req.Header.Set("authorization", "Bearer "+s.tokens["Nestor"])

	resp, _ := http.DefaultClient.Do(req)

	BodyBytes, _ := io.ReadAll(resp.Body)
	resp.Body.Close()

	var wrappedResp struct {
		Success bool   `json:"success"`
		User    []User `json:"users"`
	}

	err := json.Unmarshal(BodyBytes, &wrappedResp)

	s.Require().NoError(err, "Failed to parse response %s", string(BodyBytes))

	var NumUsers []User
	NumUsers = append(NumUsers, wrappedResp.User...)

	s.Require().Len(NumUsers, 4, "Number of users should be 4")

}

// ============================================================================
// TC22: Get One User
// ============================================================================

func (s *MingleAPISuite) Test_TC22_GetOneUser() {
	s.T().Log("\n=== TC22: Olga attempts to get one user ===")

	req, _ := http.NewRequest("GET", s.baseURL+"/user/"+s.userIDs["Nick"], nil)

	req.Header.Set("authorization", "Bearer "+s.tokens["Olga"])

	resp, _ := http.DefaultClient.Do(req)

	BodyBytes, _ := io.ReadAll(resp.Body)
	resp.Body.Close()

	var wrappedResp struct {
		Success bool `json:"success"`
		User    User `json:"user"`
	}
	err := json.Unmarshal(BodyBytes, &wrappedResp)
	fmt.Println(string(BodyBytes))

	s.Require().NoError(err, "Failed to parse Response %s", string(BodyBytes))

	s.Equal("Nick", wrappedResp.User.Name, "Expected to Get Nick")
}

// ============================================================================
// TC23: Register User with short password
// ============================================================================
func (s *MingleAPISuite) Test_TC23_RegisterBadUser() {
	s.T().Log("\n=== TC23: User attempts to register with short password ===")

	User := User{Name: "dummy", Email: "false@mingle.com", Password: "short"}

	body, _ := json.Marshal(User)

	resp, err := http.Post(
		s.baseURL+"/auth/register",
		"application/json",
		bytes.NewBuffer(body),
	)

	s.Require().NoError(err, "Should make request for "+User.Name)

	bodyBytes, _ := io.ReadAll(resp.Body)
	resp.Body.Close()
	fmt.Println(string(bodyBytes))
	s.Require().True(
		resp.StatusCode != http.StatusOK || resp.StatusCode == http.StatusCreated,
		"Expected User  %s registration failed. Status: %d, Body: %s",
		User.Name, resp.StatusCode, string(bodyBytes),
	)

}

// ============================================================================
// TC23: Register User with short password
// ============================================================================
func (s *MingleAPISuite) Test_TC24_RegisterBadUserTwo() {
	s.T().Log("\n=== TC23: User attempts to register with a long name ===")

	LongName := strings.Repeat("a", 257)
	User := User{Name: LongName, Email: "false2@mingle.com", Password: "PasswordOk"}

	body, _ := json.Marshal(User)

	resp, err := http.Post(
		s.baseURL+"/auth/register",
		"application/json",
		bytes.NewBuffer(body),
	)

	s.Require().NoError(err, "Should make request for "+User.Name)

	bodyBytes, _ := io.ReadAll(resp.Body)
	resp.Body.Close()
	fmt.Println(string(bodyBytes))
	s.Require().True(
		resp.StatusCode != http.StatusOK || resp.StatusCode == http.StatusCreated,
		"Expected User  %s registration failed. Status: %d, Body: %s",
		User.Name, resp.StatusCode, string(bodyBytes),
	)

}

// ============================================================================
// Helper Methods
// ============================================================================

func (s *MingleAPISuite) createPost(user, topic, title, messageBody string) {
	postData := map[string]interface{}{
		"title":   title,
		"topic":   topic,
		"message": messageBody,
		"user_id": s.userIDs[user],
	}

	postID := s.createPostRaw(user, postData)
	s.postIDs[user][topic] = postID
	s.T().Logf(" %s posted in %s", user, topic)
}

func (s *MingleAPISuite) createPostRaw(user string, postData map[string]interface{}) string {
	body, _ := json.Marshal(postData)
	req, _ := http.NewRequest("POST", s.baseURL+"/posts", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.tokens[user])

	resp, err := http.DefaultClient.Do(req)
	s.Require().NoError(err)

	bodyBytes, _ := io.ReadAll(resp.Body)
	resp.Body.Close()

	s.Require().True(
		resp.StatusCode == http.StatusOK || resp.StatusCode == http.StatusCreated,
		"Post creation failed. Status: %d, Body: %s",
		resp.StatusCode, string(bodyBytes),
	)

	var result map[string]interface{}
	json.Unmarshal(bodyBytes, &result)

	if post, ok := result["post"].(map[string]interface{}); ok {
		if id, ok := post["_id"].(string); ok {
			return id
		}
		if id, ok := post["id"].(string); ok {
			return id
		}
	}
	if id, ok := result["_id"].(string); ok {
		return id
	}
	if id, ok := result["id"].(string); ok {
		return id
	}

	s.T().Fatalf("Could not extract post ID from: %s", string(bodyBytes))
	return ""
}
func (s *MingleAPISuite) getPosts(user, topic string) []Post {
	req, _ := http.NewRequest("GET", s.baseURL+"/posts/topic/"+topic, nil)
	req.Header.Set("Authorization", "Bearer "+s.tokens[user])

	resp, err := http.DefaultClient.Do(req)
	s.Require().NoError(err)

	bodyBytes, _ := io.ReadAll(resp.Body)
	resp.Body.Close()

	var wrappedResp struct {
		Success bool   `json:"success"`
		Count   int    `json:"count"`
		Posts   []Post `json:"posts"`
	}

	err = json.Unmarshal(bodyBytes, &wrappedResp)
	s.Require().NoError(err, "Failed to parse response: %s", string(bodyBytes))

	return wrappedResp.Posts
}

func (s *MingleAPISuite) likePost(user, postID string) {
	req, _ := http.NewRequest("PATCH", s.baseURL+"/posts/"+postID+"/like", nil)
	req.Header.Set("Authorization", "Bearer "+s.tokens[user])

	resp, err := http.DefaultClient.Do(req)
	s.Require().NoError(err)

	bodyBytes, _ := io.ReadAll(resp.Body)
	resp.Body.Close()

	s.Require().Equal(http.StatusOK, resp.StatusCode,
		"Like failed. Status: %d, Body: %s", resp.StatusCode, string(bodyBytes))
}

func (s *MingleAPISuite) dislikePost(user, postID string) {
	req, _ := http.NewRequest("PATCH", s.baseURL+"/posts/"+postID+"/dislike", nil)
	req.Header.Set("Authorization", "Bearer "+s.tokens[user])

	resp, err := http.DefaultClient.Do(req)
	s.Require().NoError(err)
	resp.Body.Close()
}

func (s *MingleAPISuite) commentOnPost(user, postID, content string) {
	commentData := map[string]string{"message": content}
	body, _ := json.Marshal(commentData)

	req, _ := http.NewRequest("PATCH",
		s.baseURL+"/posts/"+postID+"/addcomment",
		bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.tokens[user])

	resp, _ := http.DefaultClient.Do(req)
	resp.Body.Close()
}

func (s *MingleAPISuite) findPostByOwner(posts []Post, ownerName string) Post {
	for _, post := range posts {
		if post.Owner != nil && post.Owner.Name == ownerName {
			return post
		}
	}
	return Post{}
}
func TestMingleAPISuite(t *testing.T) {
	suite.Run(t, new(MingleAPISuite))
}
