/**
 * canvas.js - Canvas画布处理
 * 提供画布操作相关功能：画笔、橡皮擦和图像处理
 */

// 全局变量
let imageCanvas, drawingCanvas; // 画布元素
let imageCtx, drawingCtx;       // 画布上下文
let isDrawing = false;          // 是否正在绘制
let lastX = 0, lastY = 0;       // 上一个绘制点的坐标
let currentTool = 'brush';      // 当前工具：'brush' 或 'eraser'
let brushSize = 10;             // 画笔/橡皮擦大小
let originalImage = null;       // 原始图像对象
let canvasScale = 1;            // 画布缩放比例
let canvasOffsetX = 0, canvasOffsetY = 0; // 画布偏移量

// 等待DOM完全加载后执行
document.addEventListener('DOMContentLoaded', () => {
    // 初始化画布
    initializeCanvas();
    
    // 设置工具切换事件监听器
    setupToolListeners();
    
    // 设置笔刷大小控制事件监听器
    setupBrushSizeControl();
    
    // 设置处理按钮事件监听器
    setupProcessButton();
});

/**
 * 初始化Canvas画布
 */
function initializeCanvas() {
    // 获取画布元素
    imageCanvas = document.getElementById('image-canvas');
    drawingCanvas = document.getElementById('drawing-canvas');
    
    if (!imageCanvas || !drawingCanvas) return;
    
    // 获取画布上下文
    imageCtx = imageCanvas.getContext('2d');
    drawingCtx = drawingCanvas.getContext('2d');
    
    // 设置绘图事件监听器
    drawingCanvas.addEventListener('mousedown', startDrawing);
    drawingCanvas.addEventListener('mousemove', draw);
    drawingCanvas.addEventListener('mouseup', stopDrawing);
    drawingCanvas.addEventListener('mouseout', stopDrawing);
    
    // 触摸设备支持
    drawingCanvas.addEventListener('touchstart', handleTouchStart);
    drawingCanvas.addEventListener('touchmove', handleTouchMove);
    drawingCanvas.addEventListener('touchend', handleTouchEnd);
}

/**
 * 设置工具切换事件监听器
 */
function setupToolListeners() {
    const brushTool = document.getElementById('brush-tool');
    const eraserTool = document.getElementById('eraser-tool');
    
    if (!brushTool || !eraserTool) return;
    
    // 设置画笔工具事件
    brushTool.addEventListener('click', () => {
        currentTool = 'brush';
        brushTool.classList.add('active');
        eraserTool.classList.remove('active');
    });
    
    // 设置橡皮擦工具事件
    eraserTool.addEventListener('click', () => {
        currentTool = 'eraser';
        eraserTool.classList.add('active');
        brushTool.classList.remove('active');
    });
}

/**
 * 设置笔刷大小控制事件监听器
 */
function setupBrushSizeControl() {
    const brushSizeControl = document.getElementById('brush-size');
    const sizeDisplay = document.getElementById('size-display');
    
    if (!brushSizeControl || !sizeDisplay) return;
    
    // 更新初始显示
    sizeDisplay.textContent = `${brushSizeControl.value}px`;
    
    // 设置滑块变化事件
    brushSizeControl.addEventListener('input', () => {
        brushSize = brushSizeControl.value;
        sizeDisplay.textContent = `${brushSize}px`;
    });
}

/**
 * 设置处理按钮事件监听器
 */
function setupProcessButton() {
    const processButton = document.getElementById('process-button');
    
    if (!processButton) return;
    
    processButton.addEventListener('click', () => {
        // 检查是否有有效的标记
        if (!hasValidMarking()) {
            showToast('请先标记需要移除的对象', 'error');
            return;
        }
        
        // 开始处理图像
        processImage();
    });
}

/**
 * 检查画布上是否有有效的标记
 * @returns {boolean} - 是否有有效标记
 */
function hasValidMarking() {
    // 获取画布数据
    const imageData = drawingCtx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
    const data = imageData.data;
    
    // 检查是否有红色像素（我们用红色表示标记）
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] > 0) {
            return true; // 发现了标记
        }
    }
    
    return false; // 没有找到标记
}

/**
 * 设置Canvas图像
 * @param {Image} img - 要显示的图像
 */
function setCanvasImage(img) {
    originalImage = img;
    
    // 调整画布大小以适应图像
    resizeCanvasToFitImage(img);
    
    // 在imageCanvas上绘制图像
    imageCtx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    imageCtx.drawImage(img, canvasOffsetX, canvasOffsetY, img.width * canvasScale, img.height * canvasScale);
    
    // 清除绘图画布
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
}

/**
 * 调整画布大小以适应图像
 * @param {Image} img - 图像对象
 */
