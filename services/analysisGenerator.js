const axios = require('axios');

class AnalysisGenerator {
    constructor() {
        this.apiEndpoint = 'https://api.siliconflow.cn/v1/chat/completions';
        this.apiKey = 'sk-lubcdujqsnesolhxkkyyvoqdegnymgbmqrobrkkfehmwvtuy';
        this.timeout = 5000; // 5秒超时
    }

    async generateAnalysis(answer) {
        try {
            const response = await axios.post(
                this.apiEndpoint,
                {
                    model: "Qwen/Qwen2.5-7B-Instruct", // 使用通义千问2.5-7B模型
                    messages: [
                        {
                            role: "system",
                            content: "你是一个专业的答案解析助手，擅长用轻松诙谐的方式解析各种建议和观点。请按照以下格式生成解析：\n\n1. 核心观点：简要说明这个建议的主要思想\n2. 表现形式：列举可能遇到的具体情况\n3. 解决方案：提供具体的行动步骤\n4. 温馨提示：给出实践建议"
                        },
                        {
                            role: "user",
                            content: `请为以下答案生成一个解析：\n\n${answer}\n\n请用轻松诙谐的语气，避免给人压力，保持积极向上的态度。`
                        }
                    ],
                    temperature: 0.7,
                    top_p: 0.7,
                    top_k: 50,
                    frequency_penalty: 0.5,
                    max_tokens: 512,
                    stream: false,
                    n: 1,
                    response_format: {
                        type: "text"
                    }
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

    parseResponse(aiResponse) {
        try {
            const content = aiResponse.choices[0].message.content.trim();
            const sections = content.split('\n\n');
            
            return {
                core: sections[0]?.replace('核心观点：', '').trim() || '解析生成失败',
                manifestation: sections[1]?.replace('表现形式：', '').trim() || '解析生成失败',
                solution: sections[2]?.replace('解决方案：', '').trim() || '解析生成失败',
                tips: sections[3]?.replace('温馨提示：', '').trim() || '解析生成失败'
            };
        } catch (error) {
            console.error('解析响应失败:', error);
            return this.getFallbackAnalysis();
        }
    }

    getFallbackAnalysis(answer) {
        // 当 AI 生成失败时返回的备用解析
        return {
            core: "这是一个有趣的建议，让我们来深入思考一下",
            manifestation: "在生活中我们经常会遇到类似的情况",
            solution: "尝试用新的角度去看待这个问题",
            tips: "保持开放和积极的心态很重要"
        };
    }
}

module.exports = new AnalysisGenerator(); 