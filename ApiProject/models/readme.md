# Post Schema

Data model for posts on the Mingle wall.

## Features

- **Multi-topic support**: Posts can have one or more topics (Politics, Health, Sport, Tech)
- **Auto-expiration**: Posts automatically become "Expired" after expiration time
- **Virtual properties**: Status, counts, and time remaining computed on-the-fly
- **User interactions**: Supports likes, dislikes, and comments

## Schema Fields

| Field | Type | Description |
|-------|------|-------------|
| title | String | Post title |
| topic | [String] | One or more topics |
| body | String | Message body (max 400 chars) |
| expiration | Date | When post expires |
| owner | ObjectId | User who created the post |
| likes | [ObjectId] | Users who liked |
| dislikes | [ObjectId] | Users who disliked |
| comments | [Object] | Comments with user, text, timestamp |

## Virtual Properties

Computed automatically, not stored in database:
- `status`: "Live" or "Expired"
- `likesCount`, `dislikesCount`, `commentsCount`
- `timeLeft`, `timeLeftFormatted`

## Requirements

Fulfills Phase C requirements for Mingle RESTful APIs.