function resizeCanvasToFitImage(img) {
    const containerWidth = drawingCanvas.parentElement.clientWidth;
    const containerHeight = drawingCanvas.parentElement.clientHeight;
    
    // 设置画布大小为容器大小
    imageCanvas.width = containerWidth;
    imageCanvas.height = containerHeight;
    drawingCanvas.width = containerWidth;
    drawingCanvas.height = containerHeight;
    
    // 计算图像缩放比例，使其适合画布
    const scaleX = containerWidth / img.width;
    const scaleY = containerHeight / img.height;
    canvasScale = Math.min(scaleX, scaleY, 1); // 限制最大尺寸为原始尺寸
    
    // 计算偏移量，使图像居中
    canvasOffsetX = (containerWidth - img.width * canvasScale) / 2;
    canvasOffsetY = (containerHeight - img.height * canvasScale) / 2;
}

/**
 * 开始绘制
 * @param {Event} e - 鼠标事件对象
 */
function startDrawing(e) {
    isDrawing = true;
    
    // 获取鼠标相对于画布的坐标
    const rect = drawingCanvas.getBoundingClientRect();
    [lastX, lastY] = [
        e.clientX - rect.left,
        e.clientY - rect.top
    ];
}

/**
 * 绘制
 * @param {Event} e - 鼠标事件对象
 */
function draw(e) {
    if (!isDrawing) return;
    
    // 获取鼠标当前位置
    const rect = drawingCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 设置画笔样式
    drawingCtx.lineJoin = 'round';
    drawingCtx.lineCap = 'round';
    drawingCtx.lineWidth = brushSize;
    
    if (currentTool === 'brush') {
        // 画笔模式：绘制红色半透明线条
        drawingCtx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        drawingCtx.globalCompositeOperation = 'source-over';
    } else {
        // 橡皮擦模式：清除已绘制的内容
        drawingCtx.strokeStyle = 'rgba(0, 0, 0, 1)';
        drawingCtx.globalCompositeOperation = 'destination-out';
    }
    
    // 绘制线条
    drawingCtx.beginPath();
    drawingCtx.moveTo(lastX, lastY);
    drawingCtx.lineTo(x, y);
    drawingCtx.stroke();
    
    // 更新上一个点的位置
    [lastX, lastY] = [x, y];
}

/**
 * 停止绘制
 */
function stopDrawing() {
    isDrawing = false;
}

/**
 * 处理触摸开始事件
 * @param {TouchEvent} e - 触摸事件对象
 */
function handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        startDrawing(mouseEvent);
    }
}

/**
 * 处理触摸移动事件
 * @param {TouchEvent} e - 触摸事件对象
 */
function handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        draw(mouseEvent);
    }
}

/**
 * 处理触摸结束事件
 * @param {TouchEvent} e - 触摸事件对象
 */
function handleTouchEnd(e) {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup');
    stopDrawing(mouseEvent);
}

/**
 * 重置画布
 */
function resetCanvas() {
    if (originalImage) {
        // 清除绘图画布
        drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    }
}

/**
 * 处理图像
 * 这里我们模拟AI处理过程，实际中应该调用后端API
 */
function processImage() {
    if (!originalImage) {
        showToast('没有图像可处理', 'error');
        return;
    }
    
    // 显示加载动画
    showLoading(true, 'AI正在处理图像，移除标记的对象...');
    
    // 创建一个新的画布来合并图像和标记
    const processingCanvas = document.createElement('canvas');
    processingCanvas.width = drawingCanvas.width;
    processingCanvas.height = drawingCanvas.height;
    const ctx = processingCanvas.getContext('2d');
    
    // 绘制原始图像
    ctx.drawImage(imageCanvas, 0, 0);
    
    // 绘制标记层（在实际应用中，这个标记会被发送到服务器进行处理）
    ctx.drawImage(drawingCanvas, 0, 0);
    
    // 模拟API调用，延迟2秒
    setTimeout(() => {
        // 在实际应用中，这里应该调用AI后端API
        simulateAIProcessing(processingCanvas)
            .then(resultImage => {
                // 隐藏加载动画
                showLoading(false);
                
                // 显示处理结果
                displayProcessedResult(resultImage);
            })
            .catch(error => {
                showLoading(false);
                showToast('处理失败: ' + error.message, 'error');
            });
    }, 2000);
}

/**
 * 模拟AI处理图像
 * 实际应用中应替换为真正的AI处理调用
 * @param {HTMLCanvasElement} canvas - 包含原始图像和标记的画布
 * @returns {Promise<HTMLImageElement>} - 处理后的图像
 */
