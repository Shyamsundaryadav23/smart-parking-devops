pipeline {
    agent any

    stages {

        // ============================================================
        // 1. FRONTEND CI
        // ============================================================

        stage('Frontend Install') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "INSTALLING FRONTEND DEPENDENCIES"
                    Write-Host "============================================"

                    Set-Location "$env:WORKSPACE\\Frontend"

                    npm ci

                    if ($LASTEXITCODE -ne 0) {
                        throw "Frontend npm ci failed."
                    }

                    Write-Host "Frontend dependencies installed successfully."
                '''
            }
        }

        stage('Frontend Unit Test') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "FRONTEND UNIT TEST"
                    Write-Host "============================================"

                    Set-Location "$env:WORKSPACE\\Frontend"

                    npm test -- --run

                    if ($LASTEXITCODE -ne 0) {
                        throw "Frontend unit tests failed."
                    }

                    Write-Host "Frontend unit tests passed."
                '''
            }
        }

        stage('Frontend Lint') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "FRONTEND LINT"
                    Write-Host "============================================"

                    Set-Location "$env:WORKSPACE\\Frontend"

                    npm run lint

                    if ($LASTEXITCODE -ne 0) {
                        throw "Frontend lint failed."
                    }

                    Write-Host "Frontend lint passed."
                '''
            }
        }

        stage('Frontend Build') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "FRONTEND BUILD"
                    Write-Host "============================================"

                    Set-Location "$env:WORKSPACE\\Frontend"

                    npm run build

                    if ($LASTEXITCODE -ne 0) {
                        throw "Frontend build failed."
                    }

                    Write-Host "Frontend build completed successfully."
                '''
            }
        }


        // ============================================================
        // 2. BACKEND CI
        // ============================================================

        stage('Backend Install') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "INSTALLING BACKEND DEPENDENCIES"
                    Write-Host "============================================"

                    Set-Location "$env:WORKSPACE\\backend"

                    npm ci

                    if ($LASTEXITCODE -ne 0) {
                        throw "Backend npm ci failed."
                    }

                    Write-Host "Backend dependencies installed successfully."
                '''
            }
        }

        stage('Backend Unit Test') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "BACKEND UNIT TEST"
                    Write-Host "============================================"

                    Set-Location "$env:WORKSPACE\\backend"

                    npm test -- --runInBand

                    if ($LASTEXITCODE -ne 0) {
                        throw "Backend unit tests failed."
                    }

                    Write-Host "Backend unit tests passed."
                '''
            }
        }


        // ============================================================
        // 3. DEVSECOPS
        // ============================================================

        stage('Dependency Security Audit') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "DEPENDENCY SECURITY AUDIT"
                    Write-Host "============================================"

                    # ========================================================
                    # FRONTEND AUDIT
                    # ========================================================

                    Write-Host ""
                    Write-Host "Scanning Frontend dependencies..."

                    Set-Location "$env:WORKSPACE\\Frontend"

                    npm audit --audit-level=high

                    $frontendAuditExitCode = $LASTEXITCODE

                    if ($frontendAuditExitCode -ne 0) {
                        Write-Warning "Frontend npm audit reported vulnerabilities."
                        Write-Warning "Pipeline continues because audit is warning-only."
                    }
                    else {
                        Write-Host "Frontend npm audit passed."
                    }

                    # Reset native command exit code
                    $global:LASTEXITCODE = 0

                    # ========================================================
                    # BACKEND AUDIT
                    # ========================================================

                    Write-Host ""
                    Write-Host "Scanning Backend dependencies..."

                    Set-Location "$env:WORKSPACE\\backend"

                    npm audit --audit-level=high

                    $backendAuditExitCode = $LASTEXITCODE

                    if ($backendAuditExitCode -ne 0) {
                        Write-Warning "Backend npm audit reported vulnerabilities."
                        Write-Warning "Pipeline continues because audit is warning-only."
                    }
                    else {
                        Write-Host "Backend npm audit passed."
                    }

                    # Reset native command exit code
                    $global:LASTEXITCODE = 0

                    # ========================================================
                    # FINAL RESULT
                    # ========================================================

                    Write-Host ""
                    Write-Host "============================================"
                    Write-Host "DEPENDENCY SECURITY AUDIT COMPLETED"
                    Write-Host "============================================"

                    Write-Host ""
                    Write-Host "Frontend audit exit code: $frontendAuditExitCode"
                    Write-Host "Backend audit exit code:  $backendAuditExitCode"

                    Write-Host ""
                    Write-Host "Security vulnerabilities were detected."
                    Write-Host "They are being reported as warnings."
                    Write-Host "The CI/CD pipeline will continue."

                    # Explicitly tell Jenkins that this stage succeeded
                    $global:LASTEXITCODE = 0
                '''
            }
        }


        // ============================================================
        // 4. DOCKER BUILD
        // ============================================================

        stage('Docker Build') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "BUILDING DOCKER IMAGES"
                    Write-Host "============================================"

                    Set-Location "$env:WORKSPACE"

                    Write-Host ""
                    Write-Host "Building Backend image..."

                    docker build `
                        -t smartparking-backend:latest `
                        ./backend

                    if ($LASTEXITCODE -ne 0) {
                        throw "Backend Docker image build failed."
                    }

                    Write-Host ""
                    Write-Host "Building Frontend image..."

                    docker build `
                        -t smartparking-frontend:latest `
                        ./Frontend

                    if ($LASTEXITCODE -ne 0) {
                        throw "Frontend Docker image build failed."
                    }

                    Write-Host ""
                    Write-Host "Building DB initialization image..."

                    docker build `
                        -t smartparking-db-init:latest `
                        ./backend

                    if ($LASTEXITCODE -ne 0) {
                        throw "DB-init Docker image build failed."
                    }

                    Write-Host ""
                    Write-Host "Docker images built successfully."

                    docker images | Select-String "smartparking"
                '''
            }
        }


        // ============================================================
        // 5. TRIVY SECURITY SCAN
        // ============================================================

        stage('Trivy Security Scan') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "TRIVY CONTAINER SECURITY SCAN"
                    Write-Host "============================================"

                    Write-Host ""
                    Write-Host "Scanning Backend image..."

                    trivy image `
                        --severity HIGH,CRITICAL `
                        --ignore-unfixed `
                        smartparking-backend:latest

                    if ($LASTEXITCODE -ne 0) {
                        Write-Warning "Backend Trivy scan reported vulnerabilities."
                        Write-Warning "Pipeline continues because Trivy is warning-only."
                    }

                    Write-Host ""
                    Write-Host "Scanning Frontend image..."

                    trivy image `
                        --severity HIGH,CRITICAL `
                        --ignore-unfixed `
                        smartparking-frontend:latest

                    if ($LASTEXITCODE -ne 0) {
                        Write-Warning "Frontend Trivy scan reported vulnerabilities."
                        Write-Warning "Pipeline continues because Trivy is warning-only."
                    }

                    Write-Host ""
                    Write-Host "Scanning DB-init image..."

                    trivy image `
                        --severity HIGH,CRITICAL `
                        --ignore-unfixed `
                        smartparking-db-init:latest

                    if ($LASTEXITCODE -ne 0) {
                        Write-Warning "DB-init Trivy scan reported vulnerabilities."
                        Write-Warning "Pipeline continues because Trivy is warning-only."
                    }

                    Write-Host ""
                    Write-Host "Trivy security scanning completed."
                '''
            }
        }


        // ============================================================
        // 6. WSL + ANSIBLE CHECK
        // ============================================================

        stage('Test WSL + Ansible') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "TESTING WSL AND ANSIBLE"
                    Write-Host "============================================"

                    wsl bash -lc "whoami"

                    if ($LASTEXITCODE -ne 0) {
                        throw "WSL test failed."
                    }

                    wsl bash -lc "ansible --version"

                    if ($LASTEXITCODE -ne 0) {
                        throw "Ansible is not available in WSL."
                    }

                    Write-Host ""
                    Write-Host "WSL and Ansible are available."
                '''
            }
        }


        // ============================================================
        // 7. VERIFY KUBERNETES ACCESS
        // ============================================================

        stage('Verify Kubernetes Access') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "KUBERNETES ACCESS CHECK"
                    Write-Host "============================================"

                    Write-Host ""
                    Write-Host "Current Jenkins user:"
                    whoami

                    if ($LASTEXITCODE -ne 0) {
                        throw "Unable to determine Jenkins user."
                    }

                    Write-Host ""
                    Write-Host "Checking kubectl..."

                    kubectl version --client

                    if ($LASTEXITCODE -ne 0) {
                        throw "kubectl is not available."
                    }

                    Write-Host ""
                    Write-Host "Checking Minikube..."

                    minikube version

                    if ($LASTEXITCODE -ne 0) {
                        throw "Minikube is not available."
                    }

                    Write-Host ""
                    Write-Host "Checking Minikube status..."

                    minikube status

                    if ($LASTEXITCODE -ne 0) {
                        throw "Minikube is not running."
                    }

                    Write-Host ""
                    Write-Host "Checking Kubernetes nodes..."

                    kubectl get nodes

                    if ($LASTEXITCODE -ne 0) {
                        throw "Unable to access Kubernetes nodes."
                    }

                    Write-Host ""
                    Write-Host "Kubernetes access check successful."
                '''
            }
        }


        // ============================================================
        // 8. DEPLOY KUBERNETES INFRASTRUCTURE + APPLICATION
        // ============================================================

        stage('Deploy to Kubernetes') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "DEPLOYING SMART PARKING TO KUBERNETES"
                    Write-Host "============================================"

                    Set-Location "$env:WORKSPACE"

                    // ------------------------------------------------
                    // Load Docker images into Minikube
                    // ------------------------------------------------

                    Write-Host ""
                    Write-Host "Loading Backend image into Minikube..."

                    minikube image load smartparking-backend:latest

                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to load backend image into Minikube."
                    }

                    Write-Host ""
                    Write-Host "Loading Frontend image into Minikube..."

                    minikube image load smartparking-frontend:latest

                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to load frontend image into Minikube."
                    }

                    Write-Host ""
                    Write-Host "Loading DB-init image into Minikube..."

                    minikube image load smartparking-db-init:latest

                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to load DB-init image into Minikube."
                    }


                    // ------------------------------------------------
                    // Namespace
                    // ------------------------------------------------

                    Write-Host ""
                    Write-Host "Applying Kubernetes namespace..."

                    kubectl apply -f k8s/namespace.yaml

                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to apply namespace."
                    }


                    // ------------------------------------------------
                    // ConfigMap
                    // ------------------------------------------------

                    Write-Host ""
                    Write-Host "Applying ConfigMap..."

                    kubectl apply -f k8s/configmap.yaml

                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to apply ConfigMap."
                    }


                    // ------------------------------------------------
                    // DynamoDB
                    // ------------------------------------------------

                    Write-Host ""
                    Write-Host "Applying DynamoDB deployment..."

                    kubectl apply -f k8s/dynamodb-deployment.yaml

                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to apply DynamoDB deployment."
                    }

                    Write-Host ""
                    Write-Host "Applying DynamoDB service..."

                    kubectl apply -f k8s/dynamodb-service.yaml

                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to apply DynamoDB service."
                    }


                    // ------------------------------------------------
                    // Wait for DynamoDB
                    // ------------------------------------------------

                    Write-Host ""
                    Write-Host "Waiting for DynamoDB to become ready..."

                    kubectl rollout status `
                        deployment/smart-parking-dynamodb `
                        -n smart-parking `
                        --timeout=180s

                    if ($LASTEXITCODE -ne 0) {
                        throw "DynamoDB deployment did not become ready."
                    }


                    // ------------------------------------------------
                    // Database Initialization
                    // ------------------------------------------------

                    Write-Host ""
                    Write-Host "Creating fresh DB initialization Job..."

                    $jobOutput = kubectl create `
                        -f k8s/db-init-job.yaml `
                        -o name

                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to create DB initialization Job."
                    }

                    $jobName = ($jobOutput -replace "job.batch/", "").Trim()

                    Write-Host ""
                    Write-Host "Created DB initialization Job:"
                    Write-Host $jobName

                    Write-Host ""
                    Write-Host "Waiting for database initialization..."

                    kubectl wait `
                        --for=condition=complete `
                        "job/$jobName" `
                        -n smart-parking `
                        --timeout=180s

                    if ($LASTEXITCODE -ne 0) {
                        Write-Host ""
                        Write-Host "Database initialization failed."

                        Write-Host ""
                        Write-Host "DB initialization logs:"

                        kubectl logs "job/$jobName" -n smart-parking

                        throw "Kubernetes database initialization failed."
                    }

                    Write-Host ""
                    Write-Host "Database initialization completed successfully."

                    Write-Host ""
                    Write-Host "DB initialization logs:"

                    kubectl logs "job/$jobName" -n smart-parking


                    // ------------------------------------------------
                    // Backend
                    // ------------------------------------------------

                    Write-Host ""
                    Write-Host "Applying Backend deployment..."

                    kubectl apply -f k8s/backend-deployment.yaml

                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to apply backend deployment."
                    }

                    Write-Host ""
                    Write-Host "Applying Backend service..."

                    kubectl apply -f k8s/backend-service.yaml

                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to apply backend service."
                    }


                    // ------------------------------------------------
                    // Frontend
                    // ------------------------------------------------

                    Write-Host ""
                    Write-Host "Applying Frontend deployment..."

                    kubectl apply -f k8s/frontend-deployment.yaml

                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to apply frontend deployment."
                    }

                    Write-Host ""
                    Write-Host "Applying Frontend service..."

                    kubectl apply -f k8s/frontend-service.yaml

                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to apply frontend service."
                    }


                    // ------------------------------------------------
                    // Final resource display
                    // ------------------------------------------------

                    Write-Host ""
                    Write-Host "============================================"
                    Write-Host "KUBERNETES MANIFESTS APPLIED"
                    Write-Host "============================================"

                    Write-Host ""
                    Write-Host "Smart Parking resources:"

                    kubectl get all -n smart-parking
                '''
            }
        }


        // ============================================================
        // 9. KUBERNETES ROLLING UPDATE
        // ============================================================

        stage('Kubernetes Rollout Status') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "KUBERNETES ROLLOUT STATUS"
                    Write-Host "============================================"

                    Write-Host ""
                    Write-Host "Waiting for Backend rollout..."

                    kubectl rollout status `
                        deployment/smart-parking-backend `
                        -n smart-parking `
                        --timeout=180s

                    if ($LASTEXITCODE -ne 0) {
                        throw "Backend Kubernetes rollout failed."
                    }

                    Write-Host ""
                    Write-Host "Backend rollout successful."

                    Write-Host ""
                    Write-Host "Waiting for Frontend rollout..."

                    kubectl rollout status `
                        deployment/smart-parking-frontend `
                        -n smart-parking `
                        --timeout=180s

                    if ($LASTEXITCODE -ne 0) {
                        throw "Frontend Kubernetes rollout failed."
                    }

                    Write-Host ""
                    Write-Host "Frontend rollout successful."

                    Write-Host ""
                    Write-Host "Kubernetes RollingUpdate completed successfully."

                    Write-Host ""
                    Write-Host "Deployment status:"

                    kubectl get deployments -n smart-parking

                    Write-Host ""
                    Write-Host "Pod status:"

                    kubectl get pods -n smart-parking
                '''
            }
        }


        // ============================================================
        // 10. KUBERNETES HEALTH CHECK
        // ============================================================

        stage('Kubernetes Health Check') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "KUBERNETES HEALTH CHECK"
                    Write-Host "============================================"

                    Write-Host ""
                    Write-Host "Checking backend health endpoint..."

                    $response = kubectl exec `
                        -n smart-parking `
                        deployment/smart-parking-backend `
                        -- wget -qO- http://127.0.0.1:5000/api/health

                    if ($LASTEXITCODE -ne 0) {
                        throw "Kubernetes backend health check failed."
                    }

                    Write-Host ""
                    Write-Host "Backend response:"
                    Write-Host $response

                    if ($response -notmatch '"status"\\s*:\\s*"OK"') {
                        throw "Kubernetes backend returned an unhealthy response."
                    }

                    Write-Host ""
                    Write-Host "Kubernetes backend is healthy."
                '''
            }
        }


        // ============================================================
        // 11. VERIFY ANSIBLE INVENTORY
        // ============================================================

        stage('Verify Ansible Inventory') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "VERIFYING ANSIBLE INVENTORY"
                    Write-Host "============================================"

                    $workspace = $env:WORKSPACE

                    $wslWorkspace = wsl bash -lc "wslpath '$workspace'"

                    if ($LASTEXITCODE -ne 0) {
                        throw "Unable to convert Jenkins workspace path to WSL path."
                    }

                    $wslWorkspace = $wslWorkspace.Trim()

                    Write-Host ""
                    Write-Host "WSL workspace:"
                    Write-Host $wslWorkspace

                    wsl bash -lc "cd '$wslWorkspace/ansible' && ansible-inventory -i inventory.ini --list"

                    if ($LASTEXITCODE -ne 0) {
                        throw "Ansible inventory verification failed."
                    }

                    Write-Host ""
                    Write-Host "Ansible inventory verified successfully."
                '''
            }
        }


        // ============================================================
        // 12. TEST EC2 CONNECTION
        // ============================================================

        stage('Test EC2 Connection') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "TESTING EC2 CONNECTION"
                    Write-Host "============================================"

                    $workspace = $env:WORKSPACE

                    $wslWorkspace = wsl bash -lc "wslpath '$workspace'"

                    if ($LASTEXITCODE -ne 0) {
                        throw "Unable to convert workspace path."
                    }

                    $wslWorkspace = $wslWorkspace.Trim()

                    Write-Host ""
                    Write-Host "Running Ansible ping..."

                    wsl bash -lc "cd '$wslWorkspace/ansible' && ansible -i inventory.ini smart_parking -m ping"

                    if ($LASTEXITCODE -ne 0) {
                        throw "EC2 Ansible connection test failed."
                    }

                    Write-Host ""
                    Write-Host "EC2 connection successful."
                '''
            }
        }


        // ============================================================
        // 13. DEPLOY TO AWS EC2
        // ============================================================

        stage('Deploy to EC2') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "DEPLOYING TO AWS EC2"
                    Write-Host "============================================"

                    $workspace = $env:WORKSPACE

                    $wslWorkspace = wsl bash -lc "wslpath '$workspace'"

                    if ($LASTEXITCODE -ne 0) {
                        throw "Unable to convert workspace path."
                    }

                    $wslWorkspace = $wslWorkspace.Trim()

                    Write-Host ""
                    Write-Host "Running Ansible deployment..."

                    wsl bash -lc "cd '$wslWorkspace/ansible' && ansible-playbook -i inventory.ini playbook.yml"

                    if ($LASTEXITCODE -ne 0) {
                        throw "EC2 Ansible deployment failed."
                    }

                    Write-Host ""
                    Write-Host "EC2 deployment completed successfully."
                '''
            }
        }


        // ============================================================
        // 14. EC2 HEALTH CHECK
        // ============================================================

        stage('EC2 Health Check') {
            steps {
                powershell '''
                    Write-Host "============================================"
                    Write-Host "EC2 HEALTH CHECK"
                    Write-Host "============================================"

                    $workspace = $env:WORKSPACE

                    $wslWorkspace = wsl bash -lc "wslpath '$workspace'"

                    if ($LASTEXITCODE -ne 0) {
                        throw "Unable to convert workspace path."
                    }

                    $wslWorkspace = $wslWorkspace.Trim()

                    Write-Host ""
                    Write-Host "Checking EC2 backend health..."

                    wsl bash -lc "cd '$wslWorkspace/ansible' && ansible -i inventory.ini smart_parking -m shell -a 'curl -fsS http://127.0.0.1:5000/api/health'"

                    if ($LASTEXITCODE -ne 0) {
                        throw "EC2 backend health check failed."
                    }

                    Write-Host ""
                    Write-Host "EC2 backend is healthy."
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
============================================================
SMART PARKING CI/CD PIPELINE SUCCESSFUL
============================================================

FRONTEND CI:
  ✓ Dependencies installed
  ✓ Unit tests passed
  ✓ Lint passed
  ✓ Production build successful

BACKEND CI:
  ✓ Dependencies installed
  ✓ Unit tests passed

DEVSECOPS:
  ✓ npm audit completed
  ✓ Trivy container scans completed

DOCKER:
  ✓ Backend image built
  ✓ Frontend image built
  ✓ DB-init image built

KUBERNETES:
  ✓ Minikube access verified
  ✓ Docker images loaded into Minikube
  ✓ Namespace and ConfigMap applied
  ✓ DynamoDB deployed
  ✓ Database initialization completed
  ✓ Backend deployed
  ✓ Frontend deployed
  ✓ RollingUpdate completed
  ✓ Backend health check passed

AWS EC2:
  ✓ Ansible inventory verified
  ✓ EC2 connection verified
  ✓ Application deployed
  ✓ Backend health check passed

============================================================
DEPLOYMENT COMPLETED SUCCESSFULLY
============================================================
'''
        }

        failure {
            echo '''
============================================================
SMART PARKING CI/CD PIPELINE FAILED
============================================================

One or more pipeline stages failed.

Please check the Jenkins Console Output to identify
the exact failed stage and error.

============================================================
'''
        }

        always {
            echo "Smart Parking CI/CD pipeline execution finished."
        }
    }
}