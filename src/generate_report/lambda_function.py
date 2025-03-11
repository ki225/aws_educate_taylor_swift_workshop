import base64
import json
import logging
import os
import traceback
import uuid
from io import BytesIO, StringIO

import boto3
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# 設置日誌
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    """
    執行 LLM 生成的 Python 代碼並將結果返回
    
    Args:
        event: 包含 LLM 生成的 Python 代碼的事件
        context: Lambda 上下文
        
    Returns:
        包含執行結果的字典
    """
    try:
        logger.info("Received event: %s", json.dumps(event))
        
        # 從事件中獲取 Python 代碼
        python_code = event.get('pythonCode', '')
        
        if not python_code:
            return {
                'statusCode': 400,
                'body': 'No Python code provided'
            }
        
        # 生成唯一的執行 ID
        execution_id = str(uuid.uuid4())
        
        # 創建一個安全的執行環境
        local_vars = {
            'boto3': boto3,
            'os': os,
            'BytesIO': BytesIO,
            'StringIO': StringIO,
            'json': json,
            'base64': base64,
            'execution_id': execution_id,
            'logger': logger,
            'pd': pd,
            'plt': plt,
            'sns': sns,
            'np': np
        }
        
        # 修改代碼以捕獲返回值
        modified_code = python_code
        
        # 如果代碼中已經有 lambda_handler 函數，則直接執行它
        if 'def lambda_handler(' in python_code:
            # 添加代碼來執行 lambda_handler 並捕獲結果
            modified_code += "\n\n# 執行 lambda_handler 並捕獲結果\nresult = lambda_handler({'query': 'execute analysis'}, None)"
        else:
            # 如果沒有 lambda_handler，則將整個代碼作為一個函數執行
            logger.warning("No lambda_handler function found in the code, executing as script")
        
        # 執行修改後的代碼
        logger.info("Executing Python code")
        exec(modified_code, globals(), local_vars)
        
        # 獲取執行結果
        result = local_vars.get('result', {})
        
        # 如果結果是字符串，則嘗試解析為 JSON
        if isinstance(result, str):
            try:
                result = json.loads(result)
            except:
                result = {'body': result}
        
        # 如果結果中沒有 statusCode，則添加一個
        if isinstance(result, dict) and 'statusCode' not in result:
            result['statusCode'] = 200
            
        # 確保結果包含 imageUri
        if isinstance(result, dict) and 'body' in result and 'imageUri' not in result:
            # 嘗試從 body 中提取 imageUri
            body = result['body']
            if isinstance(body, str) and 's3://' in body:
                # 從字符串中提取 S3 URI
                import re
                s3_uri_match = re.search(r's3://[^\s\'\"]+', body)
                if s3_uri_match:
                    result['imageUri'] = s3_uri_match.group(0)
            
        logger.info("Execution completed successfully")
        return result
        
    except Exception as e:
        logger.error("Error executing Python code: %s", str(e))
        logger.error(traceback.format_exc())
        return {
            'statusCode': 500,
            'body': f'Error executing Python code: {str(e)}',
            'error': traceback.format_exc()
        } 