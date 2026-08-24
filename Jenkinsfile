pipeline {
    agent any

    stages {

        stage('Test WSL + Ansible') {
            steps {
                powershell '''
                    wsl.exe -d Ubuntu -- bash -lc "
                        whoami &&
                        ansible-playbook --version
                    "
                '''
            }
        }

        stage('Verify Ansible Inventory') {
            steps {
                powershell '''
                    $workspaceWsl = $env:WORKSPACE -replace '^C:', '/mnt/c'
                    $workspaceWsl = $workspaceWsl -replace '\\\\', '/'

                    Write-Host "Windows Workspace: $env:WORKSPACE"
                    Write-Host "WSL Workspace: $workspaceWsl"

                    wsl.exe -d Ubuntu -- bash -lc "cd '$workspaceWsl/ansible' && pwd && ls -la && ansible-inventory -i inventory.ini --list"
                '''
            }
        }

        stage('Test EC2 Connection') {
            steps {
                powershell '''
                    $workspaceWsl = $env:WORKSPACE -replace '^C:', '/mnt/c'
                    $workspaceWsl = $workspaceWsl -replace '\\\\', '/'

                    Write-Host "============================================"
                    Write-Host "JENKINS USER"
                    Write-Host "============================================"

                    whoami

                    Write-Host "============================================"
                    Write-Host "WINDOWS NETWORK TEST"
                    Write-Host "============================================"

                    Test-NetConnection 44.202.192.243 -Port 22

                    Write-Host "============================================"
                    Write-Host "WSL USER"
                    Write-Host "============================================"

                    wsl.exe -d Ubuntu -- bash -lc "whoami"

                    Write-Host "============================================"
                    Write-Host "WSL NETWORK TEST"
                    Write-Host "============================================"

                    wsl.exe -d Ubuntu -- bash -lc "timeout 10 bash -c '</dev/tcp/44.202.192.243/22' && echo 'PORT 22 OPEN' || echo 'PORT 22 CLOSED/TIMEOUT'"

                    Write-Host "============================================"
                    Write-Host "SSH KEY"
                    Write-Host "============================================"

                    wsl.exe -d Ubuntu -- bash -lc "ls -l ~/.ssh/smart-parking-key.pem"

                    Write-Host "============================================"
                    Write-Host "ANSIBLE PING"
                    Write-Host "============================================"

                    wsl.exe -d Ubuntu -- bash -lc "cd '$workspaceWsl/ansible' && ansible -i inventory.ini smart_parking -m ping"
                '''
            }
        }

        stage('Deploy to EC2') {
            steps {
                powershell '''
                    $workspaceWsl = $env:WORKSPACE -replace '^C:', '/mnt/c'
                    $workspaceWsl = $workspaceWsl -replace '\\\\', '/'

                    Write-Host "Deploying from: $workspaceWsl/ansible"

                    wsl.exe -d Ubuntu -- bash -lc "cd '$workspaceWsl/ansible' && ansible-playbook -i inventory.ini playbook.yml"
                '''
            }
        }
    }

    post {
        success {
            echo '=============================================='
            echo 'Smart Parking deployment completed successfully!'
            echo '=============================================='
        }

        failure {
            echo '=============================================='
            echo 'Smart Parking deployment failed!'
            echo '=============================================='
        }
    }
}