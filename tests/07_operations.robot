*** Settings ***
Documentation    Tests for Planned Operations API (/api/operations)
Resource         resources/common.resource
Library          OperatingSystem
Library          Process
Suite Setup      Setup Operations Suite

*** Variables ***
${KML_FILE_PATH}    ${CURDIR}${/}testdata${/}test.kml

*** Keywords ***
Setup Operations Suite
    Create Auth Session    admin    ${ADMIN_EMAIL}
    Create Auth Session    planer    ${PLANER_EMAIL}
    Create Auth Session    nadzorca    ${NADZORCA_EMAIL}
    Create Auth Session    pilot    ${PILOT_EMAIL}

Create Operation Via Curl
    [Documentation]    Creates an operation using curl (multipart/form-data)
    [Arguments]    ${email}    ${project_number}=AUTO    ${expected_status}=201
    ${token}=    Login And Get Token    ${email}
    ${unique}=    Evaluate    int(__import__('time').time() * 1000) % 100000
    ${prj}=    Set Variable If    '${project_number}' == 'AUTO'    PRJ-${unique}    ${project_number}
    ${json_data}=    Set Variable    {"orderProjectNumber":"${prj}","shortDescription":"Operacja testowa ${unique}","activityTypeIds":[1,2],"proposedDateEarliest":"2027-01-01","proposedDateLatest":"2027-06-30","additionalInfo":"Info dodatkowe","contactPersonEmails":["kontakt@test.pl"]}
    ${result}=    Run Process    curl    -s    -w    \\n%\{http_code\}    -X    POST
    ...    ${API_URL}/operations
    ...    -H    Authorization: Bearer ${token}
    ...    -F    request\=${json_data};type\=application/json
    ...    -F    kmlFile\=@${KML_FILE_PATH};type\=application/xml
    ${lines}=    Split String    ${result.stdout}    \n
    ${status_code}=    Get From List    ${lines}    -1
    ${body}=    Get From List    ${lines}    0
    Should Be Equal As Strings    ${status_code}    ${expected_status}
    ${json}=    Evaluate    json.loads($body)    json
    RETURN    ${json}

*** Test Cases ***
# ---- GET endpoints ----

List Operations As Authenticated User
    [Documentation]    GET /api/operations - any authenticated user can list
    ${resp}=    GET On Session    pilot    /api/operations    expected_status=200
    Dictionary Should Contain Key    ${resp.json()}    content

List Operations With Status Filter
    [Documentation]    GET /api/operations?statusId=1 - filter by status
    ${params}=    Create Dictionary    statusId=1
    ${resp}=    GET On Session    planer    /api/operations    params=${params}    expected_status=200
    Dictionary Should Contain Key    ${resp.json()}    content

# ---- POST endpoint ----

Create Operation As Planer
    [Documentation]    POST /api/operations - planer creates operation with KML
    ${json}=    Create Operation Via Curl    ${PLANER_EMAIL}
    Should Be True    ${json}[id] > 0
    Should Be Equal    ${json}[status][name]    Wprowadzone

Create Operation As Nadzorca
    [Documentation]    POST /api/operations - nadzorca can also create
    ${json}=    Create Operation Via Curl    ${NADZORCA_EMAIL}
    Should Be True    ${json}[id] > 0

Create Operation As Pilot Returns 403
    [Documentation]    POST /api/operations - pilot cannot create operations
    ${token}=    Login And Get Token    ${PILOT_EMAIL}
    ${result}=    Run Process    curl    -s    -o    /dev/null    -w    %\{http_code\}    -X    POST
    ...    ${API_URL}/operations
    ...    -H    Authorization: Bearer ${token}
    ...    -F    request\={"orderProjectNumber":"PIL-NOPE","shortDescription":"Pilot nie moze","activityTypeIds":[1]};type\=application/json
    ...    -F    kmlFile\=@${KML_FILE_PATH};type\=application/xml
    # May return 401 or 403 depending on security config
    Should Be True    '${result.stdout}' in ['401', '403']

# ---- GET by ID ----

