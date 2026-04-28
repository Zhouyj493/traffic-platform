// ==================== 中国地图加载脚本（内联数据版）====================
// 数据来源：阿里云 DataV（基于国家标准数据）
// 审图号：GS（2024）0650号（天地图）

(async function() {
    console.log('开始加载地图数据...');
    
    // 从本地加载 GeoJSON 文件
    const response = await fetch('/traffic-platform/js/china.json');
    const geoJson = await response.json();
    
    // 注册地图
    echarts.registerMap('china', geoJson);
    console.log('✅ 中国地图注册成功 | 审图号：GS（2024）0650号');
    
    // 触发事件，通知页面地图已就绪
    window.dispatchEvent(new CustomEvent('chinaMapLoaded'));
})();