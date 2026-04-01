*** Settings ***
Documentation    Tests for Crew Members API (/api/crew-members)
Resource         resources/common.resource
Suite Setup      Setup Crew Suite

*** Keywords ***
Setup Crew Suite
    Create Auth Session    admin    ${ADMIN_EMAIL}
    Create Auth Session    pilot    ${PILOT_EMAIL}

*** Test Cases ***
# ---- GET endpoints ----

List All Crew Members
    [Documentation]    GET /api/crew-members - list all
    ${resp}=    GET On Session    pilot    /api/crew-members    expected_status=200
    ${length}=    Get Length    ${resp.json()}
    Should Be True    ${length} >= 2

Get Crew Member By Id
    [Documentation]    GET /api/crew-members/901 - get pilot detail
    ${resp}=    GET On Session    pilot    /api/crew-members/${TEST_CREW_PILOT_ID}    expected_status=200
    Should Be Equal    ${resp.json()}[firstName]    Jan
    Should Be Equal    ${resp.json()}[lastName]    Pilotowski
    Should Be Equal    ${resp.json()}[email]    jan.pilot@test.pl
    Should Be Equal As Integers    ${resp.json()}[weightKg]    80
    Should Be Equal    ${resp.json()}[pilotLicenseNumber]    PL-PIL-001

Get Nonexistent Crew Member Returns 404
    [Documentation]    GET /api/crew-members/99999 - returns 404
    ${resp}=    GET On Session    admin    /api/crew-members/99999    expected_status=404

# ---- POST endpoint ----

Create Crew Member As Admin
    [Documentation]    POST /api/crew-members - admin creates crew member
    ${unique}=    Evaluate    int(__import__('time').time() * 1000) % 100000
    ${body}=    Create Dictionary
    ...    firstName=Tomasz
    ...    lastName=Nowy${unique}
    ...    email=tomasz${unique}@test.pl
    ...    weightKg=${75}
    ...    roleId=${CREW_ROLE_OBSERVER}
    ...    trainingValidUntil=2027-12-31
    ${resp}=    POST On Session    admin    /api/crew-members    json=${body}    expected_status=201
    Should Be Equal    ${resp.json()}[firstName]    Tomasz
    Should Be Equal As Integers    ${resp.json()}[weightKg]    75

Create Crew Member With Invalid Weight Returns 400
    [Documentation]    POST /api/crew-members - weight out of range (min=30, max=200)
    ${body}=    Create Dictionary
    ...    firstName=Heavy
    ...    lastName=Person
    ...    email=heavy@test.pl
    ...    weightKg=${250}
    ...    roleId=${CREW_ROLE_OBSERVER}
    ...    trainingValidUntil=2027-12-31
    ${resp}=    POST On Session    admin    /api/crew-members    json=${body}    expected_status=400

Create Crew Member With Invalid Email Returns 400
    [Documentation]    POST /api/crew-members - invalid email
    ${body}=    Create Dictionary
    ...    firstName=Bad
    ...    lastName=Email
    ...    email=not-email
    ...    weightKg=${70}
    ...    roleId=${CREW_ROLE_OBSERVER}
    ...    trainingValidUntil=2027-12-31
    ${resp}=    POST On Session    admin    /api/crew-members    json=${body}    expected_status=400

Create Crew Member As Pilot Returns 401
    [Documentation]    POST /api/crew-members - pilot cannot create (returns 401)
    ${body}=    Create Dictionary
    ...    firstName=Forbidden
    ...    lastName=Crew
    ...    email=forbiddencrew@test.pl
    ...    weightKg=${70}
    ...    roleId=${CREW_ROLE_OBSERVER}
    ...    trainingValidUntil=2027-12-31
    ${resp}=    POST On Session    pilot    /api/crew-members    json=${body}    expected_status=401

# ---- PUT endpoint ----

Update Crew Member As Admin
    [Documentation]    PUT /api/crew-members/902 - admin updates observer
    ${body}=    Create Dictionary
    ...    firstName=Anna
    ...    lastName=ObserwatorUpdated
    ...    email=anna.obs@test.pl
    ...    weightKg=${68}
    ...    roleId=${CREW_ROLE_OBSERVER}
    ...    trainingValidUntil=2027-06-30
    ${resp}=    PUT On Session    admin    /api/crew-members/${TEST_CREW_OBSERVER_ID}    json=${body}    expected_status=200
    Should Be Equal    ${resp.json()}[lastName]    ObserwatorUpdated
    # Restore
    ${restore}=    Create Dictionary
    ...    firstName=Anna
    ...    lastName=Obserwator
    ...    email=anna.obs@test.pl
    ...    weightKg=${65}
    ...    roleId=${CREW_ROLE_OBSERVER}
    ...    trainingValidUntil=2027-06-30
    PUT On Session    admin    /api/crew-members/${TEST_CREW_OBSERVER_ID}    json=${restore}    expected_status=200

Update Crew Member As Pilot Returns 401
    [Documentation]    PUT /api/crew-members - pilot cannot update (returns 401)
    ${body}=    Create Dictionary
    ...    firstName=Anna
    ...    lastName=Hacked
    ...    email=anna.obs@test.pl
    ...    weightKg=${65}
    ...    roleId=${CREW_ROLE_OBSERVER}
    ...    trainingValidUntil=2027-06-30
    ${resp}=    PUT On Session    pilot    /api/crew-members/${TEST_CREW_OBSERVER_ID}    json=${body}    expected_status=401
