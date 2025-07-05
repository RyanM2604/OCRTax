const OpenAI = require('openai');
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');

// Validate OpenAI API key
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  Missing OPENAI_API_KEY environment variable');
  console.warn('AI functionality will not work without this variable.');
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIService {
  constructor() {
    this.openai = openai;
  }

  // Extract text from PDF using OCR
  async extractTextFromPDF(pdfBuffer) {
    try {
      // First try to extract text directly from PDF
      const pdfData = await pdfParse(pdfBuffer);
      let extractedText = pdfData.text;

      // If no text found, use OCR
      if (!extractedText || extractedText.trim().length < 50) {
        console.log('No text found in PDF, using OCR...');
        const result = await Tesseract.recognize(pdfBuffer, 'eng', {
          logger: m => console.log(m)
        });
        extractedText = result.data.text;
      }

      return extractedText;
    } catch (error) {
      console.error('Text extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  // Analyze tax document with AI
  async analyzeTaxDocument(extractedText, documentType = 'W-2', customPrompt = null) {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const defaultPrompt = this.getDefaultPrompt(documentType);
      const prompt = customPrompt || defaultPrompt;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a tax document analysis expert. Extract structured data from tax forms with high accuracy and provide confidence scores for each field.'
          },
          {
            role: 'user',
            content: `${prompt}\n\nDocument text:\n${extractedText}`
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
      });

      const response = completion.choices[0].message.content;
      
      // Parse the AI response to extract structured data
      const extractedData = this.parseAIResponse(response);
      
      return {
        extractedData,
        aiFeedback: response,
        processingTime: Date.now(),
      };
    } catch (error) {
      console.error('AI analysis error:', error);
      if (error.message.includes('API key')) {
        throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
      }
      throw new Error('Failed to analyze tax document with AI');
    }
  }

  // Get default prompt based on document type
  getDefaultPrompt(documentType) {
    const prompts = {
      'W-2': `Extract the following information from this W-2 form:
- Employer name and EIN
- Employee name and SSN
- Wages, tips, and other compensation
- Federal income tax withheld
- Social security wages and tax withheld
- Medicare wages and tax withheld
- State and local information if present

Return the data in JSON format with confidence scores (0-1) for each field.`,
      
      '1099': `Extract the following information from this 1099 form:
- Payer name and TIN
- Recipient name and TIN
- Non-employee compensation
- Federal income tax withheld
- State information if present

Return the data in JSON format with confidence scores (0-1) for each field.`,
      
      '1040': `Extract the following information from this 1040 form:
- Taxpayer name and SSN
- Filing status
- Dependents
- Income sources and amounts
- Deductions and credits
- Tax liability

Return the data in JSON format with confidence scores (0-1) for each field.`,
      
      'Other': `Extract all relevant tax information from this document. Look for:
- Names and identification numbers
- Financial amounts
- Dates
- Tax-related fields

Return the data in JSON format with confidence scores (0-1) for each field.`
    };

    return prompts[documentType] || prompts['Other'];
  }

  // Parse AI response to extract structured data
  parseAIResponse(response) {
    try {
      // Try to find JSON in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.formatExtractedData(parsed);
      }

      // If no JSON found, create a structured format
      return this.createStructuredData(response);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.createStructuredData(response);
    }
  }

  // Format extracted data for consistent structure
  formatExtractedData(data) {
    const formatted = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && value !== null) {
        formatted[key] = {
          value: value.value || value.toString(),
          confidence: value.confidence || 0.5,
          field: key,
        };
      } else {
        formatted[key] = {
          value: value.toString(),
          confidence: 0.5,
          field: key,
        };
      }
    }

    return formatted;
  }

  // Create structured data from text response
  createStructuredData(text) {
    const lines = text.split('\n');
    const data = {};
    
    lines.forEach((line, index) => {
      if (line.trim()) {
        data[`field_${index}`] = {
          value: line.trim(),
          confidence: 0.3,
          field: `field_${index}`,
        };
      }
    });

    return data;
  }

  // Generate AI feedback for resume data
  async generateResumeFeedback(resumeData, customPrompt = null) {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const defaultPrompt = `Analyze this resume data and provide constructive feedback on:
- Overall structure and formatting
- Content quality and relevance
- Areas for improvement
- Strengths and weaknesses
- Suggestions for enhancement

Be specific and actionable in your feedback.`;

      const prompt = customPrompt || defaultPrompt;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional resume reviewer with expertise in career development and job applications.'
          },
          {
            role: 'user',
            content: `${prompt}\n\nResume data:\n${JSON.stringify(resumeData, null, 2)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Resume feedback generation error:', error);
      throw new Error('Failed to generate resume feedback');
    }
  }

  // Generate tax advice based on extracted form data
  async generateTaxAdvice(formData, customPrompt = null) {
    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const defaultPrompt = `Based on the provided tax form data, provide comprehensive tax advice in the following JSON format:

{
  "summary": "Brief overview of the tax situation",
  "key_insights": ["Insight 1", "Insight 2", "Insight 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "potential_deductions": ["Deduction 1", "Deduction 2"],
  "business_expenses": ["Expense 1", "Expense 2"],
  "quarterly_estimates": ["Estimate 1", "Estimate 2"],
  "next_steps": ["Step 1", "Step 2", "Step 3"],
  "estimated_tax_impact": "Estimated impact on tax liability",
  "disclaimer": "This advice is for informational purposes only. Consult a qualified tax professional for specific advice."
}

Focus on actionable advice and potential tax savings.`;

      const prompt = customPrompt || defaultPrompt;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a certified tax advisor with expertise in tax planning, deductions, and compliance. Provide accurate, helpful tax advice based on the provided form data.'
          },
          {
            role: 'user',
            content: `${prompt}\n\nForm data:\n${JSON.stringify(formData, null, 2)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const response = completion.choices[0].message.content;
      
      // Try to parse JSON response
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing tax advice JSON:', parseError);
      }

      // Fallback to structured text response
      return {
        summary: response,
        key_insights: ["Review your withholding", "Consider tax deductions", "Plan for next year"],
        recommendations: ["Consult a tax professional", "Keep good records", "File on time"],
        next_steps: ["Gather all documents", "Review deductions", "File your return"],
        disclaimer: "This advice is for informational purposes only. Consult a qualified tax professional for specific advice."
      };
    } catch (error) {
      console.error('Tax advice generation error:', error);
      throw new Error('Failed to generate tax advice');
    }
  }
}

module.exports = new AIService(); 