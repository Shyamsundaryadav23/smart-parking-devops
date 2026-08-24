pipeline {
    agent any

    stages {

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

        stage('Verify Ansible Inventory') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "Verifying Ansible Inventory"
                    Write-Host "============================================"

                    $workspace = $env:WORKSPACE

                    Write-Host "Windows Workspace: $workspace"

                    # Convert Windows path to WSL path.
                    # Use .Replace() instead of PowerShell -replace
                    # because backslash is a regex character.
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
    }

    post {
        success {
            echo '''
==============================================
SMART PARKING CI/CD DEPLOYMENT SUCCESSFUL
==============================================
GitHub → Jenkins → WSL → Ansible → EC2 → Docker
==============================================
'''
        }

        failure {
            echo '''
==============================================
SMART PARKING CI/CD DEPLOYMENT FAILED
==============================================
Check the stage above for the exact error.
==============================================
'''
        }
    }
}