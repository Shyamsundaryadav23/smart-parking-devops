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

                    Write-Host "Ansible directory: $workspaceWsl/ansible"

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