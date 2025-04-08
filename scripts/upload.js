/**
 * upload.js - 文件上传和处理
 * 处理图片文件的上传、验证和显示
 */

// 等待DOM完全加载后执行
document.addEventListener('DOMContentLoaded', () => {
    // 初始化拖放区域
    initializeDropArea();
});

/**
 * 初始化拖放上传区域
 */
function initializeDropArea() {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const browseButton = document.getElementById('browse-button');
    
    if (!dropArea || !fileInput || !browseButton) return;
    
    // 点击浏览按钮触发文件选择
    browseButton.addEventListener('click', () => {
        fileInput.click();
    });
    
    // 文件选择事件
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    // 拖动相关事件
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    // 拖动样式事件
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.add('drag-over');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.remove('drag-over');
        }, false);
    });
    
    // 放下文件处理
    dropArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }, false);
}

/**
 * 阻止默认事件
 * @param {Event} e - 事件对象
 */
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

/**
 * 处理上传的文件
 * @param {FileList} files - 上传的文件列表
 */
function handleFiles(files) {
    if (!files.length) return;
    
    // 我们只处理第一个文件（假设用户只上传一张图片）
    const file = files[0];
    
    // 验证文件类型
    if (!validateFile(file)) {
        showToast('请上传有效的图片文件（JPG, PNG, GIF, WEBP）', 'error');
        return;
    }
    
    // 显示加载中状态
    showToast('图片上传成功，准备编辑', 'success');
    
    // 加载图片
    loadImage(file);
}

/**
 * 验证文件是否为有效的图片格式
 * @param {File} file - 待验证的文件
 * @returns {boolean} - 是否为有效图片文件
 */
function validateFile(file) {
    // 检查文件类型是否为图片
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        return false;
    }
    
    // 检查文件大小（限制为20MB）
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
        showToast('图片大小不能超过20MB', 'error');
        return false;
    }
    
    return true;
}

/**
 * 加载图片到Canvas
 * @param {File} file - 图片文件
 */
function loadImage(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const img = new Image();
        
        img.onload = function() {
            // 隐藏上传区域
            document.getElementById('upload-section').classList.add('hidden');
            
            // 显示编辑区域
            document.getElementById('editor-section').classList.remove('hidden');
            
            // 设置图像到Canvas（假设canvas.js中定义了这个函数）
            if (typeof setCanvasImage === 'function') {
                setCanvasImage(this);
            }
        };
        
        img.onerror = function() {
            showToast('图片加载失败，请尝试另一张图片', 'error');
        };
        
        // 设置图片源
        img.src = e.target.result;
    };
    
    reader.onerror = function() {
        showToast('文件读取失败', 'error');
    };
    
    // 开始读取文件
    reader.readAsDataURL(file);
}

// 暴露必要的函数供其他模块使用
window.handleFiles = handleFiles; 