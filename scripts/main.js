/**
 * main.js - 主脚本文件
 * 负责初始化网站功能和页面交互
 */

// 等待DOM完全加载后执行
document.addEventListener('DOMContentLoaded', () => {
    console.log('AI Object Remover application initialized');

    // 初始化所有页面组件
    initComponents();

    // 设置事件监听器
    setupEventListeners();
});

/**
 * 初始化所有页面组件
 */
function initComponents() {
    // 初始化Toast消息组件
    initToastSystem();
}

/**
 * 设置所有事件监听器
 */
function setupEventListeners() {
    // 为"编辑再次"按钮添加事件监听器
    const editAgainButton = document.getElementById('edit-again-button');
    if (editAgainButton) {
        editAgainButton.addEventListener('click', () => {
            document.getElementById('result-section').classList.add('hidden');
            document.getElementById('editor-section').classList.remove('hidden');
        });
    }

    // 为重置按钮添加事件监听器
    const resetButton = document.getElementById('reset-button');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            // 重置画布由canvas.js处理
            if (typeof resetCanvas === 'function') {
                resetCanvas();
                showToast('画布已重置', 'success');
            }
        });
    }
}

/**
 * 初始化提示消息系统
 */
function initToastSystem() {
    // 创建Toast元素
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.position = 'fixed';
    toastContainer.style.bottom = '20px';
    toastContainer.style.right = '20px';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
}

/**
 * 显示提示消息
 * @param {string} message - 提示消息内容
 * @param {string} type - 提示类型 ('success', 'error', 'info')
 * @param {number} duration - 显示时长(毫秒)
 */
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toast-container');
    
    if (!toastContainer) return;
    
    // 创建新的Toast元素
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // 设置Toast内容
    toast.innerHTML = `
        <div class="toast-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                ${type === 'success' 
                    ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' 
                    : type === 'error' 
                        ? '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'
                        : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>'}
            </svg>
        </div>
        <div class="toast-content">${message}</div>
        <button class="toast-close">&times;</button>
    `;
    
    // 将Toast添加到容器
    toastContainer.appendChild(toast);
    
    // 添加关闭功能
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 300);
        });
    }
    
    // 显示Toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // 设置自动关闭
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

/**
 * 显示加载动画
 * @param {boolean} show - 是否显示加载动画
 * @param {string} message - 加载提示消息
 */
function showLoading(show, message = '处理您的图像...') {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingMessage = loadingOverlay.querySelector('p');
    
    if (loadingMessage) {
        loadingMessage.textContent = message;
    }
    
    if (show) {
        loadingOverlay.classList.remove('hidden');
    } else {
        loadingOverlay.classList.add('hidden');
    }
}

// 将公共函数暴露给其他模块
window.showToast = showToast;
window.showLoading = showLoading; 