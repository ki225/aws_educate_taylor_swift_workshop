import base64
import json
import logging

import boto3

# Set up logger
logger = logging.getLogger()
logger.setLevel(logging.INFO)

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
        s3_client = boto3.client('s3')
        response = s3_client.get_object(Bucket=bucket_name, Key=image_key)
        image_data = response['Body'].read()
        base64_image = base64.b64encode(image_data).decode('utf-8')
        return base64_image
    except Exception as e:
        logger.error(f"Error reading image from S3: {str(e)}")
        raise

def get_suggestion_from_bedrock(base64_image):
    """
    Analyze image using Bedrock's Claude model
    
    Args:
        base64_image: Base64 encoded image
        
    Returns:
        Model's analysis and suggestions
    """
    try:
        bedrock_runtime = boto3.client('bedrock-runtime')
        
        prompt = """Please analyze this image which shows attendance distribution data for a Taylor Swift concert. 
        Provide specific insights and suggestions based on the data shown in the visualization. 
        Focus on patterns, trends, and any notable observations that could be useful for event planning."""
        
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
        
        # Parse bucket and key from image_uri
        # Format: s3://bucket-name/key
        bucket_name = image_uri.split('/')[2]
        image_key = '/'.join(image_uri.split('/')[3:])
        
        # Get image from S3
        base64_image = get_image_from_s3(bucket_name, image_key)
        
        # Get suggestion from Bedrock
        suggestion = get_suggestion_from_bedrock(base64_image)
        
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