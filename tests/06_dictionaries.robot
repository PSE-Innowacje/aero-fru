*** Settings ***
Documentation    Tests for Dictionaries API (/api/dictionaries)
Resource         resources/common.resource
Suite Setup      Setup Dict Suite

*** Keywords ***
Setup Dict Suite
    Create Auth Session    admin    ${ADMIN_EMAIL}

*** Test Cases ***
Get Crew Roles
    [Documentation]    GET /api/dictionaries/crew-roles
    ${resp}=    GET On Session    admin    /api/dictionaries/crew-roles    expected_status=200
    ${length}=    Get Length    ${resp.json()}
    Should Be True    ${length} >= 2
    ${names}=    Evaluate    [item['name'] for item in $resp.json()]
    Should Contain    ${names}    Pilot
    Should Contain    ${names}    Obserwator

Get User Roles
    [Documentation]    GET /api/dictionaries/user-roles
    ${resp}=    GET On Session    admin    /api/dictionaries/user-roles    expected_status=200
    ${length}=    Get Length    ${resp.json()}
    Should Be True    ${length} >= 4
    ${names}=    Evaluate    [item['name'] for item in $resp.json()]
    Should Contain    ${names}    Administrator
    Should Contain    ${names}    Pilot

Get Activity Types
    [Documentation]    GET /api/dictionaries/activity-types
    ${resp}=    GET On Session    admin    /api/dictionaries/activity-types    expected_status=200
    ${length}=    Get Length    ${resp.json()}
    Should Be True    ${length} >= 5
    ${names}=    Evaluate    [item['name'] for item in $resp.json()]
    Should Contain    ${names}    skan 3D
    Should Contain    ${names}    patrolowanie

Get Operation Statuses
    [Documentation]    GET /api/dictionaries/operation-statuses
    ${resp}=    GET On Session    admin    /api/dictionaries/operation-statuses    expected_status=200
    ${length}=    Get Length    ${resp.json()}
    Should Be True    ${length} >= 7
    ${names}=    Evaluate    [item['name'] for item in $resp.json()]
    Should Contain    ${names}    Wprowadzone
    Should Contain    ${names}    Zrealizowane

Get Flight Order Statuses
    [Documentation]    GET /api/dictionaries/flight-order-statuses
    ${resp}=    GET On Session    admin    /api/dictionaries/flight-order-statuses    expected_status=200
    ${length}=    Get Length    ${resp.json()}
    Should Be True    ${length} >= 7
    ${names}=    Evaluate    [item['name'] for item in $resp.json()]
    Should Contain    ${names}    Wprowadzone
    Should Contain    ${names}    Zaakceptowane

Dictionary Items Have Id And Name
    [Documentation]    Verify dictionary response structure
    ${resp}=    GET On Session    admin    /api/dictionaries/user-roles    expected_status=200
    ${first}=    Evaluate    $resp.json()[0]
    Dictionary Should Contain Key    ${first}    id
    Dictionary Should Contain Key    ${first}    name
