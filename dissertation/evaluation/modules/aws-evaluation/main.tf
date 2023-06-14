data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  azs = data.aws_availability_zones.available.names
}

resource "aws_ebs_volume" "this" {
  count = var.resource_count

  availability_zone = local.azs[count.index % length(local.azs)]
  size              = 1
  type              = "gp3"

  tags = {
    Name    = "vol-sap-rti-${var.region}-eval-${count.index}"
    project = "rti"
  }
}

resource "aws_s3_bucket" "this" {
  count = var.resource_count

  bucket        = "bucket-sap-rti-${var.region}-eval-${count.index}"
  force_destroy = true

  tags = {
    Name    = "bucket-sap-rti-${var.region}-eval-${count.index}"
    project = "rti"
  }
}

resource "aws_default_vpc" "default" {
  tags = {
    Name = "Default VPC"
  }
}

resource "aws_security_group" "allow_tls" {
  count = var.resource_count

  name        = "${var.region}-eval-${count.index}"
  description = "Allow TLS inbound traffic"
  vpc_id      = aws_default_vpc.default.id

  ingress {
    description = "Allow TLS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [aws_default_vpc.default.cidr_block]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.region}-eval-${count.index}"
    project = "rti"
  }
}
