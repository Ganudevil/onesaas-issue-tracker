$ErrorActionPreference = "Continue"

Write-Host "Getting Admin Token..."
$tokenResponse = curl.exe -s -X POST "http://localhost:8080/realms/master/protocol/openid-connect/token" -d "username=admin" -d "password=admin" -d "grant_type=password" -d "client_id=admin-cli"
# Write-Host "Response: $tokenResponse"

try {
    $tokenObj = $tokenResponse | ConvertFrom-Json
    $token = $tokenObj.access_token
}
catch {
    Write-Error "Failed to parse token response"
    exit 1
}

if (!$token) { 
    Write-Error "No access_token found in response"
    exit 1 
}
Write-Host "Got Admin Token"

# 1. Create Realm
Write-Host "Creating Realm 'onesaas'..."
$realmJson = '{"id": "onesaas", "realm": "onesaas", "enabled": true}'
# Escape double quotes for shell if needed, but in PS string variable passed to curl, it should be fine if carefully handled.
# Best to write to temp file to avoid quoting hell
$realmJson | Out-File -Encoding ASCII realm.json
curl.exe -s -X POST "http://localhost:8080/admin/realms" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "@realm.json"
Write-Host "`nRealm creation request sent."

# 2. Create Client
Write-Host "Creating Client 'issue-tracker'..."
$clientJson = @{
    clientId                  = "issue-tracker"
    enabled                   = $true
    publicClient              = $true
    directAccessGrantsEnabled = $true
    standardFlowEnabled       = $true
    rootUrl                   = "http://localhost:3000"
    redirectUris              = @("http://localhost:3000/*")
    webOrigins                = @("*")
    protocol                  = "openid-connect"
} | ConvertTo-Json -Depth 5
$clientJson | Out-File -Encoding ASCII client.json
curl.exe -s -X POST "http://localhost:8080/admin/realms/onesaas/clients" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "@client.json"
Write-Host "`nClient creation request sent."

# 3. Create User
Write-Host "Creating User 'testuser'..."
$userJson = @{
    username      = "testuser"
    email         = "test@example.com"
    firstName     = "Test"
    lastName      = "User"
    enabled       = $true
    emailVerified = $true
} | ConvertTo-Json
$userJson | Out-File -Encoding ASCII user.json
curl.exe -s -X POST "http://localhost:8080/admin/realms/onesaas/users" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "@user.json"
Write-Host "`nUser creation request sent."

# 4. Get User ID
Write-Host "Getting User ID..."
$usersResponse = curl.exe -s -X GET "http://localhost:8080/admin/realms/onesaas/users?username=testuser" -H "Authorization: Bearer $token"
$usersObj = $usersResponse | ConvertFrom-Json
$userId = $usersObj[0].id
Write-Host "User ID: $userId"

if ($userId) {
    # 5. Set Password
    Write-Host "Setting Password..."
    $pwdJson = @{
        type      = "password"
        value     = "password"
        temporary = $false
    } | ConvertTo-Json
    $pwdJson | Out-File -Encoding ASCII pwd.json
    curl.exe -s -X PUT "http://localhost:8080/admin/realms/onesaas/users/$userId/reset-password" -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d "@pwd.json"
    Write-Host "`nPassword set."
}
else {
    Write-Error "Could not find user ID, skipping password set."
}

Write-Host "Done."
