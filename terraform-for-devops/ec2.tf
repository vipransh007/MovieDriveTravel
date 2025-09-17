# key pair login
resource "aws_key_pair" "my_key" {
  key_name   = "terra-key-ec2"
  public_key = file("terra-key-ec2.pub")
}

# VPC & Security Groups
resource "aws_default_vpc" "default" {
}

resource "aws_security_group" "my_security_group" {
  name        = "autmate-sg"
  description = "This will add a new TF generated security group"
  vpc_id      = aws_default_vpc.default.id # Corrected reference to the VPC

  # INBOUND RULES
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH open"
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP open" # Corrected description
  }

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Flask App"
  }

  # OUTBOUND RULE
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Wil be used for the outbound"
  }


  tags = {
    Name = "automate-sg"
  }
}

# ec2 instance
resource "aws_instance" "my-instance" {
  key_name        = aws_key_pair.my_key.key_name
  security_groups = [aws_security_group.my_security_group.name]
  instance_type   = "t2.micro"
  ami             = "ami-0cbdasa8adswa7cb" # NOTE: This is a placeholder and must be replaced with a valid AMI ID for your region.

  root_block_device {
    volume_size = 15
    volume_type = "gp3"
  }

  tags = {
    Name = "TWS-My_instanceandLeanring"
  }
}