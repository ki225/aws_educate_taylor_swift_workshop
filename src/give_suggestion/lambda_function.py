import base64
import json
import logging
import os
import re
from urllib.parse import urlparse

import boto3

# 設置日誌
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# 初始化 Bedrock 客戶端
bedrock_runtime = boto3.client('bedrock-runtime')

def lambda_handler(event, context):
    """
    分析圖片並提供建議
    
    Args:
        event: 包含圖片 URI 的事件
        context: Lambda 上下文
        
    Returns:
        包含分析結果和建議的字典
    """
    try:
        logger.info("Received event: %s", json.dumps(event))
        
        # 從事件中獲取圖片 URI
        image_uri = None
        if 'imageUri' in event:
            image_uri = event['imageUri']
        elif 'body' in event and isinstance(event['body'], str) and 's3://' in event['body']:
            # 從字符串中提取 S3 URI
            s3_uri_match = re.search(r's3://[^\s\'\"]+', event['body'])
            if s3_uri_match:
                image_uri = s3_uri_match.group(0)
        
        if not image_uri:
            return {
                'statusCode': 400,
                'body': 'No image URI provided',
                'suggestions': ['請提供有效的圖片 URI']
            }
        
        # 解析 S3 URI
        parsed_uri = urlparse(image_uri)
        bucket_name = parsed_uri.netloc
        key = parsed_uri.path.lstrip('/')
        
        # 從 S3 獲取圖片
        s3 = boto3.client('s3')
        image_object = s3.get_object(Bucket=bucket_name, Key=key)
        image_content = image_object['Body'].read()
        
        # 將圖片轉換為 base64
        image_base64 = base64.b64encode(image_content).decode('utf-8')
        
        # 準備 Bedrock 請求
        model_id = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-sonnet-20240229-v1:0')
        
        # 構建提示
        prompt = f"""
        <image base64="{image_base64}">
        
        這是一個關於 Taylor Swift 巡演數據的可視化圖表。請分析這個圖表並提供以下內容：
        
        1. 圖表顯示的主要趨勢或模式是什麼？
        2. 從數據中可以得出哪些有價值的見解？
        3. 有哪些可能的改進建議，以使這個可視化更加清晰或信息更豐富？
        4. 基於這些數據，對於 Taylor Swift 的巡演策略有什麼建議？
        
        請以繁體中文回答，並確保你的回答是具體的、基於圖表中可見的數據的。
        """
        
        # 調用 Bedrock 模型
        response = bedrock_runtime.invoke_model(
            modelId=model_id,
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 1000,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ]
                    }
                ]
            })
        )
        
        # 解析響應
        response_body = json.loads(response['body'].read())
        analysis_text = response_body['content'][0]['text']
        
        # 提取建議
        suggestions = []
        suggestion_pattern = r'3\.\s*有哪些可能的改進建議.*?(?=4\.|\Z)'
        suggestion_match = re.search(suggestion_pattern, analysis_text, re.DOTALL)
        if suggestion_match:
            suggestion_text = suggestion_match.group(0)
            # 提取建議項目
            suggestion_items = re.findall(r'[-•]\s*(.*?)(?=[-•]|\Z)', suggestion_text, re.DOTALL)
            if suggestion_items:
                suggestions = [item.strip() for item in suggestion_items if item.strip()]
            else:
                # 如果沒有找到項目符號，則使用整個建議文本
                suggestions = [suggestion_text.strip()]
        
        # 如果沒有找到建議，則使用整個分析文本
        if not suggestions:
            suggestions = ["請參考完整分析以獲取建議"]
        
        return {
            'statusCode': 200,
            'imageUri': image_uri,
            'analysis': analysis_text,
            'suggestions': suggestions,
            'body': json.dumps({
                'imageUri': image_uri,
                'analysis': analysis_text,
                'suggestions': suggestions
            })
        }
        
    except Exception as e:
        logger.error("Error analyzing image: %s", str(e))
        import traceback
        logger.error(traceback.format_exc())
        return {
            'statusCode': 500,
            'body': f'Error analyzing image: {str(e)}',
            'suggestions': ['處理圖片時發生錯誤，請稍後再試']
        } 