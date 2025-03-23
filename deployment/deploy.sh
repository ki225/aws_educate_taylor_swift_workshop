aws cloudformation deploy \
  --template-file bedrock_deployment/lambda-template.yaml \
  --stack-name taylor-swift-analysis \
  --capabilities CAPABILITY_IAM \
  --profile ws-sandbox \
  --region us-east-1
