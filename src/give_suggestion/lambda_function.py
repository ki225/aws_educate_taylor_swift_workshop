import base64
import json
import logging
import boto3
from io import StringIO
import pandas as pd

# Set up logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def get_data_from_s3(bucket_name, key):
    try:
        s3_client = boto3.client('s3')
        response = s3_client.get_object(Bucket=bucket_name, Key=key)
        data = response['Body'].read()
        return data
    except Exception as e:
        logger.error(f"Error getting data from S3: {str(e)}")
        raise

def get_csv_from_s3():
    """
    Read CSV data from S3
    
    Returns:
        JSON data from CSV
    """
    try:
        all_res = get_data_from_s3("20250329-aws-educate-taylor-swift-workshop", "dataset/Taylor_Train_cleaned.csv")
        csv_data = all_res.decode('utf-8')
        
        # to json format
        df = pd.read_csv(StringIO(csv_data))
        json_data = json.loads(df.to_json(orient="records", lines=False))
        return json_data
    except Exception as e:
        logger.error(f"Error getting CSV from S3: {str(e)}")
        raise

def get_image_from_s3(bucket_name, image_key):
    """
    Read image from S3
    
    Args:
        bucket_name: S3 bucket name
        image_key: Image path in S3
        
    Returns:
        Base64 encoded image string
    """
    try:
        image_data = get_data_from_s3(bucket_name, image_key)
        base64_image = base64.b64encode(image_data).decode('utf-8')
        return base64_image
    except Exception as e:
        logger.error(f"Error reading image from S3: {str(e)}")
        raise

def get_suggestion_from_bedrock(base64_image, userQuery):
    """
    Analyze image using Bedrock's Nova model
    
    Args:
        base64_image: Base64 encoded image
        userQuery: User's query text
        
    Returns:
        Model's analysis and suggestions
    """
    try:
        bedrock_runtime = boto3.client('bedrock-runtime')
        csv_json = get_csv_from_s3()
        
        prompt = f"""
            請根據使用者的查詢內容、CSV資料，生成一份專業且通順的繁體中文商業洞察報告，並搭配報告分析圖表去回應使用者的問題。報告應包含以下內容：

            1. 根據使用者的查詢，明確識別報告的目標。
            2. 總結圖表中的關鍵發現與洞察，重點關注能支持使用者想了解的要點，例如: 活動規劃或商業決策的模式、趨勢與顯著要點。
            3. 從CSV檔案中提取具體的案例紀錄，在報告中穿插實際數據以佐證、強化報告結論並提升其可信度與專業性，避免主觀意見或無支持的解釋。
            4. 保持中立與客觀的語氣，確保所有洞察基於所提供的資料與視覺化內容，除非明確提及，否則不對藝術家或外部因素做假設。
            5. 避免內容重複，保持報告簡潔且有條理。

            - 使用者詢問內容: {userQuery}
            - 分析圖表: {base64_image}
            - csv 資料內容: {csv_json}
        """

        request_body = {
            "schemaVersion": "messages-v1",
            "system": [
                {"text": "你是一位數據分析專家。根據分析圖表和數據集等資料生成專業的分析與洞察。"}
            ],
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "image": {
                                "format": "png",
                                "source": {"bytes": base64_image}
                            }
                        },
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "inferenceConfig": {
                "maxTokens": 5000, 
                "temperature": 0.7, 
                "topP": 0.9
            }
        }

        response = bedrock_runtime.invoke_model(
            modelId="us.amazon.nova-lite-v1:0",
            body=json.dumps(request_body)
        )
        
        model_response = json.loads(response["body"].read())
        return model_response["output"]["message"]["content"][0]["text"]
        
    except Exception as e:
        logger.error(f"Error getting suggestion from Bedrock: {str(e)}")
        raise

def lambda_handler(event, context):
    """
    Process Agent requests to analyze S3 images and get Bedrock suggestions
    
    Args:
        event: Lambda event
        context: Lambda context
        
    Returns:
        Response containing Bedrock's analysis
    """
    try:
        logger.info(f"Received event: {json.dumps(event, indent=2)}")
        
        # Parse input data
        input_data = json.loads(event['node']['inputs'][0]['value'])
        image_uri = input_data['image_uri']
        userQuery = input_data['userQuery']
        
        # Parse bucket and key from image_uri
        # Format: s3://bucket-name/key
        bucket_name = image_uri.split('/')[2]
        image_key = '/'.join(image_uri.split('/')[3:])
        
        # Get image from S3
        base64_image = get_image_from_s3(bucket_name, image_key)
        
        # Get suggestion from Bedrock
        suggestion = get_suggestion_from_bedrock(base64_image, userQuery)
        
        result = {
            "statusCode": "200",
            "body": json.dumps({
                "suggestion": suggestion
            })
        }
        return json.dumps(result)
        
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        result = {
            "statusCode": "500",
            "body": json.dumps({
                "error": str(e)
            })
        }
        return json.dumps(result) 