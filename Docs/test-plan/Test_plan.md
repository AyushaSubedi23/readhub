##Test Plan

The objective of testing was to verify that the ReadHub web application meets its functional requirements and behaves correctly under valid and invalid conditions. Testing focused on the main user functions,including account registration and login , book library management, reading progress,  profile access, and book status management.  

##Test scope
The scope included functional testing of the Flask backend APIs and selected system level page functionality. Tests covered valid inputs, invalid inputs , boundary conditions, state changes, error handling and regression testing after defect fixes. Automated tests were organized into unit,integration,and system/E2E-style tests.

##Testing Levels
Unit Testing: Individual backend functions and authentication-related behaviour were tested independently.
For example: valid login,incorrect passwords,and invalid registration data were tested .
Integration Testing: API operations were tested together with the SQLite database to verify that data was correctly created,updated,retrieved and deleted.
System/E2E Testing: The application was tested at system level to verify that important application routes, such as the profile page , were accessible and returned the expected response.

##Test Techniques:
 Equivalence Partitioning (EP): Inputs were divided into valid  and invalid groups. For example, a valid password and a password that does not meet the application's requirements were treated as different inpiut classes.
 BoundaryAnalysis(BVA): Boundary values were tested where limit existed.For reading progress, tests included the exact total number of pages and a current page value greater than the total.
 State Transition Testing: This was used for functions where the application changes from one state to another ,. for example , a book can change  from a wishlist status to completed status.

 ##Testing Tools:
 Python 3.12.8, Flask ,Pytest 9.1.1,Pytest-Cov 7.1.0,SQLite,and py_compile were used during testing. Git and GitHub were used for version control and maintaining the testing work.

 Entry Criteria: 
 Testing began when the application could be started locally at browser, the database was available , the required Python packages were installed, and the automated test files were available.

 Exit Criteria:
 Testing was considered completed  when all planned automated tests had been executed , defects identified during testing had been fixed  and retested where applicable , regression testing had been performed, and test results and coverage had been recorded.
