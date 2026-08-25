output "vpc_id" {
  description = "Application VPC ID."
  value       = aws_vpc.main.id
}

output "subnet_id" {
  description = "Public application subnet ID."
  value       = aws_subnet.public.id
}

output "security_group_id" {
  description = "Application security group ID."
  value       = aws_security_group.app.id
}

output "instance_id" {
  description = "EC2 instance ID."
  value       = aws_instance.app.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance."
  value       = aws_instance.app.public_ip
}

output "ecr_backend_repository" {
  description = "Backend ECR repository URL."
  value       = aws_ecr_repository.backend.repository_url
}

output "ecr_frontend_repository" {
  description = "Frontend ECR repository URL."
  value       = aws_ecr_repository.frontend.repository_url
}
