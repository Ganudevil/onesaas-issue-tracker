$ErrorActionPreference = "Stop"

function Get-AdminToken {
    $body = @{
        username = "admin"
        password = "admin"
        grant_type = "password"
        client_id = "admin-cli"
    }
    $response = Invoke-RestMethod -Uri "http://localhost:8080/realms/master/protocol/openid-connect/token" -Method Post -Body $body
    return $response.access_token
}

$token = Get-AdminToken
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "Got Admin Token"

# 1. Create Realm
$realmBody = @{
    id = "onesaas"
    realm = "onesaas"
    enabled = $true
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:8080/admin/realms" -Method Post -Headers $headers -Body $realmBody
    Write-Host "Realm 'onesaas' created."
} catch {
    Write-Host "Realm 'onesaas' creation failed (might already exist): $($_.Exception.Message)"
}

# 2. Create Client
$clientBody = @{
    clientId = "issue-tracker"
    enabled = $true
    publicClient = $true
    directAccessGrantsEnabled = $true
    standardFlowEnabled = $true
    rootUrl = "http://localhost:3000"
    redirectUris = @("http://localhost:3000/*")
    webOrigins = @("*")
    protocol = "openid-connect"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/onesaas/clients" -Method Post -Headers $headers -Body $clientBody
    Write-Host "Client 'issue-tracker' created."
} catch {
    Write-Host "Client 'issue-tracker' creation failed: $($_.Exception.Message)"
}

# 3. Create User
$userBody = @{
    username = "testuser"
    email = "test@example.com"
    firstName = "Test"
    lastName = "User"
    enabled = $true
    emailVerified = $true
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/onesaas/users" -Method Post -Headers $headers -Body $userBody
    Write-Host "User 'testuser' created."
} catch {
    Write-Host "User 'testuser' creation failed: $($_.Exception.Message)"
}

# 4. Get User ID
try {
    $users = Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/onesaas/users?username=testuser" -Method Get -Headers $headers
    $userId = $users[0].id
    Write-Host "User ID: $userId"

    # 5. Set Password
    $passwordBody = @{
        type = "password"
        value = "password"
        temporary = $false
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "http://localhost:8080/admin/realms/onesaas/users/$userId/reset-password" -Method Put -Headers $headers -Body $passwordBody
    Write-Host "Password set for 'testuser'."
} catch {
    Write-Host "Failed to set password: $($_.Exception.Message)"
}
