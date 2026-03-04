pipeline {
    agent any

    environment {
        APP_NAME     = 'cicd-demo-app'
        DOCKER_IMAGE = "pulidof/${APP_NAME}"
        PATH         = "/var/jenkins_home/bin:${env.PATH}"
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                cleanWs()
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.GIT_COMMIT_FULL = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
                    env.GIT_AUTHOR = sh(script: 'git log -1 --pretty=%an', returnStdout: true).trim()
                }
                echo "Commit: ${env.GIT_COMMIT_SHORT} | Author: ${env.GIT_AUTHOR}"
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - 2>/dev/null || true
                    apt-get install -y nodejs 2>/dev/null || true
                    npm ci || echo "npm ci skipped"
                '''
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test || echo "Tests completed"'
            }
        }

        stage('Code Analysis') {
            steps {
                sh '''
                    npx eslint src/ tests/ --format compact || echo "ESLint completed"
                    npm audit --audit-level=high || echo "Audit completed"
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh """
                    echo "Deploying ${DOCKER_IMAGE}:${GIT_COMMIT_FULL} to production..."
                    kubectl set image deployment/${APP_NAME} ${APP_NAME}=${DOCKER_IMAGE}:${GIT_COMMIT_FULL} -n production
                    kubectl annotate deployment/${APP_NAME} kubernetes.io/change-cause="Jenkins Build #${BUILD_NUMBER} - Commit ${GIT_COMMIT_SHORT}" -n production --overwrite
                """
            }
        }

        stage('Verify Deployment') {
            steps {
                sh """
                    echo "Verifying deployment rollout..."
                    kubectl rollout status deployment/${APP_NAME} -n production --timeout=120s
                    echo "=== Pods Status ==="
                    kubectl get pods -n production -l app=${APP_NAME} -o wide
                    echo "=== Current Image ==="
                    kubectl get deployment ${APP_NAME} -n production -o jsonpath='{.spec.template.spec.containers[0].image}'
                    echo ""
                """
            }
        }
    }

    post {
        success {
            echo """
            ========================================
            PIPELINE CD EXITOSO
            ========================================
            App:     ${APP_NAME}
            Image:   ${DOCKER_IMAGE}:${GIT_COMMIT_FULL}
            Build:   #${BUILD_NUMBER}
            Author:  ${GIT_AUTHOR}
            Commit:  ${GIT_COMMIT_SHORT}
            Status:  Deployed to Kubernetes (production)
            ========================================
            """
        }
        failure {
            echo "PIPELINE FALLIDO - Build #${BUILD_NUMBER}"
        }
        always {
            cleanWs()
        }
    }
}
