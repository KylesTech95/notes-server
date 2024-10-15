## The Note-taking Module

**Languages**:
1. HTML
2. CSS
3. Javascript

**Framework**:
1. NodeJs

**Database**:
1. PostgreSql

## About the project

This application enables the user to write notes on a limited & secure session. User login is not required because each session's id is associated with the current date-time the session is create, then hashed before storing into the database.
Sessions expire 30 minutes after the session begins.
upon expiration, database functions **DELETE** rows of the expired user's id within the users table.
In addition, notes are deleted 30 minutes after a note is created.

## Symmetric encryption

<em>Authentication Encryption Standard (AES) 256</em>
Notes are encrypted in the server before storing into the database & decrypted in the server after retrieving encrypted data.
