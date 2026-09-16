##ReabHub

ReadHub is a web-based book platform that allows users to explore books, read available eBooks , manage their library , track readingprogress, and interact with books throughfeatures such as reviews and book exchange.

The project was developed as a group Software Development project and is usedas the system under test for the Software Testing final project.

#Main features
-User registration and login
-Explore book & search
-Book library management
-Reading available eBooks
-Reading progess tracking 
-Book wishlist/status management
-Book exchange functionality
-User profile page
-Book reviews and ratings 
-Book categories


##Technologies Used
-Python
-Flask
-SQLite
-HTML5
-CSS3
-JavaScript
-Pytest-cov
-Pytest
-Git and GitHub


##Project Structure

readhub/
│
├── backend/
│   ├── main.py
│   └── database.sql
│
├── html/
│   ├── index.html
│   ├── explore.html
│   ├── library.html
│   ├── profile.html
│   ├── exchange.html
│   └── reader.html
│
├── static/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── pdf/
│
├── test/
│   ├── unit/
│   │   └── test_auth.py
│   ├── integration/
│   │   └── test_library.py
│   └── e2e/
│       └── test_profile.py
│
├── readhub.db
└── README.md

(copied from terminal)

##Installation
1.python3.12 
2.Install required packages
  pip install flask pytest pytest-cov werkzeug
3.start flask application 
  from the project root , run:
  python backend/main.py
  the application runs locally at browser: http://127.0.0.1:5001 


##Running Automated Tests
  1.Unit Tests , Run: python -m pytest test/unit 
  located in test/unit/

2.Integration tests , Run: python -m pytest test/integration
  located in: test/integration/

3.End-to-End tests
    Run:python -m pytest test/e2e

4.Run all tests 
Run: python -m pytest test

5.Run Test with Coverage
python -m pytest test --cov=backend --cov-report=term-missing --cov-branch
The final test execution achieved:
15 passed
59% line/branch coverage

##Software Testing
Functional testing
Unit testing
Integration test
system level testing
Equivalence Partitioning
Boundary value Analysis
State Transition testing
Automated regression testing
static code checking
Defect identification and retesting
code coverage analysis


##Defect management

Defect identified during testing are documented with:

Defect id 
summary
steps to reproduce 
expected result
actual result
severity
priority
status
Retest result
Visual evidence where applicable ( screen shots)

##Repository
ReadHub source code and testing work are maintained on GitHub:
https://github.com/AyushaSubedi23/readhub.git

##Project purpose
The purpose of the software testing project is to evaluate funtional quality of the ReadHub application throughstructured test planning , test case design , automated testing, defect reporting,and coverage analysis.

test plan
test cases
execution logs
defect reports
visual evidence