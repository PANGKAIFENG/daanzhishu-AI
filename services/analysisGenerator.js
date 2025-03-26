const axios = require('axios');

class AnalysisGenerator {
    constructor() {
        this.apiEndpoint = process.env.AI_API_ENDPOINT;
        this.apiKey = process.env.AI_API_KEY;
        this.timeout = 5000; // 5秒超时
    }

    async generateAnalysis(answer) {
        try {
            const prompt = this.generatePrompt(answer);
            const response = await axios.post(
                this.apiEndpoint,
                {
                    prompt: prompt,
                    max_tokens: 500,
                    temperature: 0.7,
                    top_p: 0.9,
                    frequency_penalty: 0.5,
                    presence_penalty: 0.5
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: this.timeout
                }
            );

            return this.parseResponse(response.data);
        } catch (error) {
            console.error('生成解析失败:', error);
            return this.getFallbackAnalysis(answer);
        }
    }

    generatePrompt(answer) {
        return `请为以下答案生成一个解析，包含四个部分：
1. 核心观点 (core)：简要说明这个建议的主要思想
2. 表现形式 (manifestation)：列举可能遇到的具体问题或症状
3. 解决方案 (solution)：提供具体的行动步骤
4. 温馨提示 (tips)：给出实践建议

答案内容：${answer}

要求：
- 保持轻松诙谐的语气
- 避免给人压力
- 内容要积极向上
- 建议要具体可行
- 语言要简洁明了

请按照以下JSON格式返回：
{
    "core": "核心观点",
    "manifestation": "表现形式",
    "solution": "解决方案",
    "tips": "温馨提示"
}`;
    }

    parseResponse(response) {
        try {
            const content = response.choices[0].message.content;
            return JSON.parse(content);
        } catch (error) {
            console.error('解析AI响应失败:', error);
            return this.getFallbackAnalysis();
        }
    }

    getFallbackAnalysis(answer) {
        // 返回一个基础的解析模板
        return {
            core: "这是一个关于" + answer.substring(0, 20) + "的建议",
            manifestation: "可能遇到的问题和挑战",
            solution: "建议采取的具体行动步骤",
            tips: "实践过程中的注意事项"
        };
    }
}

module.exports = new AnalysisGenerator(); 