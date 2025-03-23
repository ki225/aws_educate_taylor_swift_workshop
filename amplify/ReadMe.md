# AWS CodeCommit Deployment Guided 

## 前置準備

1. AWS IAM 設定
   - 登入 AWS Console
   - 前往 IAM User 的 Security Credentials
   - 在 HTTPS Git credentials for AWS CodeCommit 區段產生認證
   - 下載 Git credentials

## 專案設置步驟

### 1. 使用 Cloud Shell 複製專案

```bash
# 使用 mirror 模式複製 GitHub 專案
git clone --mirror https://github.com/aws-educate-tw/aws_educate_taylor_swift_workshop.git

# 進入專案目錄
cd aws_educate_taylor_swift_workshop.git/

# 更新遠端倉庫 URL 為 CodeCommit 的地址
git remote set-url origin https://git-codecommit.us-east-1.amazonaws.com/v1/repos/aws_educate_taylor_swift_workshop

# 推送所有內容到 CodeCommit（這一步會要求輸入認證資訊）
git push --mirror
# 當系統要求輸入認證時：
# Username: 輸入下載的 Git credentials 中的 Username
# Password: 輸入下載的 Git credentials 中的 Password
```