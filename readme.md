# Cloud Computing Coursework

excercise for end to end automation that deploys, configures and tests an API hosted on GCP. 

![alt text](/assets/cloudcomputingcoursework.png)

## Features

- **Api Docker image**: publically available api app
- **Deployment mechanism**: declare and provision infrastructure with terraform and ansible
- **Testing Framework**: Automated test suite


## Prerequisites
- **Ansible ,Terraform , and GCP credentials are installed and configured on local**
- **Common ssh key**

## Steps To deploy 
- cd Deployment/test
- chmod +x bootstrap.sh
- ./bootstrap.sh
- chmod +x trigger.sh
- ./trigger.sh
