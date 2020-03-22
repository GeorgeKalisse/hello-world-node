#!groovy

import java.io.*;
import java.util.*;
import java.text.SimpleDateFormat;

def dateFormat = new SimpleDateFormat("yyyyMMddHHmm")
def date = new Date()
def helmChartRepo = 'https://github.com/GeorgeKalisse/helm.git'
def chartName = 'mysupport'

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
        cpu: "2"
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
        }
    }
}