// ==================== 中国地图加载脚本 ====================
// 数据来源：阿里云 DataV（基于国家标准数据）
// 审图号：GS（2024）0650号（天地图）

(function() {
    console.log('开始加载中国地图...');

    window.chinaMapLoaded = false;
    window.chinaMapCallbacks = [];

    function registerChinaMap(geoJson) {
        if (typeof echarts === 'undefined') {
            console.error('ECharts 未加载');
            return;
        }
        echarts.registerMap('china', geoJson);
        console.log('中国地图注册成功 | 数据来源：天地图 审图号：GS（2024）0650号');
        
        window.chinaMapLoaded = true;
        for (var i = 0; i < window.chinaMapCallbacks.length; i++) {
            window.chinaMapCallbacks[i]();
        }
        window.chinaMapCallbacks = [];
        
        var event = new CustomEvent('chinaMapLoaded');
        window.dispatchEvent(event);
    }

    function waitForECharts() {
        if (typeof echarts !== 'undefined') {
            loadMapData();
        } else {
            setTimeout(waitForECharts, 100);
        }
    }

    function loadMapData() {
        // 使用阿里云 DataV GeoJSON 数据源（稳定可靠）
        var geoJsonUrl = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json';
        
        fetch(geoJsonUrl)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('HTTP error! status: ' + response.status);
                }
                return response.json();
            })
            .then(function(geoJson) {
                registerChinaMap(geoJson);
            })
            .catch(function(error) {
                console.error('加载地图数据失败:', error);
            });
    }

    window.waitForChinaMap = function(callback) {
        if (window.chinaMapLoaded) {
            callback();
        } else {
            window.chinaMapCallbacks.push(callback);
        }
    };

    waitForECharts();
})();