*** Settings ***
Documentation    Tests for Authentication API (/api/auth)
Resource         resources/common.resource
Suite Setup      Create Session    anon    ${BASE_URL}    verify=${False}

*** Test Cases ***
Login With Valid Admin Credentials
    [Documentation]    POST /api/auth/login - valid admin login
    ${body}=    Create Dictionary    email=${ADMIN_EMAIL}    password=${TEST_PASSWORD}
    ${resp}=    POST On Session    anon    /api/auth/login    json=${body}    expected_status=200
    Dictionary Should Contain Key    ${resp.json()}    token
    Should Be Equal    ${resp.json()}[email]    ${ADMIN_EMAIL}
    Should Be Equal    ${resp.json()}[role]     Administrator

Login With Valid Planer Credentials
    [Documentation]    POST /api/auth/login - valid planer login
    ${body}=    Create Dictionary    email=${PLANER_EMAIL}    password=${TEST_PASSWORD}
    ${resp}=    POST On Session    anon    /api/auth/login    json=${body}    expected_status=200
    Dictionary Should Contain Key    ${resp.json()}    token
    Should Be Equal    ${resp.json()}[role]    Osoba planująca

Login With Valid Nadzorca Credentials
    [Documentation]    POST /api/auth/login - valid nadzorca login
    ${body}=    Create Dictionary    email=${NADZORCA_EMAIL}    password=${TEST_PASSWORD}
    ${resp}=    POST On Session    anon    /api/auth/login    json=${body}    expected_status=200
    Dictionary Should Contain Key    ${resp.json()}    token
    Should Be Equal    ${resp.json()}[role]    Osoba nadzorująca

Login With Valid Pilot Credentials
    [Documentation]    POST /api/auth/login - valid pilot login
    ${body}=    Create Dictionary    email=${PILOT_EMAIL}    password=${TEST_PASSWORD}
    ${resp}=    POST On Session    anon    /api/auth/login    json=${body}    expected_status=200
    Dictionary Should Contain Key    ${resp.json()}    token
    Should Be Equal    ${resp.json()}[role]    Pilot

Login With Invalid Password
    [Documentation]    POST /api/auth/login - wrong password returns 401
    ${body}=    Create Dictionary    email=${ADMIN_EMAIL}    password=WrongPassword123
    ${resp}=    POST On Session    anon    /api/auth/login    json=${body}    expected_status=401

Login With Nonexistent Email
    [Documentation]    POST /api/auth/login - unknown email returns 401
    ${body}=    Create Dictionary    email=nobody@test.pl    password=${TEST_PASSWORD}
    ${resp}=    POST On Session    anon    /api/auth/login    json=${body}    expected_status=401

Login With Empty Body
    [Documentation]    POST /api/auth/login - empty body returns 400
    ${body}=    Create Dictionary
    ${resp}=    POST On Session    anon    /api/auth/login    json=${body}    expected_status=400

Login With Invalid Email Format
    [Documentation]    POST /api/auth/login - invalid email format returns 400
    ${body}=    Create Dictionary    email=not-an-email    password=${TEST_PASSWORD}
    ${resp}=    POST On Session    anon    /api/auth/login    json=${body}    expected_status=400

Get Current User As Admin
    [Documentation]    GET /api/auth/me - returns current user info
    ${session}=    Create Admin Session
    ${resp}=    GET On Session    ${session}    /api/auth/me    expected_status=200
    Should Be Equal    ${resp.json()}[email]    ${ADMIN_EMAIL}
    Should Be Equal    ${resp.json()}[firstName]    Admin
    Should Be Equal    ${resp.json()}[role]    Administrator

Get Current User Without Token
    [Documentation]    GET /api/auth/me - no token returns 401
    ${resp}=    GET On Session    anon    /api/auth/me    expected_status=401
