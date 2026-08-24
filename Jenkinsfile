pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

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
                '''
            }
        }

        stage('Verify Ansible Inventory') {
            steps {
                powershell '''
                    $workspace = $env:WORKSPACE

                    Write-Host "Windows Workspace: $workspace"

                    # Convert Windows path to WSL path
                    $workspaceWsl = $workspace -replace '^C:', '/mnt/c'
                    $workspaceWsl = $workspaceWsl -replace '\\', '/'

                    Write-Host "WSL Workspace: $workspaceWsl"

                    $ansibleDir = "$workspaceWsl/ansible"

                    Write-Host "Ansible directory: $ansibleDir"

                    wsl.exe -d Ubuntu -- bash -lc "
                        cd '$ansibleDir' &&
                        pwd &&
                        ls -la &&
                        ansible-inventory -i inventory.ini --list
                    "
                '''
            }
        }

        stage('Test EC2 Connection') {
            steps {
                powershell '''
                    $workspace = $env:WORKSPACE

                    # Convert Windows path to WSL path
                    $workspaceWsl = $workspace -replace '^C:', '/mnt/c'
                    $workspaceWsl = $workspaceWsl -replace '\\', '/'

                    $ansibleDir = "$workspaceWsl/ansible"

                    Write-Host "============================================"
                    Write-Host "Testing EC2 Connection"
                    Write-Host "============================================"
                    Write-Host "Ansible directory: $ansibleDir"

                    wsl.exe -d Ubuntu -- bash -lc "
                        cd '$ansibleDir' &&
                        ansible -i inventory.ini smart_parking -m ping
                    "
                '''
            }
        }

        stage('Deploy to EC2') {
            steps {
                powershell '''
                    $workspace = $env:WORKSPACE

                    # Convert Windows path to WSL path
                    $workspaceWsl = $workspace -replace '^C:', '/mnt/c'
                    $workspaceWsl = $workspaceWsl -replace '\\', '/'

                    $ansibleDir = "$workspaceWsl/ansible"

                    Write-Host "============================================"
                    Write-Host "Deploying Smart Parking to EC2"
                    Write-Host "============================================"
                    Write-Host "Ansible directory: $ansibleDir"

                    wsl.exe -d Ubuntu -- bash -lc "
                        cd '$ansibleDir' &&
                        ansible-playbook -i inventory.ini playbook.yml
                    "
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