Get Operation By Id
    [Documentation]    GET /api/operations/{id} - get operation detail
    ${json}=    Create Operation Via Curl    ${PLANER_EMAIL}
    ${op_id}=    Set Variable    ${json}[id]
    ${resp}=    GET On Session    planer    /api/operations/${op_id}    expected_status=200
    Dictionary Should Contain Key    ${resp.json()}    operationNumber
    Dictionary Should Contain Key    ${resp.json()}    status
    Dictionary Should Contain Key    ${resp.json()}    activityTypes

Get Nonexistent Operation Returns 404
    [Documentation]    GET /api/operations/99999 - returns 404
    ${resp}=    GET On Session    planer    /api/operations/99999    expected_status=404

# ---- PATCH status ----

Change Operation Status
    [Documentation]    PATCH /api/operations/{id}/status - nadzorca changes status 1->3
    ...    Requires planned dates to be set first via update as nadzorca.
    ${json}=    Create Operation Via Curl    ${PLANER_EMAIL}
    ${op_id}=    Set Variable    ${json}[id]
    # Step 1: Set planned dates (required for status 1->3)
    ${token_nadzorca}=    Login And Get Token    ${NADZORCA_EMAIL}
    ${unique}=    Evaluate    int(__import__('time').time() * 1000) % 100000
    ${update_json}=    Set Variable    {"orderProjectNumber":"${json}[orderProjectNumber]","shortDescription":"${json}[shortDescription]","activityTypeIds":[1],"plannedDateEarliest":"2027-03-01","plannedDateLatest":"2027-06-30"}
    ${result}=    Run Process    curl    -s    -X    PUT
    ...    ${API_URL}/operations/${op_id}
    ...    -H    Authorization: Bearer ${token_nadzorca}
    ...    -F    request\=${update_json};type\=application/json
    # Step 2: Change status 1 -> 3
    ${body}=    Create Dictionary    statusId=${3}
    ${headers}=    Create Dictionary    Authorization=Bearer ${token_nadzorca}    Content-Type=application/json
    ${resp}=    PATCH    ${API_URL}/operations/${op_id}/status    json=${body}    headers=${headers}    expected_status=200

# ---- POST comment ----

Add Comment To Operation
    [Documentation]    POST /api/operations/{id}/comments - add comment
    ${json}=    Create Operation Via Curl    ${PLANER_EMAIL}
    ${op_id}=    Set Variable    ${json}[id]
    ${body}=    Create Dictionary    commentText=Komentarz testowy do operacji
    ${token}=    Login And Get Token    ${PLANER_EMAIL}
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}    Content-Type=application/json
    ${resp}=    POST    ${API_URL}/operations/${op_id}/comments    json=${body}    headers=${headers}    expected_status=201
    Should Be Equal    ${resp.json()}[commentText]    Komentarz testowy do operacji

Add Empty Comment Returns 400
    [Documentation]    POST /api/operations/{id}/comments - empty comment
    ${json}=    Create Operation Via Curl    ${PLANER_EMAIL}
    ${op_id}=    Set Variable    ${json}[id]
    ${body}=    Create Dictionary    commentText=${EMPTY}
    ${token}=    Login And Get Token    ${PLANER_EMAIL}
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}    Content-Type=application/json
    ${resp}=    POST    ${API_URL}/operations/${op_id}/comments    json=${body}    headers=${headers}    expected_status=400

# ---- GET history ----

Get Operation Change History
    [Documentation]    GET /api/operations/{id}/history - get audit trail
    ${json}=    Create Operation Via Curl    ${PLANER_EMAIL}
    ${op_id}=    Set Variable    ${json}[id]
    ${resp}=    GET On Session    planer    /api/operations/${op_id}/history    expected_status=200
    Should Be True    isinstance($resp.json(), list)

# ---- GET KML ----

Download KML File
    [Documentation]    GET /api/operations/{id}/kml - download KML attachment
    ${json}=    Create Operation Via Curl    ${PLANER_EMAIL}
    ${op_id}=    Set Variable    ${json}[id]
    ${token}=    Login And Get Token    ${PLANER_EMAIL}
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    ${resp}=    GET    ${API_URL}/operations/${op_id}/kml    headers=${headers}    expected_status=200
