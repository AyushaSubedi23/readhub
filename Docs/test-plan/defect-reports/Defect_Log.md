#Defect Log


DEF-01:Registration endpoint returned 404,,Severity:High , status : fixed
DEF-03:Deleting non-existent book returned 200 , Severity:Medium , status : fixed
DEF-04:Profile page returned 500 , severity: Medium,Status :fixed

##DEF-01
Expected: Valid registration should return 200.  
Actual:Returned 404.  
Fix:Added the missing registration route.  
Retest:Passed.

DEF-03
Expected: Non-existent book should return 404.  
Actual: Returned 200.  
Fix:Added a book-existence check.  
Retest:Passed.

##DEF-04
Expected:Profile page should return 200.  
Actual:Returned 500 because the template path was incorrect.  
Fix:Corrected the template path.  
Retest:Passed.