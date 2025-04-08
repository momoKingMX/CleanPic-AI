/**
 * iframe-handler.js - 处理Cleanup.pictures iframe的加载和错误
 */

// 等待DOM完全加载后执行
document.addEventListener('DOMContentLoaded', () => {
    console.log('AI Object Remover application initialized');
    
    // 初始化iframe处理
    initIframeHandler();
});

/**
 * 初始化iframe处理
 */
function initIframeHandler() {
    const iframe = document.getElementById('cleanup-iframe');
    const loadingElement = document.getElementById('iframe-loading');
    const errorElement = document.getElementById('iframe-error');
    
    if (!iframe || !loadingElement || !errorElement) return;
    
    // 监听iframe加载完成事件
    iframe.addEventListener('load', () => {
        console.log('Iframe loaded successfully');
        // 隐藏加载指示器
        loadingElement.style.display = 'none';
        // 确保显示iframe
        iframe.style.opacity = 1;
    });
    
    // 设置加载超时检测
    const timeoutDuration = 10000; // 10秒
    const timeoutId = setTimeout(() => {
        // 如果超时，检查iframe是否真的加载了内容
        try {
            // 尝试访问iframe的内容，如果跨域会抛出错误
            // 如果没有内容也可能会失败
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (!iframeDoc || !iframeDoc.body.innerHTML) {
                showIframeError();
            }
        } catch (e) {
            // 如果有跨域错误但iframe可能已成功加载，我们不能确定
            // 这种情况下，我们只隐藏加载指示器，假设iframe正常
            loadingElement.style.display = 'none';
        }
    }, timeoutDuration);
    
    // iframe成功加载时清除超时
    iframe.addEventListener('load', () => {
        clearTimeout(timeoutId);
    });
    
    // 设置重载按钮
    const reloadButton = document.getElementById('reload-iframe');
    if (reloadButton) {
        reloadButton.addEventListener('click', () => {
            reloadIframe();
        });
    }
}

/**
 * 显示iframe错误界面
 */
function showIframeError() {
    const iframe = document.getElementById('cleanup-iframe');
    const errorElement = document.getElementById('iframe-error');
    
    if (!iframe || !errorElement) return;
    
    // 隐藏iframe并显示错误消息
    iframe.style.opacity = 0;
    errorElement.classList.remove('hidden');
}

/**
 * 重新加载iframe
 */
function reloadIframe() {
    const iframe = document.getElementById('cleanup-iframe');
    const errorElement = document.getElementById('iframe-error');
    const loadingElement = document.getElementById('iframe-loading');
    
    if (!iframe || !errorElement || !loadingElement) return;
    
    // 隐藏错误界面
    errorElement.classList.add('hidden');
    // 显示加载界面
    loadingElement.style.display = 'block';
    
    // 重新加载iframe
    const currentSrc = iframe.src;
    iframe.src = 'about:blank'; // 先清空
    
    setTimeout(() => {
        iframe.src = currentSrc; // 重新设置来源
        iframe.style.opacity = 1;
    }, 100);
}

/**
 * 检测iframe是否被阻止加载
 * 这个函数可能不总是有效，因为浏览器处理iframe的方式各不相同
 */
function checkIframeBlocked() {
    const iframe = document.getElementById('cleanup-iframe');
    
    if (!iframe) return true;
    
    try {
        // 尝试访问iframe的contentWindow属性
        const iframeWindow = iframe.contentWindow;
        return !iframeWindow;
    } catch (e) {
        return true; // 如果出现错误，假设被阻止
    }
} 