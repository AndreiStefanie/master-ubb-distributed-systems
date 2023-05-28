# RTI AWS Integration

This contains the infrastructure necessary for RTI to monitor a target AWS account.

It configures AWS Config to record changes for specific assets (EC2 instances, S3 buckets, Lambda functions) and AWS EventBridge to forward the AWS Config item changes to the RTI EventBridge bus.

## Deployment

1. Make sure your AWS CLI is authenticated with the intended AWS account
2. Update `vals.auto.tfvars` if necessary
3. `terraform apply`
