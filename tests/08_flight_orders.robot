*** Settings ***
Documentation    Tests for Flight Orders API (/api/flight-orders)
Resource         resources/common.resource
Library          OperatingSystem
Library          Process
Suite Setup      Setup Flight Orders Suite

*** Variables ***
${KML_FILE_PATH}    ${CURDIR}${/}testdata${/}test.kml

*** Keywords ***
Setup Flight Orders Suite
    Create Auth Session    admin    ${ADMIN_EMAIL}
    Create Auth Session    planer    ${PLANER_EMAIL}
    Create Auth Session    nadzorca    ${NADZORCA_EMAIL}
    Create Auth Session    pilot    ${PILOT_EMAIL}

Create Confirmed Operation
    [Documentation]    Creates an operation and moves it to status 3 (Potwierdzone do planu)
    ${token_planer}=    Login And Get Token    ${PLANER_EMAIL}
    ${token_nadzorca}=    Login And Get Token    ${NADZORCA_EMAIL}
    ${unique}=    Evaluate    int(__import__('time').time() * 1000) % 100000

    # Step 1: Create operation as planer
    ${json_data}=    Set Variable    {"orderProjectNumber":"FO-${unique}","shortDescription":"Op dla zlecenia ${unique}","activityTypeIds":[1],"proposedDateEarliest":"2027-01-01","proposedDateLatest":"2027-12-31"}
    ${result}=    Run Process    curl    -s    -X    POST
    ...    ${API_URL}/operations
    ...    -H    Authorization: Bearer ${token_planer}
    ...    -F    request\=${json_data};type\=application/json
    ...    -F    kmlFile\=@${KML_FILE_PATH};type\=application/xml
    ${op}=    Evaluate    json.loads($result.stdout)    json
    ${op_id}=    Set Variable    ${op}[id]

    # Step 2: Update operation as nadzorca to add planned dates
    ${update_json}=    Set Variable    {"orderProjectNumber":"FO-${unique}","shortDescription":"Op dla zlecenia ${unique}","activityTypeIds":[1],"proposedDateEarliest":"2027-01-01","proposedDateLatest":"2027-12-31","plannedDateEarliest":"2027-03-01","plannedDateLatest":"2027-06-30"}
    ${result2}=    Run Process    curl    -s    -X    PUT
    ...    ${API_URL}/operations/${op_id}
    ...    -H    Authorization: Bearer ${token_nadzorca}
    ...    -F    request\=${update_json};type\=application/json

    # Step 3: Change status to 3 (Potwierdzone do planu)
    ${result3}=    Run Process    curl    -s    -X    PATCH
    ...    ${API_URL}/operations/${op_id}/status
    ...    -H    Authorization: Bearer ${token_nadzorca}
    ...    -H    Content-Type: application/json
    ...    -d    {"statusId":3}

    RETURN    ${op_id}

Create Flight Order Via Curl
    [Documentation]    Creates a flight order using curl to ensure proper JSON serialization
    ${op_id}=    Create Confirmed Operation
    ${token}=    Login And Get Token    ${PILOT_EMAIL}
    ${json_body}=    Set Variable    {"plannedStartAt":"2027-06-15T08:00:00+02:00","plannedLandingAt":"2027-06-15T12:00:00+02:00","pilotId":${TEST_CREW_PILOT_ID},"helicopterId":${TEST_HELICOPTER_ID},"crewMemberIds":[${TEST_CREW_OBSERVER_ID}],"startLandingSiteId":${TEST_LANDING_SITE_1_ID},"endLandingSiteId":${TEST_LANDING_SITE_2_ID},"operationIds":[${op_id}],"estimatedRouteKm":250}
    ${result}=    Run Process    curl    -s    -w    \\n%\{http_code\}    -X    POST
    ...    ${API_URL}/flight-orders
    ...    -H    Authorization: Bearer ${token}
    ...    -H    Content-Type: application/json
    ...    -d    ${json_body}
    ${lines}=    Split String    ${result.stdout}    \n
    ${status_code}=    Get From List    ${lines}    -1
    ${body}=    Get From List    ${lines}    0
    Should Be Equal As Strings    ${status_code}    201
    ${json}=    Evaluate    json.loads($body)    json
    RETURN    ${json}[id]    ${json}

*** Test Cases ***
# ---- GET endpoints ----

List Flight Orders As Pilot
    [Documentation]    GET /api/flight-orders - pilot can list
    ${resp}=    GET On Session    pilot    /api/flight-orders    expected_status=200
    Dictionary Should Contain Key    ${resp.json()}    content

List Flight Orders As Nadzorca
    [Documentation]    GET /api/flight-orders - nadzorca can list
    ${resp}=    GET On Session    nadzorca    /api/flight-orders    expected_status=200
    Dictionary Should Contain Key    ${resp.json()}    content

