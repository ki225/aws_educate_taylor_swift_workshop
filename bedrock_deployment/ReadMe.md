1. 要 Model access
2. 手動去 Console 建立 Bedrock Agent, 設定 Prompt, FM, permission 
3. Save then prepare
4. 建立 Bedrock Flow, 先拉 agent node 選 step 2 創建的
5. agent node 後面接lambda 1, function是generate_report
6. lambda 1 後面是 lambda 2, 名稱是give suggestions

Premission要調