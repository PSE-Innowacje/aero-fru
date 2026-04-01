*** Settings ***
Documentation    Tests for Helicopters API (/api/helicopters)
Resource         resources/common.resource
Suite Setup      Setup Helicopters Suite

*** Keywords ***
Setup Helicopters Suite
    Create Auth Session    admin    ${ADMIN_EMAIL}
    Create Auth Session    pilot    ${PILOT_EMAIL}

*** Test Cases ***
# ---- GET endpoints ----

List All Helicopters
    [Documentation]    GET /api/helicopters - authenticated user can list
    ${resp}=    GET On Session    pilot    /api/helicopters    expected_status=200
    ${length}=    Get Length    ${resp.json()}
    Should Be True    ${length} >= 2

Get Helicopter By Id
    [Documentation]    GET /api/helicopters/901 - get detail
    ${resp}=    GET On Session    pilot    /api/helicopters/${TEST_HELICOPTER_ID}    expected_status=200
    Should Be Equal    ${resp.json()}[registrationNumber]    SP-TST1
    Should Be Equal    ${resp.json()}[helicopterType]    Robinson R44
    Should Be Equal    ${resp.json()}[status]    active
    Should Be Equal As Integers    ${resp.json()}[maxCrewMembers]    4
    Should Be Equal As Integers    ${resp.json()}[rangeKm]    500

Get Nonexistent Helicopter Returns 404
    [Documentation]    GET /api/helicopters/99999 - returns 404
    ${resp}=    GET On Session    admin    /api/helicopters/99999    expected_status=404

# ---- POST endpoint ----

Create Helicopter As Admin
    [Documentation]    POST /api/helicopters - admin creates helicopter
    ${unique}=    Evaluate    int(__import__('time').time() * 1000) % 100000
    ${body}=    Create Dictionary
    ...    registrationNumber=SP-NEW${unique}
    ...    helicopterType=Airbus H135
    ...    description=Nowy helikopter testowy
    ...    maxCrewMembers=${5}
    ...    maxCrewWeightKg=${600}
    ...    status=active
    ...    inspectionValidUntil=2028-12-31
    ...    rangeKm=${400}
    ${resp}=    POST On Session    admin    /api/helicopters    json=${body}    expected_status=201
    Should Be Equal    ${resp.json()}[helicopterType]    Airbus H135
    Should Be Equal    ${resp.json()}[status]    active
    Dictionary Should Contain Key    ${resp.json()}    id

Create Helicopter With Invalid Status Returns Error
    [Documentation]    POST /api/helicopters - invalid status value (pattern: active|inactive)
    ${body}=    Create Dictionary
    ...    registrationNumber=SP-BAD01
    ...    helicopterType=Test Type
    ...    maxCrewMembers=${3}
    ...    maxCrewWeightKg=${400}
    ...    status=broken
    ...    rangeKm=${200}
    ${resp}=    POST On Session    admin    /api/helicopters    json=${body}    expected_status=any
    Should Be True    ${resp.status_code} >= 400    Status should be 4xx or 5xx error

Create Helicopter With Missing Required Fields Returns 400
    [Documentation]    POST /api/helicopters - missing required fields
    ${body}=    Create Dictionary    description=Only description
    ${resp}=    POST On Session    admin    /api/helicopters    json=${body}    expected_status=400

Create Helicopter As Pilot Returns 401
    [Documentation]    POST /api/helicopters - pilot cannot create (returns 401)
    ${body}=    Create Dictionary
    ...    registrationNumber=SP-NOPE1
    ...    helicopterType=Forbidden
    ...    maxCrewMembers=${2}
    ...    maxCrewWeightKg=${300}
    ...    status=active
    ...    rangeKm=${100}
    ${resp}=    POST On Session    pilot    /api/helicopters    json=${body}    expected_status=401

# ---- PUT endpoint ----

Update Helicopter As Admin
    [Documentation]    PUT /api/helicopters/901 - admin updates helicopter
    ${body}=    Create Dictionary
    ...    registrationNumber=SP-TST1
    ...    helicopterType=Robinson R44 Updated
    ...    description=Zaktualizowany opis
    ...    maxCrewMembers=${4}
    ...    maxCrewWeightKg=${400}
    ...    status=active
    ...    inspectionValidUntil=2027-12-31
    ...    rangeKm=${500}
    ${resp}=    PUT On Session    admin    /api/helicopters/${TEST_HELICOPTER_ID}    json=${body}    expected_status=200
    Should Be Equal    ${resp.json()}[helicopterType]    Robinson R44 Updated
    # Restore
    ${restore}=    Create Dictionary
    ...    registrationNumber=SP-TST1
    ...    helicopterType=Robinson R44
    ...    description=Helikopter testowy 1
    ...    maxCrewMembers=${4}
    ...    maxCrewWeightKg=${400}
    ...    status=active
    ...    inspectionValidUntil=2027-12-31
    ...    rangeKm=${500}
    PUT On Session    admin    /api/helicopters/${TEST_HELICOPTER_ID}    json=${restore}    expected_status=200

Update Helicopter As Pilot Returns 401
    [Documentation]    PUT /api/helicopters - pilot cannot update (returns 401)
    ${body}=    Create Dictionary
    ...    registrationNumber=SP-TST1
    ...    helicopterType=Hacked
    ...    maxCrewMembers=${4}
    ...    maxCrewWeightKg=${400}
    ...    status=active
    ...    rangeKm=${500}
    ${resp}=    PUT On Session    pilot    /api/helicopters/${TEST_HELICOPTER_ID}    json=${body}    expected_status=401