List Flight Orders As Admin
    [Documentation]    GET /api/flight-orders - admin can list
    ${resp}=    GET On Session    admin    /api/flight-orders    expected_status=200
    Dictionary Should Contain Key    ${resp.json()}    content

List Flight Orders With Status Filter
    [Documentation]    GET /api/flight-orders?statusId=1 - filter by status
    ${params}=    Create Dictionary    statusId=1
    ${resp}=    GET On Session    pilot    /api/flight-orders    params=${params}    expected_status=200
    Dictionary Should Contain Key    ${resp.json()}    content

List Flight Orders As Planer Returns 403
    [Documentation]    GET /api/flight-orders - planer cannot list flight orders
    ${resp}=    GET On Session    planer    /api/flight-orders    expected_status=403

# ---- POST endpoint ----

Create Flight Order As Pilot
    [Documentation]    POST /api/flight-orders - pilot creates flight order with confirmed operation
    ${fo_id}    ${json}=    Create Flight Order Via Curl
    Should Be True    ${fo_id} > 0
    Dictionary Should Contain Key    ${json}    orderNumber
    Dictionary Should Contain Key    ${json}    pilot
    Dictionary Should Contain Key    ${json}    helicopter
    Dictionary Should Contain Key    ${json}    status
    Should Be Equal As Integers    ${json}[estimatedRouteKm]    250

Create Flight Order As Nadzorca Returns 403
    [Documentation]    POST /api/flight-orders - nadzorca cannot create flight orders (returns 403)
    ${op_id}=    Create Confirmed Operation
    ${token}=    Login And Get Token    ${NADZORCA_EMAIL}
    ${json_body}=    Set Variable    {"plannedStartAt":"2027-07-01T08:00:00+02:00","plannedLandingAt":"2027-07-01T12:00:00+02:00","pilotId":${TEST_CREW_PILOT_ID},"helicopterId":${TEST_HELICOPTER_ID},"crewMemberIds":[${TEST_CREW_OBSERVER_ID}],"startLandingSiteId":${TEST_LANDING_SITE_1_ID},"endLandingSiteId":${TEST_LANDING_SITE_2_ID},"operationIds":[${op_id}],"estimatedRouteKm":200}
    ${result}=    Run Process    curl    -s    -o    /dev/null    -w    %\{http_code\}    -X    POST
    ...    ${API_URL}/flight-orders
    ...    -H    Authorization: Bearer ${token}
    ...    -H    Content-Type: application/json
    ...    -d    ${json_body}
    Should Be Equal As Strings    ${result.stdout}    403

Create Flight Order With Missing Fields Returns 400
    [Documentation]    POST /api/flight-orders - missing required fields
    ${body}=    Create Dictionary    estimatedRouteKm=${100}
    ${resp}=    POST On Session    pilot    /api/flight-orders    json=${body}    expected_status=400

Create Flight Order With Unconfirmed Operation Returns 422
    [Documentation]    POST /api/flight-orders - operation must have status 3
    ${token_planer}=    Login And Get Token    ${PLANER_EMAIL}
    ${token_pilot}=    Login And Get Token    ${PILOT_EMAIL}
    ${unique}=    Evaluate    int(__import__('time').time() * 1000) % 100000
    # Create operation but do NOT change status to 3
    ${json_data}=    Set Variable    {"orderProjectNumber":"UNCONF-${unique}","shortDescription":"Unconfirmed op","activityTypeIds":[1]}
    ${result}=    Run Process    curl    -s    -X    POST
    ...    ${API_URL}/operations
    ...    -H    Authorization: Bearer ${token_planer}
    ...    -F    request\=${json_data};type\=application/json
    ...    -F    kmlFile\=@${KML_FILE_PATH};type\=application/xml
    ${op}=    Evaluate    json.loads($result.stdout)    json
    ${op_id}=    Set Variable    ${op}[id]
    # Try to create flight order with unconfirmed operation
    ${json_body}=    Set Variable    {"plannedStartAt":"2027-07-01T08:00:00+02:00","plannedLandingAt":"2027-07-01T12:00:00+02:00","pilotId":${TEST_CREW_PILOT_ID},"helicopterId":${TEST_HELICOPTER_ID},"startLandingSiteId":${TEST_LANDING_SITE_1_ID},"endLandingSiteId":${TEST_LANDING_SITE_2_ID},"operationIds":[${op_id}],"estimatedRouteKm":200}
    ${result2}=    Run Process    curl    -s    -o    /dev/null    -w    %\{http_code\}    -X    POST
    ...    ${API_URL}/flight-orders
    ...    -H    Authorization: Bearer ${token_pilot}
    ...    -H    Content-Type: application/json
    ...    -d    ${json_body}
    Should Be Equal As Strings    ${result2.stdout}    422

# ---- GET by ID ----

