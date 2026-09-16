##Test Cases 
The following test cases were designed to verify the main functional requirements of the ReadHub application .The test cover valid and invalid inputs, boundary conditions, error handling, and state transitions.

##TC-01 -Register Valid USER 
Test case ID     : TC-01
Objective        :Verify that a user can register with valid information.
Preconditions    :ReadHub application is running.
Test Data        :Name: Test User , Email: unique email address, password:"test123" ,Confirm Password : "test123"
Expected Result  : The account is created successfully and the reponse contains a token ans user information.
Actual Result    :The account was created successfukky and the reponse contained a token and user information.
Status           :PASS
Severity         :Medium
Testing Technique: Equivalence partitioning (EP)

##Steps

1.Start the readHub application.
2.Send a PST request to /api/signup.
3.Enter a valid name.
4.Enter a unique email address.
5.Enter "test123" as the password.
6.Enter "test123"as the confirmation password.
7.Submit the request.
8.Check the response.

##Result
The account was created successfully and the expected token and user information were returned.

##TC-02 -Login with Valid  Credentials
Test case ID     : TC-02
Objective        :Verify that a user can log in using valid credentials.
Preconditions    :A valid user account exists.
Test Data        : Email:"testuser124@example.com", Password: "test123"
Expected Result  : Login succeeds and HTTP 200 is returned.
Actual Result    :HTTP 200 was returned.
Status           :PASS
Severity         :High
Testing Technique: Equivalence partitioning (EP)

##Steps
1.Start the ReadHub application.
2.Send a POST request to/api/login.
3.Enter the registered email address.
4.Enter the correct password.
5.Submit the request .
6.Check the HTTP reponse.

##Result
HTTP 200 was returned and the login request was successful.

##TC-03 -Add Book to library
Test case ID     : TC-03
Objective        :Verify that a book can be added to the user's library.
Preconditions    :The application and database are available.
Test Data        :unique book title: Author; Cover URL: empty, Status:"wishlist"
Expected Result  :Book is added successfully and databasHTTP 201 is returned.
Actual Result    :Book was added successfully and HTTP 201 was returned.
Status           :PASS
Severity         :Medium
Testing Technique: Equivalence partitioning (EP)

##Steps
1.Start the ReadHub application.
2.Send a  request to the library API to add a book.
3.Enter  a unique book title.
4.Enter "Test Author" as the author".
5.set the status to "wishlist".
6.Submit the request .
7.Check the HTTP reponse.

#Result
The book was successfully added to the library and HTTP 201 was returned.

##TC-04 -Save Reading Progress
Test case ID     : TC-04
Objective        :Verify that reading progress is saved correctly.
Preconditions    :The book exists in the database.
Test Data        :Book: Progress Test Book, current page :"5", Total Pages:"10"
Expected Result  :Reading progress is saved and calculated as 50%.
Actual Result    :Current page 5 and total pages 10 were saved and progress was calculated as 50%.
Status           :PASS
Severity         :Medium
Testing Technique: Equivalence partitioning (EP)

##Steps
1.Start the ReadHub application.
2.Add or identify the progress test book.
3.Send a request to update reading progress.
4.Enter current page"5"
5.Enter total pages "10"
6.Submit the request .
7.Check the returned progress values.


##Result

The progress was saved correctly with current page 5, total pages 10, and 50% progress.


##TC-05 -Save  Progress for non-existent Book
Test case ID     : TC-05
Objective        :Verify that reading progress cannot be sabed for a book that does not exist.
Preconditions    :The application is running and the specified book ID does not exist.
Test Data        :Book:"book does not exist", Current Page ;"5" , Total Pages:"10"
Expected Result  :The system returns HTTP 404 because the book does not exist.
Actual Result    :HTTP 404 was returned .
Status           :PASS
Severity         :Medium
Testing Technique: Equivalence partitioning (EP)

