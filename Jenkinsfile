pipeline {
    agent any

    stages {

        // ============================================================
        // FRONTEND CI
        // ============================================================

        stage('Frontend Install') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "Installing Frontend Dependencies"
                    Write-Host "============================================"

                    Set-Location "$env:WORKSPACE\\Frontend"

                    npm ci

                    if ($LASTEXITCODE -ne 0) {
                        throw "Frontend npm ci failed."
                    }
                '''
            }
        }

        stage('Frontend Unit Test') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "Running Frontend Unit Tests"
                    Write-Host "============================================"

                    Set-Location "$env:WORKSPACE\\Frontend"

                    npm run test

                    if ($LASTEXITCODE -ne 0) {
                        throw "Frontend unit tests failed."
                    }
                '''
            }
        }

        stage('Frontend Lint') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "Running Frontend ESLint"
                    Write-Host "============================================"

                    Set-Location "$env:WORKSPACE\\Frontend"

                    npm run lint

                    if ($LASTEXITCODE -ne 0) {
                        throw "Frontend lint failed."
                    }
                '''
            }
        }

        stage('Frontend Build') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "Building Frontend"
                    Write-Host "============================================"

                    Set-Location "$env:WORKSPACE\\Frontend"

                    npm run build

                    if ($LASTEXITCODE -ne 0) {
                        throw "Frontend build failed."
                    }
                '''
            }
        }


        // ============================================================
        // BACKEND CI
        // ============================================================

        stage('Backend Install') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "Installing Backend Dependencies"
                    Write-Host "============================================"

                    Set-Location "$env:WORKSPACE\\backend"

                    npm ci

                    if ($LASTEXITCODE -ne 0) {
                        throw "Backend npm ci failed."
                    }
                '''
            }
        }

        stage('Backend Unit Test') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "Running Backend Unit Tests"
                    Write-Host "============================================"

                    Set-Location "$env:WORKSPACE\\backend"

                    npm test

                    if ($LASTEXITCODE -ne 0) {
                        throw "Backend unit tests failed."
                    }
                '''
            }
        }


        // ============================================================
        // DOCKER CI
        // ============================================================

        stage('Docker Build') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "Building Docker Images"
                    Write-Host "============================================"

                    Set-Location "$env:WORKSPACE"

                    docker compose build

                    if ($LASTEXITCODE -ne 0) {
                        throw "Docker Compose build failed."
                    }
                '''
            }
        }


        // ============================================================
        // WSL + ANSIBLE
        // ============================================================

        stage('Test WSL + Ansible') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "Testing WSL and Ansible"
                    Write-Host "============================================"

                    wsl.exe -d Ubuntu -- bash -lc "
                        whoami &&
                        ansible-playbook --version
                    "

                    if ($LASTEXITCODE -ne 0) {
                        throw "WSL or Ansible test failed."
                    }
                '''
            }
        }


        // ============================================================
        // ANSIBLE INVENTORY
        // ============================================================

        stage('Verify Ansible Inventory') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "Verifying Ansible Inventory"
                    Write-Host "============================================"

                    $workspace = $env:WORKSPACE

                    Write-Host "Windows Workspace: $workspace"

                    # Convert Windows path to WSL path.
                    if ($workspace -match '^([A-Za-z]):(.*)$') {
                        $drive = $matches[1].ToLower()
                        $path = $matches[2].Replace('\\', '/')
                        $workspaceWsl = "/mnt/$drive$path"
                    }
                    else {
                        throw "Unable to convert Jenkins workspace path to WSL path."
                    }

                    Write-Host "WSL Workspace: $workspaceWsl"

                    $ansibleDir = "$workspaceWsl/ansible"

                    Write-Host "Ansible directory: $ansibleDir"

                    wsl.exe -d Ubuntu -- bash -lc "cd '$ansibleDir' && pwd && ls -la"

                    if ($LASTEXITCODE -ne 0) {
                        throw "Ansible directory could not be accessed."
                    }

                    Write-Host "============================================"
                    Write-Host "Ansible Inventory"
                    Write-Host "============================================"

                    wsl.exe -d Ubuntu -- bash -lc "cd '$ansibleDir' && ansible-inventory -i inventory.ini --list"

                    if ($LASTEXITCODE -ne 0) {
                        throw "Ansible inventory validation failed."
                    }
                '''
            }
        }


        // ============================================================
        // EC2 CONNECTION
        // ============================================================

        stage('Test EC2 Connection') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "Testing EC2 SSH Connection"
                    Write-Host "============================================"

                    $workspace = $env:WORKSPACE

                    if ($workspace -match '^([A-Za-z]):(.*)$') {
                        $drive = $matches[1].ToLower()
                        $path = $matches[2].Replace('\\', '/')
                        $workspaceWsl = "/mnt/$drive$path"
                    }
                    else {
                        throw "Unable to convert Jenkins workspace path."
                    }

                    $ansibleDir = "$workspaceWsl/ansible"

                    Write-Host "Ansible directory: $ansibleDir"

                    wsl.exe -d Ubuntu -- bash -lc "
                        cd '$ansibleDir' &&
                        ansible -i inventory.ini smart_parking -m ping
                    "

                    if ($LASTEXITCODE -ne 0) {
                        throw "EC2 connection failed."
                    }
                '''
            }
        }


        // ============================================================
        // DEPLOYMENT
        // ============================================================

        stage('Deploy to EC2') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "Deploying Smart Parking to EC2"
                    Write-Host "============================================"

                    $workspace = $env:WORKSPACE

                    if ($workspace -match '^([A-Za-z]):(.*)$') {
                        $drive = $matches[1].ToLower()
                        $path = $matches[2].Replace('\\', '/')
                        $workspaceWsl = "/mnt/$drive$path"
                    }
                    else {
                        throw "Unable to convert Jenkins workspace path."
                    }

                    $ansibleDir = "$workspaceWsl/ansible"

                    Write-Host "Ansible directory: $ansibleDir"

                    wsl.exe -d Ubuntu -- bash -lc "
                        cd '$ansibleDir' &&
                        ansible-playbook -i inventory.ini playbook.yml
                    "

                    if ($LASTEXITCODE -ne 0) {
                        throw "Ansible deployment failed."
                    }
                '''
            }
        }


        // ============================================================
        // HEALTH CHECK
        // ============================================================

        stage('Health Check') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "Checking Smart Parking Backend Health"
                    Write-Host "============================================"

                    $healthUrl = "http://3.229.255.187:5000/api/health"

                    Write-Host "Health URL: $healthUrl"

                    try {
                        $response = Invoke-WebRequest `
                            -Uri $healthUrl `
                            -UseBasicParsing `
                            -TimeoutSec 30

                        Write-Host "HTTP Status: $($response.StatusCode)"
                        Write-Host "Response:"
                        Write-Host $response.Content

                        if ($response.StatusCode -ne 200) {
                            throw "Health check returned HTTP $($response.StatusCode)."
                        }
                    }
                    catch {
                        throw "Smart Parking health check failed: $($_.Exception.Message)"
                    }
                '''
            }
        }
    }


    // ================================================================
    // PIPELINE RESULT
    // ================================================================

    post {
        success {
            echo '''
==============================================
SMART PARKING CI/CD DEPLOYMENT SUCCESSFUL
==============================================

GitHub
   ↓
Jenkins
   ↓
Frontend Test + Lint + Build
   ↓
Backend Test
   ↓
Docker Build
   ↓
WSL + Ansible
   ↓
EC2 Deployment
   ↓
Health Check

==============================================
'''
        }

        failure {
            echo '''
==============================================
SMART PARKING CI/CD DEPLOYMENT FAILED
==============================================

Check the failed stage above for the exact error.

==============================================
'''
        }
    }
}