function simulateAIProcessing(canvas) {
    return new Promise((resolve) => {
        // 获取画布上下文
        const ctx = canvas.getContext('2d');
        
        // 获取画布图像数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // 创建一个掩码数组来标记所有需要处理的像素
        const mask = new Uint8Array(canvas.width * canvas.height);
        
        // 第1步：标记所有红色区域（包括半透明的）
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const i = (y * canvas.width + x) * 4;
                
                // 改进的红色检测 - 检测任何有显著红色成分的像素
                // r > g*2 && r > b*2 可以检测到红色占主导的像素
                if (data[i] > 30 && data[i] > data[i+1]*1.5 && data[i] > data[i+2]*1.5) {
                    mask[y * canvas.width + x] = 1; // 标记为需要处理
                }
            }
        }
        
        // 第2步：扩展标记区域，确保边缘也被处理
        const expandedMask = new Uint8Array(canvas.width * canvas.height);
        const expansionRadius = 2; // 扩展半径
        
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                if (mask[y * canvas.width + x] === 1) {
                    // 标记当前像素及其周围区域
                    for (let dy = -expansionRadius; dy <= expansionRadius; dy++) {
                        for (let dx = -expansionRadius; dx <= expansionRadius; dx++) {
                            const nx = x + dx;
                            const ny = y + dy;
                            
                            if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                                expandedMask[ny * canvas.width + nx] = 1;
                            }
                        }
                    }
                }
            }
        }
        
        // 第3步：使用改进的填充算法处理标记区域
        // 采用更大的采样半径和加权平均
        const sampleRadius = 15; // 更大的采样半径，获取更多上下文
        
        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                if (expandedMask[y * canvas.width + x] === 1) {
                    const i = (y * canvas.width + x) * 4;
                    
                    // 使用径向采样和距离加权
                    let totalR = 0, totalG = 0, totalB = 0, totalWeight = 0;
                    
                    for (let dy = -sampleRadius; dy <= sampleRadius; dy++) {
                        for (let dx = -sampleRadius; dx <= sampleRadius; dx++) {
                            const nx = x + dx;
                            const ny = y + dy;
                            
                            // 确保采样点在画布内且不是标记区域
                            if (nx >= 0 && nx < canvas.width && ny >= 0 && ny < canvas.height) {
                                const ni = (ny * canvas.width + nx) * 4;
                                const pixelIndex = ny * canvas.width + nx;
                                
                                if (expandedMask[pixelIndex] === 0) {
                                    // 计算距离并用于加权
                                    const distance = Math.sqrt(dx*dx + dy*dy);
                                    const weight = Math.max(0, sampleRadius - distance) / sampleRadius;
                                    
                                    totalR += data[ni] * weight;
                                    totalG += data[ni + 1] * weight;
                                    totalB += data[ni + 2] * weight;
                                    totalWeight += weight;
                                }
                            }
                        }
                    }
                    
                    // 应用加权平均填充
                    if (totalWeight > 0) {
                        data[i] = totalR / totalWeight;
                        data[i + 1] = totalG / totalWeight;
                        data[i + 2] = totalB / totalWeight;
                        // 保持原始透明度
                    } else {
                        // 如果没有有效样本，尝试扩大搜索半径
                        // 这里简化处理，实际可能需要更复杂的算法
                        const fallbackValue = 255; // 白色作为后备
                        data[i] = data[i + 1] = data[i + 2] = fallbackValue;
                    }
                }
            }
        }
        
        // 将处理后的数据放回画布
        ctx.putImageData(imageData, 0, 0);
        
        // 创建结果图像
        const resultImage = new Image();
        resultImage.src = canvas.toDataURL('image/png');
        
        // 图像加载完成后返回
        resultImage.onload = () => {
            resolve(resultImage);
        };
    });
}

/**
 * 显示处理结果
 * @param {HTMLImageElement} resultImage - 处理后的图像
 */
function displayProcessedResult(resultImage) {
    // 隐藏编辑区域
    document.getElementById('editor-section').classList.add('hidden');
    
    // 显示结果区域
    const resultSection = document.getElementById('result-section');
    resultSection.classList.remove('hidden');
    
    // 显示原始图像
    const originalContainer = document.getElementById('original-image-container');
    const originalImg = document.createElement('img');
    originalImg.src = imageCanvas.toDataURL('image/png');
    originalContainer.innerHTML = '';
    originalContainer.appendChild(originalImg);
    
    // 显示处理后的图像
    const resultContainer = document.getElementById('result-image-container');
    const resultImg = document.createElement('img');
    resultImg.src = resultImage.src;
    resultContainer.innerHTML = '';
    resultContainer.appendChild(resultImg);
    
    // 设置下载按钮
    const downloadButton = document.getElementById('download-button');
    if (downloadButton) {
        downloadButton.onclick = () => {
            // 创建一个下载链接
            const link = document.createElement('a');
            link.download = 'ai-removed-image.png';
            link.href = resultImage.src;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    }
}

// 暴露函数给其他模块
window.setCanvasImage = setCanvasImage;
window.resetCanvas = resetCanvas; 