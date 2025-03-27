async function getAnalysis(answer) {
    try {
        showLoading();
        const response = await fetch(`/api/analysis?answer=${encodeURIComponent(answer)}`);
        const result = await response.json();
        
        if (result.success) {
            displayAnalysis(result.data);
        } else {
            showError('获取解析失败，请稍后重试');
        }
    } catch (error) {
        console.error('获取解析失败:', error);
        showError('获取解析失败，请稍后重试');
    } finally {
        hideLoading();
    }
}

function showLoading() {
    const analysisContainer = document.getElementById('analysis-container');
    analysisContainer.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>正在生成解析...</p>
        </div>
    `;
}

function hideLoading() {
    const loadingElement = document.querySelector('.loading');
    if (loadingElement) {
        loadingElement.remove();
    }
}

function showError(message) {
    const analysisContainer = document.getElementById('analysis-container');
    analysisContainer.innerHTML = `
        <div class="error">
            <p>${message}</p>
        </div>
    `;
}

function displayAnalysis(analysis) {
    const analysisContainer = document.getElementById('analysis-container');
    analysisContainer.innerHTML = `
        <div class="analysis">
            <div class="analysis-section">
                <h3>核心观点</h3>
                <p>${analysis.core}</p>
            </div>
            <div class="analysis-section">
                <h3>表现形式</h3>
                <p>${analysis.manifestation}</p>
            </div>
            <div class="analysis-section">
                <h3>解决方案</h3>
                <p>${analysis.solution}</p>
            </div>
            <div class="analysis-section">
                <h3>温馨提示</h3>
                <p>${analysis.tips}</p>
            </div>
        </div>
    `;
} 