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

                    wsl.exe -d Ubuntu -- bash -lc "
                        WSL_WORKSPACE=`$(wslpath -u '$workspace') &&
                        cd `$WSL_WORKSPACE/ansible &&
                        ansible-inventory -i inventory.ini --list
                    "
                '''
            }
        }

        stage('Test EC2 Connection') {
            steps {
                powershell '''
                    $workspace = $env:WORKSPACE

                    wsl.exe -d Ubuntu -- bash -lc "
                        WSL_WORKSPACE=`$(wslpath -u '$workspace') &&
                        cd `$WSL_WORKSPACE/ansible &&
                        ansible -i inventory.ini smart_parking -m ping
                    "
                '''
            }
        }

        stage('Deploy to EC2') {
            steps {
                powershell '''
                    $workspace = $env:WORKSPACE

                    wsl.exe -d Ubuntu -- bash -lc "
                        WSL_WORKSPACE=`$(wslpath -u '$workspace') &&
                        cd `$WSL_WORKSPACE/ansible &&
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