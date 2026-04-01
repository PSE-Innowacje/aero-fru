*** Settings ***
Documentation    Tests for Landing Sites API (/api/landing-sites)
Resource         resources/common.resource
Suite Setup      Setup Landing Sites Suite

*** Keywords ***
Setup Landing Sites Suite
    Create Auth Session    admin    ${ADMIN_EMAIL}
    Create Auth Session    pilot    ${PILOT_EMAIL}

*** Test Cases ***
# ---- GET endpoints ----

List All Landing Sites
    [Documentation]    GET /api/landing-sites - list all
    ${resp}=    GET On Session    pilot    /api/landing-sites    expected_status=200
    ${length}=    Get Length    ${resp.json()}
    Should Be True    ${length} >= 2

Get Landing Site By Id
    [Documentation]    GET /api/landing-sites/901 - get detail
    ${resp}=    GET On Session    pilot    /api/landing-sites/${TEST_LANDING_SITE_1_ID}    expected_status=200
    Should Be Equal    ${resp.json()}[name]    Lotnisko Testowe Alfa

Get Nonexistent Landing Site Returns 404
    [Documentation]    GET /api/landing-sites/99999 - returns 404
    ${resp}=    GET On Session    admin    /api/landing-sites/99999    expected_status=404

# ---- POST endpoint ----

Create Landing Site As Admin
    [Documentation]    POST /api/landing-sites - admin creates landing site
    ${unique}=    Evaluate    int(__import__('time').time() * 1000) % 100000
    ${body}=    Create Dictionary
    ...    name=Lotnisko Charlie ${unique}
    ...    latitude=${51.1}
    ...    longitude=${17.0}
    ${resp}=    POST On Session    admin    /api/landing-sites    json=${body}    expected_status=201
    Should Be Equal    ${resp.json()}[name]    Lotnisko Charlie ${unique}
    Dictionary Should Contain Key    ${resp.json()}    id

Create Landing Site With Invalid Latitude Returns 400
    [Documentation]    POST /api/landing-sites - latitude > 90
    ${body}=    Create Dictionary
    ...    name=Bad Lat
    ...    latitude=${91.0}
    ...    longitude=${17.0}
    ${resp}=    POST On Session    admin    /api/landing-sites    json=${body}    expected_status=400

Create Landing Site With Invalid Longitude Returns 400
    [Documentation]    POST /api/landing-sites - longitude > 180
    ${body}=    Create Dictionary
    ...    name=Bad Lon
    ...    latitude=${51.0}
    ...    longitude=${181.0}
    ${resp}=    POST On Session    admin    /api/landing-sites    json=${body}    expected_status=400

Create Landing Site With Missing Name Returns 400
    [Documentation]    POST /api/landing-sites - missing name
    ${body}=    Create Dictionary
    ...    latitude=${51.0}
    ...    longitude=${17.0}
    ${resp}=    POST On Session    admin    /api/landing-sites    json=${body}    expected_status=400

Create Landing Site As Pilot Returns 401
    [Documentation]    POST /api/landing-sites - pilot cannot create (returns 401)
    ${body}=    Create Dictionary
    ...    name=Forbidden Site
    ...    latitude=${51.0}
    ...    longitude=${17.0}
    ${resp}=    POST On Session    pilot    /api/landing-sites    json=${body}    expected_status=401

# ---- PUT endpoint ----

Update Landing Site As Admin
    [Documentation]    PUT /api/landing-sites/901 - admin updates
    ${body}=    Create Dictionary
    ...    name=Lotnisko Testowe Alfa Updated
    ...    latitude=${52.2297700}
    ...    longitude=${21.0117800}
    ${resp}=    PUT On Session    admin    /api/landing-sites/${TEST_LANDING_SITE_1_ID}    json=${body}    expected_status=200
    Should Be Equal    ${resp.json()}[name]    Lotnisko Testowe Alfa Updated
    # Restore
    ${restore}=    Create Dictionary
    ...    name=Lotnisko Testowe Alfa
    ...    latitude=${52.2297700}
    ...    longitude=${21.0117800}
    PUT On Session    admin    /api/landing-sites/${TEST_LANDING_SITE_1_ID}    json=${restore}    expected_status=200