##Steps
1.Start the ReadHub application.
2.Use a book ID that does not exist .
3.Send a request to save reading progress.
4.Enter current page"5"
5.Enter total pages "10"
6.Submit the request .
7.Check the HTTP response.

##Result
The system correctly returned HTTP 404 for the non-existent book.

##TC-06-Current Page Greater Than TOtal Pages
Test case ID     : TC-06
Objective        :Verify that the current reading page cannot exceed the total number of pages.
Preconditions    :A book exists in the database.
Test Data        :current page:"15", total pages :"10"
Expected Result  :The current page is limitedto 10 and reading progress is 100%.
Actual Result    :The current page was limited 10 and reading progress was 100%.
Status           :PASS
Severity         :High
Testing Technique: Boundary Value Analysis (BVA)

##Steps
1.Start the ReadHub application.
2.Select an existing book.
3.Send a request to update reading progress
4.Enter current page"15"
5.Enter total pages "10"
6.Submit the request .
7.Check the return progess values.

##result
The system limited the current page to 10 and calculated progress as 100%

##TC -07 - Reject Invalid Book Status

Test case ID     : TC-07
Objective        :Verify that an invalid book status is rejected .
Preconditions    :A book exists in the user's library.
Test Data        :status:" invalid_status"
Expected Result  :The system rejects invalid status and returns HTTP 400.
Actual Result    :HTTP 400 was returned.
Status           :PASS
Severity         :Medium
Testing Technique:Equivalence Partitioning(EP)

##Steps
1.Start the ReadHub application.
2.Select an existing library book.
3.Send a request to update book status.
4.Enter "invalid_status" as status'
5.Submit the request .
6.check the HTTP response.

##Result
The invalid status was rejected and HTTP 400 WAS returned.

##TC -08 Add Book Without Title

Test case ID     : TC-08
Objective        :Verify that a book cannot be added without a title.
Preconditions    :The readHub application is running
Test Data        :Title:empty , Author: "Test Author"
Expected Result  :The system rejects the request and returns HTTP 400.
Actual Result    :HTTP 400 was returned.
Status           :PASS
Severity         :Medium
Testing Technique:Equivalence Partitioning(EP)

##Steps
1.Start the ReadHub application.
2.Send a request to add a new book.
3.Leave the title field empty.
4.Enter "Test Author" as the author.
5.Submit the request .
6.check the HTTP response.

##Result
The request was rejected and HTTP 400 was returned.

##TC -09 Add Book Without Author

Test case ID     : TC-09
Objective        :Verify that a book cannot be added without an Author.
Preconditions    :The readHub application is running
Test Data        :Title:" No Author Test Book"; Author:empty
Expected Result  :The system rejects the request and returns HTTP 400.
Actual Result    :HTTP 400 was returned.
Status           :PASS
Severity         :Medium
Testing Technique:Equivalence Partitioning(EP)

##Steps
1.Start the ReadHub application.
2.Send a request to add a new book.
3.Enter "No Author Test Book " as the title.
4.Leave the Author field empty.
5.Submit the request .
6.check the HTTP response.

##Result

The request was rejected and HTTP 400 was returned.

##TC-10 -Delete Non-existent Book

Test case ID     : TC-10
Objective        :Verify that deleting a non-existing book returns an appropriate error.
Preconditions    :The application is running and the selected book ID does not exist.
Test Data        :Book ID :"999999"
Expected Result  :The system returns HTTP 404 and indicates that the book was not found.
Actual Result    :HTTP 400 and the expected error message were returned.
Status           :PASS
Severity         :Medium
Testing Technique:Equivalence Partitioning(EP)

##Steps
1.Start the ReadHub application.
2.Use book ID "999999".
3.Sent a DELETE request to "/api/library/999999".
4.Check the HTTP reponse.
5.Check the returned error message .

#Result 
The system returned HTTP 404 with the expected book not found message .

##TC-11 - Profile Page Availability

