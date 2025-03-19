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
        csv_data = all_res.split.decode('utf-8')
        
        # to json format
        df = pd.read_csv(StringIO(csv_data))
        json_data = json.loads(df.to_json(orient="records", lines=False))  # or lines=True for line-delimited JSON
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
    Analyze image using Bedrock's Claude model
    
    Args:
        base64_image: Base64 encoded image
        
    Returns:
        Model's analysis and suggestions
    """
    try:
        bedrock_runtime = boto3.client('bedrock-runtime')
        csv_json = get_csv_from_s3()
        
        prompt = f"""
            Based on the user query, the CSV data, and the business insights derived from the provided chart image, please generate a **comprehensive and professional report** addressing the user's question.

            The report should include the following:
            1. Clearly identify the report's objective based on the user's query.
            2. Summarize key findings and insights from the chart, focusing on patterns, trends, and notable points that could support event planning or business decision-making.
            3. Extract and incorporate specific, data-driven examples from the CSV file (e.g., notable concerts, tours, or attendance records) to reinforce the report’s conclusions and enhance its credibility and professionalism.
            4. Maintain a neutral and objective tone, ensuring that all insights are grounded in the data and visualization provided, without making assumptions about the artist or external factors unless explicitly mentioned.
            5. Avoid subjective opinions or unsupported interpretations, and ensure that the report delivers a data-driven response that directly addresses the user's query.
            
            userQuery: {userQuery}

            csv_dataframe: {csv_json}
        """

        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/png",
                                "data": base64_image
                            }
                        },
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        }

        response = bedrock_runtime.invoke_model(
            modelId="arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0",
            body=json.dumps(body)
        )
        
        response_body = json.loads(response['body'].read())
        return response_body['content'][0]['text']
        
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
        image_uri = input_data['imageUri']
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