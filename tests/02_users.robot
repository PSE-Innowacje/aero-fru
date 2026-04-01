*** Settings ***
Documentation    Tests for Users API (/api/users)
Resource         resources/common.resource
Suite Setup      Setup Users Suite

*** Keywords ***
Setup Users Suite
    Create Auth Session    admin    ${ADMIN_EMAIL}
    Create Auth Session    pilot    ${PILOT_EMAIL}

*** Test Cases ***
# ---- GET endpoints ----

List All Users As Admin
    [Documentation]    GET /api/users - admin can list users
    ${resp}=    GET On Session    admin    /api/users    expected_status=200
    ${length}=    Get Length    ${resp.json()}
    Should Be True    ${length} >= 4    Should have at least 4 test users

Get User By Id As Admin
    [Documentation]    GET /api/users/901 - admin can get user detail
    ${resp}=    GET On Session    admin    /api/users/901    expected_status=200
    Should Be Equal    ${resp.json()}[email]    ${ADMIN_EMAIL}
    Should Be Equal    ${resp.json()}[firstName]    Admin
    Should Be Equal    ${resp.json()}[lastName]    Testowy
    Should Be Equal    ${resp.json()}[roleName]    Administrator

Get Nonexistent User Returns 404
    [Documentation]    GET /api/users/99999 - returns 404
    ${resp}=    GET On Session    admin    /api/users/99999    expected_status=404

List Users As Pilot
    [Documentation]    GET /api/users - pilot (authenticated) can list users
    ${resp}=    GET On Session    pilot    /api/users    expected_status=200

# ---- POST endpoint ----

Create User As Admin
    [Documentation]    POST /api/users - admin creates a new user
    ${unique}=    Evaluate    int(__import__('time').time() * 1000) % 100000
    ${body}=    Create Dictionary
    ...    firstName=Nowy
    ...    lastName=Uzytkownik
    ...    email=nowy${unique}@test.pl
    ...    password=NoweHaslo123
    ...    roleId=${1}
    ${resp}=    POST On Session    admin    /api/users    json=${body}    expected_status=201
    Should Be Equal    ${resp.json()}[firstName]    Nowy
    Should Be Equal    ${resp.json()}[lastName]    Uzytkownik
    Should Be Equal    ${resp.json()}[roleName]    Administrator
    Set Suite Variable    ${CREATED_USER_ID}    ${resp.json()}[id]

Create User With Duplicate Email Returns Error
    [Documentation]    POST /api/users - duplicate email should fail
    ${body}=    Create Dictionary
    ...    firstName=Dup
    ...    lastName=User
    ...    email=${ADMIN_EMAIL}
    ...    password=DupPassword123
    ...    roleId=${1}
    ${resp}=    POST On Session    admin    /api/users    json=${body}    expected_status=any
    Should Be True    ${resp.status_code} >= 400

Create User With Invalid Email Returns 400
    [Documentation]    POST /api/users - invalid email validation
    ${body}=    Create Dictionary
    ...    firstName=Bad
    ...    lastName=Email
    ...    email=not-valid
    ...    password=Password123
    ...    roleId=${1}
    ${resp}=    POST On Session    admin    /api/users    json=${body}    expected_status=400

Create User With Short Password Returns 400
    [Documentation]    POST /api/users - password too short
    ${body}=    Create Dictionary
    ...    firstName=Short
    ...    lastName=Pass
    ...    email=shortpass@test.pl
    ...    password=abc
    ...    roleId=${1}
    ${resp}=    POST On Session    admin    /api/users    json=${body}    expected_status=400

Create User As Pilot Returns 401
    [Documentation]    POST /api/users - pilot cannot create users (returns 401)
    ${body}=    Create Dictionary
    ...    firstName=Forbidden
    ...    lastName=User
    ...    email=forbidden@test.pl
    ...    password=Password123
    ...    roleId=${1}
    ${resp}=    POST On Session    pilot    /api/users    json=${body}    expected_status=401

# ---- PUT endpoint ----

Update User As Admin
    [Documentation]    PUT /api/users/901 - admin updates user
    ${body}=    Create Dictionary
    ...    firstName=AdminUpdated
    ...    lastName=Testowy
    ...    email=${ADMIN_EMAIL}
    ...    roleId=${1}
    ${resp}=    PUT On Session    admin    /api/users/901    json=${body}    expected_status=200
    Should Be Equal    ${resp.json()}[firstName]    AdminUpdated
    # Restore original
    ${restore}=    Create Dictionary
    ...    firstName=Admin
    ...    lastName=Testowy
    ...    email=${ADMIN_EMAIL}
    ...    roleId=${1}
    PUT On Session    admin    /api/users/901    json=${restore}    expected_status=200

Update User As Pilot Returns 401
    [Documentation]    PUT /api/users - pilot cannot update users (returns 401)
    ${body}=    Create Dictionary
    ...    firstName=Hack
    ...    lastName=Attempt
    ...    email=${ADMIN_EMAIL}
    ...    roleId=${1}
    ${resp}=    PUT On Session    pilot    /api/users/901    json=${body}    expected_status=401
