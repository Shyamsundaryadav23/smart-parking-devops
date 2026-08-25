# Smart Parking AWS Infrastructure

This Terraform module creates the AWS foundation for the Smart Parking deployment:

- Custom VPC and public subnet
- Internet gateway and public route table
- Security group for SSH and the public frontend
- EC2 IAM role with ECR read access
- ECR repositories for backend and frontend images
- Ubuntu EC2 instance

The application still uses the existing Docker Compose DynamoDB Local service. No DynamoDB cloud table or Firestore migration is created here.

## Usage

```powershell
Copy-Item terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars and set ssh_cidr and key_pair_name
terraform init
terraform fmt -check
terraform validate
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

Destroy resources when finished to control costs:

```powershell
terraform destroy -var-file=terraform.tfvars
```