Get Flight Order By Id
    [Documentation]    GET /api/flight-orders/{id} - get detail
    ${fo_id}    ${_}=    Create Flight Order Via Curl
    ${token}=    Login And Get Token    ${PILOT_EMAIL}
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    ${resp}=    GET    ${API_URL}/flight-orders/${fo_id}    headers=${headers}    expected_status=200
    Dictionary Should Contain Key    ${resp.json()}    orderNumber
    Dictionary Should Contain Key    ${resp.json()}    pilot
    Dictionary Should Contain Key    ${resp.json()}    helicopter
    Dictionary Should Contain Key    ${resp.json()}    crewMembers
    Dictionary Should Contain Key    ${resp.json()}    operations
    Dictionary Should Contain Key    ${resp.json()}    startLandingSite
    Dictionary Should Contain Key    ${resp.json()}    endLandingSite

Get Nonexistent Flight Order Returns 404
    [Documentation]    GET /api/flight-orders/99999 - returns 404
    ${resp}=    GET On Session    pilot    /api/flight-orders/99999    expected_status=404

# ---- PATCH status ----

Change Flight Order Status As Pilot To Przekazane
    [Documentation]    PATCH /api/flight-orders/{id}/status - pilot changes 1 (Wprowadzone) -> 2 (Przekazane do akceptacji)
    ${fo_id}    ${_}=    Create Flight Order Via Curl
    ${body}=    Create Dictionary    statusId=${2}
    ${token}=    Login And Get Token    ${PILOT_EMAIL}
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}    Content-Type=application/json
    ${resp}=    PATCH    ${API_URL}/flight-orders/${fo_id}/status    json=${body}    headers=${headers}    expected_status=200
    Should Be Equal    ${resp.json()}[status][name]    Przekazane do akceptacji

Change Flight Order Status As Nadzorca To Zaakceptowane
    [Documentation]    PATCH /api/flight-orders/{id}/status - nadzorca changes 2 -> 4 (Zaakceptowane)
    ${fo_id}    ${_}=    Create Flight Order Via Curl
    # First pilot changes 1->2
    ${body1}=    Create Dictionary    statusId=${2}
    ${token_pilot}=    Login And Get Token    ${PILOT_EMAIL}
    ${headers_pilot}=    Create Dictionary    Authorization=Bearer ${token_pilot}    Content-Type=application/json
    PATCH    ${API_URL}/flight-orders/${fo_id}/status    json=${body1}    headers=${headers_pilot}    expected_status=200
    # Then nadzorca changes 2->4
    ${body2}=    Create Dictionary    statusId=${4}
    ${token}=    Login And Get Token    ${NADZORCA_EMAIL}
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}    Content-Type=application/json
    ${resp}=    PATCH    ${API_URL}/flight-orders/${fo_id}/status    json=${body2}    headers=${headers}    expected_status=200
    Should Be Equal    ${resp.json()}[status][name]    Zaakceptowane

Invalid Flight Order Status Transition Returns 409
    [Documentation]    PATCH /api/flight-orders/{id}/status - invalid transition 1->4 returns 409
    ${fo_id}    ${_}=    Create Flight Order Via Curl
    ${body}=    Create Dictionary    statusId=${4}
    ${token}=    Login And Get Token    ${PILOT_EMAIL}
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}    Content-Type=application/json
    ${resp}=    PATCH    ${API_URL}/flight-orders/${fo_id}/status    json=${body}    headers=${headers}    expected_status=409

# ---- PUT endpoint ----

Update Flight Order As Pilot
    [Documentation]    PUT /api/flight-orders/{id} - pilot updates flight order
    ${fo_id}    ${create_json}=    Create Flight Order Via Curl
    ${op_ids}=    Evaluate    [op['id'] for op in $create_json['operations']]
    ${token}=    Login And Get Token    ${PILOT_EMAIL}
    ${json_body}=    Evaluate    json.dumps({"plannedStartAt":"2027-06-15T09:00:00+02:00","plannedLandingAt":"2027-06-15T13:00:00+02:00","pilotId":${TEST_CREW_PILOT_ID},"helicopterId":${TEST_HELICOPTER_ID},"crewMemberIds":[${TEST_CREW_OBSERVER_ID}],"startLandingSiteId":${TEST_LANDING_SITE_1_ID},"endLandingSiteId":${TEST_LANDING_SITE_2_ID},"operationIds":$op_ids,"estimatedRouteKm":300})    json
    ${result}=    Run Process    curl    -s    -w    \\n%\{http_code\}    -X    PUT
    ...    ${API_URL}/flight-orders/${fo_id}
    ...    -H    Authorization: Bearer ${token}
    ...    -H    Content-Type: application/json
    ...    -d    ${json_body}
    ${lines}=    Split String    ${result.stdout}    \n
    ${status_code}=    Get From List    ${lines}    -1
    ${body}=    Get From List    ${lines}    0
    Should Be Equal As Strings    ${status_code}    200
    ${json}=    Evaluate    json.loads($body)    json
    Should Be Equal As Integers    ${json}[estimatedRouteKm]    300
