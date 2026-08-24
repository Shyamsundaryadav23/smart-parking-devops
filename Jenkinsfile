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

        stage('Deploy to EC2') {
            steps {
                powershell '''
                    wsl.exe -d Ubuntu -- bash -lc "
                        cd '/mnt/c/Users/yshya/OneDrive/Desktop/Smart Parking/ansible' &&
                        ansible-playbook -i inventory.ini playbook.yml
                    "
                '''
            }
        }
    }

    post {
        success {
            echo 'Smart Parking deployment completed successfully!'
        }

        failure {
            echo 'Smart Parking deployment failed!'
        }
    }
}