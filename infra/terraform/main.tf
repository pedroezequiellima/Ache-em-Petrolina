terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Altere a região conforme necessário
provider "aws" {
  region = "us-east-1"
}

# Grupo de segurança liberando portas web, API e Front
resource "aws_security_group" "ache_petrolina_sg" {
  name        = "ache-petrolina-sg"
  description = "Permite trafego para o Ache em Petrolina"

  ingress {
    description = "Frontend Next.js"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Backend NestJS API"
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH para administracao"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["SEU_IP_AQUI/32"] # Por seguranca, restrinja ao seu IP
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "app_server" {
  ami           = "ami-0c7217cdde317cfec" # Ubuntu Server 22.04 LTS (us-east-1)
  instance_type = "t3.small"
  vpc_security_group_ids = [aws_security_group.ache_petrolina_sg.id]

  tags = {
    Name = "AchePetrolina-Producao"
  }
}