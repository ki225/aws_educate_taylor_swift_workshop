# AWS Bedrock Deployment Guide

### 1. 部署基礎設施
1. 給予部署腳本執行權限：
```bash
chmod +x bedrock_deployment/deploy.sh
```

2. 執行部署腳本：
```bash
./bedrock_deployment/deploy.sh
```

注意：如果遇到權限不足的問題，請確認：
- 已正確設定 AWS CLI 的設定檔（profile）
- 使用的 profile 具有足夠的 IAM 權限
- 位於專案根目錄執行腳本

### 2. Bedrock 設定
1. 申請 Bedrock Model access
2. 在 AWS Console 建立 prompt flow
   - 設定 [Prompt](/src/prompt/llm_instruction.txt)
   - 設定 Foundation Model

### 3. 建立 Bedrock Flow
1. 建立 prompt node（選擇步驟 2 中創建的）
2. 設定 lambda node 串接：
   - Lambda 1: generate_report 函數
   - Lambda 2: give_suggestions 函數

### 4. Lambda 1 (generate_report)設定
#### Resource-based Policy 設定
選項 1: JSON 格式
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "bedrock.amazonaws.com"
      },
      "Action": "lambda:InvokeFunction",
      "Resource": "<YOUR_PROMPT_MANAGEMENT_ARN>"
    }
  ]
}
```

選項 2: 手動設定
- 選擇 aws-service
- Statement ID: 001
- Principal: bedrock.amazonaws.com
- Resource: <YOUR_PROMPT_MANAGEMENT_ARN>
- Action: Invoke function

### 開發者專用區域 (Optimal)
#### Docker 映像建立與部署
##### 1. ECR 登入
```bash
# Public ECR 登入
# 這個Profile 是 rich-liu account
aws ecr-public get-login-password --region us-east-1 --profile my-profile | docker login --username AWS --password-stdin public.ecr.aws

# Private ECR 登入
aws ecr get-login-password --region us-east-1 --profile my-profile | docker login --username AWS --password-stdin 070576557102.dkr.ecr.us-east-1.amazonaws.com/20250329-aws-educate-taylor-swift-workshop
```

##### 2. 建立 Docker 映像
```bash
# 建立 generate_report 映像
cd src/generate_report
docker build -t generate-report .

# 建立 give_suggestion 映像
cd src/give_suggestion
docker build -t give-suggestion .
```

##### 3. 標記映像
```bash
docker tag generate-report 070576557102.dkr.ecr.us-east-1.amazonaws.com/20250329-aws-educate-taylor-swift-workshop:generate-report
docker tag give-suggestion 070576557102.dkr.ecr.us-east-1.amazonaws.com/20250329-aws-educate-taylor-swift-workshop:give-suggestion
```

##### 4. 推送映像
```bash
docker push 070576557102.dkr.ecr.us-east-1.amazonaws.com/20250329-aws-educate-taylor-swift-workshop:generate-report
docker push 070576557102.dkr.ecr.us-east-1.amazonaws.com/20250329-aws-educate-taylor-swift-workshop:give-suggestion
```

##### 5. 更新 Lambda 函數（如需要）
```bash
# 這邊要再 ws 環境下指令
aws lambda update-function-code --function-name taylor-swift-analysis-GenerateReport --image-uri 070576557102.dkr.ecr.us-east-1.amazonaws.com/20250329-aws-educate-taylor-swift-workshop:generate-report

aws lambda update-function-code --function-name taylor-swift-analysis-GiveSuggestion --image-uri 070576557102.dkr.ecr.us-east-1.amazonaws.com/20250329-aws-educate-taylor-swift-workshop:give-suggestion
```
