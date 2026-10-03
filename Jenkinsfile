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
    // DEVSECOPS - DEPENDENCY SECURITY
    // ============================================================

    stage('Dependency Security Audit') {
        steps {
            powershell '''
                Write-Host "============================================"
                Write-Host "Running Dependency Security Audit"
                Write-Host "============================================"

                # ============================================
                # FRONTEND AUDIT
                # ============================================

                Write-Host ""
                Write-Host "----- Frontend npm audit -----"

                Set-Location "$env:WORKSPACE\\Frontend"

                npm audit --audit-level=high
                $frontendAuditExitCode = $LASTEXITCODE

                Write-Host "Frontend npm audit exit code: $frontendAuditExitCode"

                if ($frontendAuditExitCode -ne 0) {
                    Write-Warning "Frontend npm audit found vulnerabilities or audit errors."
                    Write-Warning "This is a warning-only security stage. Pipeline will continue."
                }
                else {
                    Write-Host "Frontend npm audit completed successfully."
                }

                # ============================================
                # BACKEND AUDIT
                # ============================================

                Write-Host ""
                Write-Host "----- Backend npm audit -----"

                Set-Location "$env:WORKSPACE\\backend"

                npm audit --audit-level=high
                $backendAuditExitCode = $LASTEXITCODE

                Write-Host "Backend npm audit exit code: $backendAuditExitCode"

                if ($backendAuditExitCode -ne 0) {
                    Write-Warning "Backend npm audit found HIGH/CRITICAL vulnerabilities."
                    Write-Warning "This is a warning-only security stage. Pipeline will continue."
                }
                else {
                    Write-Host "Backend npm audit completed successfully."
                }

                # ============================================
                # FINAL STATUS
                # ============================================

                Write-Host ""
                Write-Host "============================================"
                Write-Host "Dependency security audit completed."
                Write-Host "Frontend audit exit code: $frontendAuditExitCode"
                Write-Host "Backend audit exit code: $backendAuditExitCode"
                Write-Host "Security audit is WARNING-ONLY."
                Write-Host "Pipeline will continue."
                Write-Host "============================================"

                # IMPORTANT:
                # npm audit can return exit code 1 when vulnerabilities
                # are found. Do not propagate that failure to Jenkins.
                exit 0
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
    // DEVSECOPS - TRIVY CONTAINER SECURITY
    // ============================================================

    stage('Trivy Security Scan') {
        steps {
            powershell '''
                Write-Host "============================================"
                Write-Host "Running Trivy Container Security Scans"
                Write-Host "============================================"

                Write-Host ""
                Write-Host "----- Backend Image Scan -----"

                trivy image --severity HIGH,CRITICAL smartparking-backend:latest

                if ($LASTEXITCODE -ne 0) {
                    Write-Warning "Backend image scan reported HIGH/CRITICAL vulnerabilities."
                }

                Write-Host ""
                Write-Host "----- Frontend Image Scan -----"

                trivy image --severity HIGH,CRITICAL smartparking-frontend:latest

                if ($LASTEXITCODE -ne 0) {
                    Write-Warning "Frontend image scan reported HIGH/CRITICAL vulnerabilities."
                }

                Write-Host ""
                Write-Host "----- DB Init Image Scan -----"

                trivy image --severity HIGH,CRITICAL smartparking-db-init:latest

                if ($LASTEXITCODE -ne 0) {
                    Write-Warning "DB-init image scan reported HIGH/CRITICAL vulnerabilities."
                }

                Write-Host ""
                Write-Host "============================================"
                Write-Host "Trivy Security Scans Completed"
                Write-Host "============================================"
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
=========================================

GitHub
↓
Jenkins
↓
Frontend Test + Lint + Build
↓
Backend Test
↓
npm Dependency Security Audit
↓
Docker Build
↓
Trivy Container Security Scan
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
=====================================

Check the failed stage above for the exact error.

==============================================
'''
}
}
}
