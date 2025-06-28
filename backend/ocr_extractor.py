import os
import json
import pytesseract
from PIL import Image
from pdf2image import convert_from_path
import openai
import re

class OCRExtractor:
    def __init__(self):
        # Init OCR extractor w OpenAI
        openai.api_key = os.getenv('OPENAI_API_KEY')
        
        # Config Tesseract path
        if os.name == 'nt':  # Windows
            pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    
    def pdf_to_images(self, pdf_path):
        # Convert PDF to images
        try:
            # Convert PDF pages to images
            images = convert_from_path(pdf_path, dpi=300) # dpi=300 for high res
            return images
        except Exception as e:
            raise Exception(f"Failed to convert PDF to images: {str(e)}")
    
    def extract_text_with_ocr(self, image):
        # Extract text with Tesseract
        try:
            # Extract text with high confidence
            text = pytesseract.image_to_string(image, config='--psm 6')
            return text.strip()
        except Exception as e:
            raise Exception(f"OCR extraction failed: {str(e)}")
    
    def create_extraction_prompt(self, form_type, ocr_text):
        # Create structured prompt for chatGPT field extraction
        if form_type.upper() == 'W-2':
            prompt = f"""
            Extract the following fields from this W-2 form text. Return ONLY a valid JSON object with the exact structure shown below.
            
            OCR Text:
            {ocr_text}
            
            Extract these fields and return as JSON:
            {{
                "employer": {{"value": "employer name", "confidence": 0.0-1.0}},
                "ein": {{"value": "employer identification number", "confidence": 0.0-1.0}},
                "employee_ssn": {{"value": "employee social security number", "confidence": 0.0-1.0}},
                "wages": {{"value": "wages, tips, other compensation", "confidence": 0.0-1.0}},
                "federal_tax_withheld": {{"value": "federal income tax withheld", "confidence": 0.0-1.0}},
                "social_security_wages": {{"value": "social security wages", "confidence": 0.0-1.0}},
                "social_security_tax_withheld": {{"value": "social security tax withheld", "confidence": 0.0-1.0}},
                "medicare_wages": {{"value": "medicare wages and tips", "confidence": 0.0-1.0}},
                "medicare_tax_withheld": {{"value": "medicare tax withheld", "confidence": 0.0-1.0}},
                "state": {{"value": "state", "confidence": 0.0-1.0}},
                "state_wages": {{"value": "state wages, tips, etc.", "confidence": 0.0-1.0}},
                "state_tax_withheld": {{"value": "state income tax withheld", "confidence": 0.0-1.0}}
            }}
            
            Rules:
            1. For missing fields, use "value": "Not found" and "confidence": 0.0
            2. For monetary values, include dollar signs and commas
            3. For SSN and EIN, format as XX-XXX-XXXX and XX-XXXXXXX respectively
            4. Confidence should reflect how certain you are about the extraction (0.0-1.0)
            5. Return ONLY the JSON object, no additional text
            """
        elif form_type.upper() == '1099':
            prompt = f"""
            Extract the following fields from this 1099 form text. Return ONLY a valid JSON object with the exact structure shown below.
            
            OCR Text:
            {ocr_text}
            
            Extract these fields and return as JSON:
            {{
                "payer_name": {{"value": "payer name", "confidence": 0.0-1.0}},
                "payer_tin": {{"value": "payer identification number", "confidence": 0.0-1.0}},
                "recipient_name": {{"value": "recipient name", "confidence": 0.0-1.0}},
                "recipient_tin": {{"value": "recipient identification number", "confidence": 0.0-1.0}},
                "nonemployee_compensation": {{"value": "nonemployee compensation", "confidence": 0.0-1.0}},
                "federal_tax_withheld": {{"value": "federal income tax withheld", "confidence": 0.0-1.0}},
                "state": {{"value": "state", "confidence": 0.0-1.0}},
                "state_income": {{"value": "state income", "confidence": 0.0-1.0}},
                "state_tax_withheld": {{"value": "state tax withheld", "confidence": 0.0-1.0}}
            }}
            
            Rules:
            1. For missing fields, use "value": "Not found" and "confidence": 0.0
            2. For monetary values, include dollar signs and commas
            3. For TIN numbers, format appropriately
            4. Confidence should reflect how certain you are about the extraction (0.0-1.0)
            5. Return ONLY the JSON object, no additional text
            """
        else:
            # Generic forms
            prompt = f"""
            Extract key information from this tax form text. Return ONLY a valid JSON object with the structure shown below.
            
            OCR Text:
            {ocr_text}
            
            Extract these common fields and return as JSON:
            {{
                "form_type": {{"value": "detected form type", "confidence": 0.0-1.0}},
                "payer_name": {{"value": "payer/employer name", "confidence": 0.0-1.0}},
                "recipient_name": {{"value": "recipient/employee name", "confidence": 0.0-1.0}},
                "identification_number": {{"value": "EIN/SSN/TIN", "confidence": 0.0-1.0}},
                "total_amount": {{"value": "total amount", "confidence": 0.0-1.0}},
                "tax_withheld": {{"value": "tax withheld", "confidence": 0.0-1.0}}
            }}
            
            Rules:
            1. For missing fields, use "value": "Not found" and "confidence": 0.0
            2. For monetary values, include dollar signs and commas
            3. Confidence should reflect how certain you are about the extraction (0.0-1.0)
            4. Return ONLY the JSON object, no additional text
            """
        
        return prompt
    
    def create_tax_advice_prompt(self, extracted_data, form_type):
        # Prompt engineering for tax advice
        data_summary = []
        for field, data in extracted_data.items():
            if isinstance(data, dict) and 'value' in data:
                value = data['value']
                if value and value != "Not found":
                    data_summary.append(f"{field.replace('_', ' ').title()}: {value}")
        
        data_text = "\n".join(data_summary)
        
        if form_type.upper() == 'W-2':
            prompt = f"""
            You are a professional tax advisor. Based on the following W-2 form data, provide personalized tax advice.
            
            W-2 Data:
            {data_text}
            
            Please provide tax advice in the following JSON format:
            {{
                "summary": "Brief overview of the tax situation",
                "key_insights": [
                    "Important observation 1",
                    "Important observation 2",
                    "Important observation 3"
                ],
                "recommendations": [
                    "Specific recommendation 1",
                    "Specific recommendation 2",
                    "Specific recommendation 3"
                ],
                "potential_deductions": [
                    "Potential deduction 1",
                    "Potential deduction 2"
                ],
                "next_steps": [
                    "Action item 1",
                    "Action item 2",
                    "Action item 3"
                ],
                "estimated_tax_impact": "Brief description of potential tax savings or obligations",
                "disclaimer": "This is general advice. Consult a qualified tax professional for specific guidance."
            }}
            
            Focus on:
            1. Tax optimization opportunities
            2. Potential deductions and credits
            3. Filing status considerations
            4. State tax implications
            5. Important deadlines and next steps
            
            Return ONLY the JSON object, no additional text.
            """
        elif form_type.upper() == '1099':
            prompt = f"""
            You are a professional tax advisor. Based on the following 1099 form data, provide personalized tax advice.
            
            1099 Data:
            {data_text}
            
            Please provide tax advice in the following JSON format:
            {{
                "summary": "Brief overview of the tax situation",
                "key_insights": [
                    "Important observation 1",
                    "Important observation 2",
                    "Important observation 3"
                ],
                "recommendations": [
                    "Specific recommendation 1",
                    "Specific recommendation 2",
                    "Specific recommendation 3"
                ],
                "business_expenses": [
                    "Potential business expense 1",
                    "Potential business expense 2"
                ],
                "quarterly_estimates": "Advice on quarterly tax payments",
                "next_steps": [
                    "Action item 1",
                    "Action item 2",
                    "Action item 3"
                ],
                "estimated_tax_impact": "Brief description of potential tax savings or obligations",
                "disclaimer": "This is general advice. Consult a qualified tax professional for specific guidance."
            }}
            
            Focus on:
            1. Self-employment tax implications
            2. Business expense deductions
            3. Quarterly estimated tax payments
            4. Retirement plan contributions
            5. Health insurance deductions
            
            Return ONLY the JSON object, no additional text.
            """
        else:
            prompt = f"""
            You are a professional tax advisor. Based on the following tax form data, provide personalized tax advice.
            
            Form Data:
            {data_text}
            
            Please provide tax advice in the following JSON format:
            {{
                "summary": "Brief overview of the tax situation",
                "key_insights": [
                    "Important observation 1",
                    "Important observation 2"
                ],
                "recommendations": [
                    "Specific recommendation 1",
                    "Specific recommendation 2"
                ],
                "next_steps": [
                    "Action item 1",
                    "Action item 2"
                ],
                "estimated_tax_impact": "Brief description of potential tax savings or obligations",
                "disclaimer": "This is general advice. Consult a qualified tax professional for specific guidance."
            }}
            
            Return ONLY the JSON object, no additional text.
            """
        
        return prompt
    
    def extract_with_llm(self, text, form_type):
        # Extract structured data using OpenAI GPT
        try:
            prompt = self.create_extraction_prompt(form_type, text)
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",  # Most cost-effective model cuz I have no money ;(
                messages=[
                    {"role": "system", "content": "You are a tax form data extraction expert. Extract structured data from OCR text and return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,  # Low temperature for consistent output
                max_tokens=1000
            )
            
            # Extract JSON and clean
            content = response.choices[0].message.content.strip()
            json_match = re.search(r'\{.*\}', content, re.DOTALL) # Regex
            if json_match:
                json_str = json_match.group()
                return json.loads(json_str)
            else:
                raise Exception("No valid JSON found in LLM response")
                
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse LLM response as JSON: {str(e)}")
        except Exception as e:
            raise Exception(f"LLM extraction failed: {str(e)}")
    
    def get_tax_advice(self, extracted_data, form_type):
        # Create tax advice w API
        try:
            prompt = self.create_tax_advice_prompt(extracted_data, form_type)
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a professional tax advisor with expertise in personal and business taxation. Provide clear, actionable tax advice based on the provided data."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # Slightly higher for more creative advice
                max_tokens=1500
            )
            
            # Extract JSON
            content = response.choices[0].message.content.strip()
            
            # Clean up and JSON
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                return json.loads(json_str)
            else:
                raise Exception("No valid JSON found in LLM response")
                
        except json.JSONDecodeError as e:
            raise Exception(f"Failed to parse tax advice response as JSON: {str(e)}")
        except Exception as e:
            raise Exception(f"Tax advice generation failed: {str(e)}")
    
    def calculate_confidence_score(self, value, original_text):
        """Calculate confidence score based on value presence and format"""
        if not value or value == "Not found":
            return 0.0
        
        # Basic confidence scoring
        confidence = 0.5  # Base confidence
        
        # Check if value appears in original text
        if value.lower() in original_text.lower():
            confidence += 0.3
        
        # Check for proper formatting
        if self._is_properly_formatted(value):
            confidence += 0.2
        
        return min(confidence, 1.0)
    
    def _is_properly_formatted(self, value):
        """Check if value has proper formatting"""
        # Check for monetary values
        if '$' in value and any(char.isdigit() for char in value):
            return True
        
        # Check for SSN format (XXX-XX-XXXX)
        if re.match(r'\d{3}-\d{2}-\d{4}', value):
            return True
        
        # Check for EIN format (XX-XXXXXXX)
        if re.match(r'\d{2}-\d{7}', value):
            return True
        
        # Check for basic text (not empty)
        if value and len(value.strip()) > 0:
            return True
        
        return False
    
    def extract_fields(self, pdf_path, form_type='W-2'):
        # Main extraction method from PDF
        try:
            # Convert PDF to images
            images = self.pdf_to_images(pdf_path)
            
            # Extract text from all pages
            all_text = ""
            for i, image in enumerate(images):
                page_text = self.extract_text_with_ocr(image)
                all_text += f"\n--- Page {i+1} ---\n{page_text}\n"
            
            # Extract structured data using LLM
            extracted_data = self.extract_with_llm(all_text, form_type)
            
            # Recalculate confidence scores based on OCR text
            for field, data in extracted_data.items():
                if isinstance(data, dict) and 'value' in data:
                    data['confidence'] = self.calculate_confidence_score(data['value'], all_text)
            
            return extracted_data
            
        except Exception as e:
            raise Exception(f"Field extraction failed: {str(e)}") 