Test case ID     : TC-11
Objective        :Verify that the profile page is accessible.
Preconditions    :The ReadHub application is running .
Test Data        :GET request to "/profile"
Expected Result  :The profile page loads successfully and HTTP 200 is returned .
Actual Result    :HTTP 200 was returned and the profile page was accessible.
Status           :PASS
Severity         :Medium
Testing Technique:Equivalence Partitioning(EP)

##Steps
1.Start the ReadHub application.
2.Send a GET request to"/profile".
3.Check the HTTP reponse.
4.Verify that profile page is returned.

##Result 

The profile page was accessible and HTTP 200 was returned.


##TC -12 - Login with Incorrect Password

Test case ID     : TC-12
Objective        :Verify that login fails when an incorrect password is provided.
Preconditions    :A valid user account exists.
Test Data        :Email: "testuser124@example.com"; password: "wrongpassword"
Expected Result  :Login is rejected and HTTP 401 is eturned .
Actual Result    :HTTP 401 was returned.
Status           :PASS
Severity         :High
Testing Technique:Equivalence Partitioning(EP)

##Steps
1.Start the ReadHub application.
2.Send a POST request to"/api/login".
3.Enter the registered email address.
4.Enter "wrongpassword"as the password.
5.Submit the request .
6.check the HTTP response.

#RESULT

The incorrect password was rejected and HTTP 410 was returned.


##TC -13- Registration with short password

Test case ID     : TC-13
Objective        :Verify that registration rejects a password below the required length.
Preconditions    :The ReadHub application is running
Test Data        :Name: Short Password User; Email: "shortpassword2026@example.com ; password: "123"; confirmpassword: "123"
Expected Result  :Registration is rejected and HTTP 400 is returned .
Actual Result    :HTTP 400 was returned.
Status           :PASS
Severity         :Medium
Testing Technique:Equivalence Partitioning(EP)

##Steps
1.Start the ReadHub application.
2.Send a POST request to"/api/login".
3.Enter the test email address.
4.Enter "123" as the password.
5.Enter "123" as the confirmation password .
5.Submit the request .
6.check the HTTP response.

##Result

The short password was rejected and HTTP 400 was returned.

##TC -14 -Reading progress at Exact Total Pages 
Test case ID     : TC-14
Objective        :Verify reading progresss when the current page is exactly rqual to the total number of pages.
Preconditions    :A book exists in the database.
Test Data        :Current Page:"10" , total pages: "10"
Expected Result  :The progress as accepted and calculated as 100%.
Actual Result    :The current page 10 and total pages 10 were accepted and progress was 100%.
Status           :PASS
Severity         :Medium 
Testing Technique:Boundary Value Analysis(BVA)

##Steps
1.Start the ReadHub application.
2.Select an existing book.
3.send a request to update reading progress.
4.Enter currrent page "10".
5.Enter total pages"10"
6.Submit the request.
7.check the returned progress values.

##Result 
The system accepted the boundary value and calculated progress as 100%.


##TC -15 -Update Book Status to completed
Test case ID     : TC-15
Objective        :Verify that a book can change from wishlist status to completes status.
Preconditions    :A book exists in the user's library
Test Data        : Initial status: "wishlist" , New status:"completed"
Expected Result  :The book status changes to "completed" and the updated status can be retrieved.
Actual Result    :The book status changes to "completed" and was confirmed through retrieval.
Status           :PASS
Severity         :Medium 
Testing Technique:State Transition tetsing

##Steps
1.Start the ReadHub application.
2.Add or select a book in the user's library.
3.set the book status to"wishlist".
4.send a request to updated the book status.
5.change the status to "completed"
6.Submit the request.
7.Retrieve the book information.
8.Check the current status.

##Result

The book successfully transitioned from " wishlist" to "completed", and the updated status was confirmed.


##Test case summary



Total Test Cases:15 
passed:15 
Failed:0
Pass Rate:100% 

The latest automated test execution completed with 15 passed tests and no failed tests. The measured line/branch coverage was 59%.












