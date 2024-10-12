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

This application enables the user to write notes on a limited & secure session. User login is not required because the session is stored in the cookie.
The user's id is based off of the current date-time, which is encrypted, compared against the database for duplicates, & stored in the session & database.
Each session is set to last 30 minutes (1800000 ms).
A custome middleware function runs a timer that expires close to the cookie's maxAge. Upon expiration, the user's id & notes are deleted from the database & a
new session begins.

Being on a limited session, each user can post & fetch their own notes by id. 

