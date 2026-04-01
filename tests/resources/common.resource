*** Settings ***
Library    RequestsLibrary
Library    Collections
Library    JSONLibrary
Library    OperatingSystem
Library    String

*** Variables ***
${BASE_URL}            http://localhost:8080
${API_URL}             ${BASE_URL}/api

# Test user credentials (match seed_test_data.sql)
${ADMIN_EMAIL}         admin@test.pl
${PLANER_EMAIL}        planer@test.pl
${NADZORCA_EMAIL}      nadzorca@test.pl
${PILOT_EMAIL}         pilot@test.pl
${TEST_PASSWORD}       Test1234

# Test data IDs (from seed script)
${TEST_HELICOPTER_ID}       901
${TEST_HELICOPTER_2_ID}     902
${TEST_CREW_PILOT_ID}       901
${TEST_CREW_OBSERVER_ID}    902
${TEST_LANDING_SITE_1_ID}   901
${TEST_LANDING_SITE_2_ID}   902

# Dictionary IDs
${ROLE_ADMIN}          1
${ROLE_PLANER}         2
${ROLE_NADZORCA}       3
${ROLE_PILOT}          4

${CREW_ROLE_PILOT}     1
${CREW_ROLE_OBSERVER}  2

*** Keywords ***
Login And Get Token
    [Arguments]    ${email}    ${password}=${TEST_PASSWORD}
    ${body}=    Create Dictionary    email=${email}    password=${password}
    ${response}=    POST    ${API_URL}/auth/login    json=${body}    expected_status=200
    ${token}=    Set Variable    ${response.json()}[token]
    RETURN    ${token}

Create Auth Session
    [Arguments]    ${alias}    ${email}    ${password}=${TEST_PASSWORD}
    ${token}=    Login And Get Token    ${email}    ${password}
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}    Content-Type=application/json
    Create Session    ${alias}    ${BASE_URL}    headers=${headers}    verify=${False}
    RETURN    ${token}

Create Admin Session
    Create Auth Session    admin_session    ${ADMIN_EMAIL}
    RETURN    admin_session

Create Planer Session
    Create Auth Session    planer_session    ${PLANER_EMAIL}
    RETURN    planer_session

Create Nadzorca Session
    Create Auth Session    nadzorca_session    ${NADZORCA_EMAIL}
    RETURN    nadzorca_session

Create Pilot Session
    Create Auth Session    pilot_session    ${PILOT_EMAIL}
    RETURN    pilot_session

Response Status Should Be
    [Arguments]    ${response}    ${expected_status}
    Should Be Equal As Integers    ${response.status_code}    ${expected_status}

Response Should Contain Key
    [Arguments]    ${response}    ${key}
    Dictionary Should Contain Key    ${response.json()}    ${key}

Response List Should Not Be Empty
    [Arguments]    ${response}
    ${list}=    Set Variable    ${response.json()}
    ${length}=    Get Length    ${list}
    Should Be True    ${length} > 0    List response should not be empty
