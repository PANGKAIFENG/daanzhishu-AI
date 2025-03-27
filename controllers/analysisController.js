const analysisGenerator = require('../services/analysisGenerator');
const { analysisDatabase } = require('../dataPackage/analysisData');

class AnalysisController {
    async getAnalysis(req, res) {
        try {
            const { answer } = req.query;
            
            if (!answer) {
                return res.status(400).json({
                    success: false,
                    message: '请提供答案内容'
                });
            }

            // 首先尝试从缓存中获取解析
            const cachedAnalysis = analysisDatabase[answer];
            if (cachedAnalysis) {
                return res.json({
                    success: true,
                    data: cachedAnalysis,
                    source: 'cache'
                });
            }

            // 如果缓存中没有，则实时生成
            const generatedAnalysis = await analysisGenerator.generateAnalysis(answer);
            
            // 将生成的解析存入缓存
            analysisDatabase[answer] = generatedAnalysis;

            return res.json({
                success: true,
                data: generatedAnalysis,
                source: 'generated'
            });

        } catch (error) {
            console.error('获取解析失败:', error);
            return res.status(500).json({
                success: false,
                message: '获取解析失败，请稍后重试'
            });
        }
    }
}

module.exports = new AnalysisController(); 