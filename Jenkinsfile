#!groovy

import java.io.*;
import java.util.*;
import java.text.SimpleDateFormat;

def dateFormat = new SimpleDateFormat("yyyyMMddHHmm")
def date = new Date()
def helmChartRepo = 'https://github.com/GeorgeKalisse/helm.git'
def chartName = 'hello-world'
def namespace = 'sample-app'

pipeline {
    agent none
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 14, unit: 'HOURS')
    }
    stages {
        stage('build') {
            agent {
                kubernetes {
                    defaultContainer 'jnlp'
                    yaml """
apiVersion: v1
kind: Pod
metadata:
spec:
  serviceAccount: "jenkins-agent"
  containers:
  - name: jnlp
    image: "jenkins/jnlp-slave:3.29-1"
    imagePullPolicy: Always
    tty: true
    resources:
      requests:
        cpu: "0.5"
        memory: "500Mi"
      limits:
        cpu: "1"
        memory: "1G"
    securityContext:
      privileged: true
      allowPrivilegeEscalation: true
  - name: docker
    image: "docker:19.03.7-dind"
    imagePullPolicy: Always
    resources:
      requests:
        cpu: "0.5"
        memory: "500Mi"
      limits:
        cpu: "1"
        memory: "6G"
    securityContext:
      privileged: true
      allowPrivilegeEscalation: true
                    """
                }
            }
            steps {
                script {
                    container('docker'){
                        withCredentials([string(credentialsId: 'dockerconfigjson', variable: 'DOCKERCONFIGJSON')]) {

                                sh """
                                    printenv
                                    echo \$DOCKERCONFIGJSON > config.json
                                    cat config.json
                                    docker --config=\$(pwd) build \
                                              --rm=false \
                                              -t georgekalisse/helloworld:${dateFormat.format(date)} \
                                              \$(pwd)
                                    docker tag georgekalisse/helloworld:${dateFormat.format(date)} georgekalisse/helloworld:latest
                                    docker --config=\$(pwd) push \
                                        georgekalisse/helloworld:${dateFormat.format(date)}
                                    docker --config=\$(pwd) push \
                                        georgekalisse/helloworld:latest
                                """

                        }
                    }
                }
            }
        }
        stage('Deploy to Non-Prod') {
            agent {
                kubernetes {
                    defaultContainer 'jnlp'
                    yaml """
apiVersion: v1
kind: Pod
metadata:
spec:
  serviceAccount: "jenkins-agent"
  containers:
  - name: jnlp
    image: "jenkins/jnlp-slave:3.29-1"
    imagePullPolicy: Always
    tty: true
    resources:
      requests:
        cpu: "0.5"
        memory: "500Mi"
      limits:
        cpu: "1"
        memory: "1G"
    securityContext:
      privileged: true
      allowPrivilegeEscalation: true
  - name: helm
    image: alpine/helm:2.14.0
    imagePullPolicy: Always
    command:
    - cat
    tty: true
    securityContext:
      privileged: true
      allowPrivilegeEscalation: true
  - name: kubectl
    image: lachlanevenson/k8s-kubectl:v1.15.0
    imagePullPolicy: Always
    command:
    - cat
    tty: true
    securityContext:
      privileged: true
      allowPrivilegeEscalation: true
                    """
                }
            }
            steps {
                script {

                    dir('devops') {
                      checkout([$class: 'GitSCM',
                        branches: [[name: '*/master']],
                        doGenerateSubmoduleConfigurations: false,
                        extensions: [],
                        submoduleCfg: [],
                        userRemoteConfigs: [[credentialsId: 'george-github', url: "${helmChartRepo}"]]
                      ])
                          sh "ls -la"
                      }

                    container('helm'){
                        withKubeConfig([credentialsId: 'nonprod-token', serverUrl: 'https://34.73.244.22']) {
                            sh """
                                helm template --name=hello-world --namespace=${namespace} devops/helm/${chartName} \
                                    --set image.tag=${dateFormat.format(date)} > template.yaml
                            """

                        }
                    }
                    container('kubectl'){
                        withKubeConfig([credentialsId: 'nonprod-token', serverUrl: 'https://34.73.244.22']) {
                            sh 'kubectl config current-context'
                            sh "more $KUBECONFIG >> ${WORKSPACE}/kubeconfig"
                            sh "chmod 755 ${WORKSPACE}/kubeconfig"
                            sh "kubectl -n ${namespace} apply --dry-run -f template.yaml"
                            sleep 3000
                        }
                    }
                }
            }
        }
        stage('Promote to Prod?') {
            agent none
            steps {
                script {
                    try {
                      timeout(time: 12, unit: 'HOURS') {
                          input(
                            message: "Promote to Production?",
                            ok: 'Promote',
                          )
                      }
                    } catch (err) {
                        echo "Promotion to production aborted"
                        echo "${err}"
                        currentBuild.result = 'SUCCESS'
                        throw err
                    }
                }
            }
        }
        stage('Deploy to Prod') {
            agent {
                kubernetes {
                    defaultContainer 'jnlp'
                    yaml """
apiVersion: v1
kind: Pod
metadata:
spec:
  serviceAccount: "jenkins-agent"
  containers:
  - name: jnlp
    image: "jenkins/jnlp-slave:3.29-1"
    imagePullPolicy: Always
    tty: true
    resources:
      requests:
        cpu: "0.5"
        memory: "500Mi"
      limits:
        cpu: "1"
        memory: "1G"
    securityContext:
      privileged: true
      allowPrivilegeEscalation: true
  - name: helm
    image: alpine/helm:2.14.0
    imagePullPolicy: Always
    command:
    - cat
    tty: true
    securityContext:
      privileged: true
      allowPrivilegeEscalation: true
  - name: kubectl
    image: lachlanevenson/k8s-kubectl:v1.15.0
    imagePullPolicy: Always
    command:
    - cat
    tty: true
    securityContext:
      privileged: true
      allowPrivilegeEscalation: true
                    """
                }
            }
            steps {
                script {
                    container('docker'){
                        withCredentials([string(credentialsId: 'dockerconfigjson', variable: 'DOCKERCONFIGJSON')]) {

                                sh """
                                    echo deploying to prod
                                """

                        }
                    }
                }
            }
        }
    }
}