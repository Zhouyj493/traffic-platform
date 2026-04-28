// ==================== API配置 ====================
const API_BASE = 'http://localhost:5000/api';
let realPredictionData = null;
let predictionMapChart = null;
let lineChart = null;
let barChart = null;
let pieChart = null;

// ==================== 全局变量 ====================
var isProvinceView = false;
var currentProvince = '';
var currentZoom = 1.2;
var currentCenter = [104.0, 35.0];

// ==================== 实时时间 ====================
function updateTime() {
    document.getElementById('realTime').innerText = new Date().toLocaleString();
}
updateTime();
setInterval(updateTime, 1000);

// ==================== 省份视图配置 ====================
var provinceViewConfig = {
    '北京市': { center: [116.40, 39.90], zoom: 9 },
    '上海市': { center: [121.48, 31.22], zoom: 9 },
    '天津市': { center: [117.20, 39.13], zoom: 8 },
    '重庆市': { center: [106.55, 29.56], zoom: 8 },
    '河北省': { center: [114.80, 38.00], zoom: 7 },
    '山西省': { center: [112.56, 37.50], zoom: 7 },
    '辽宁省': { center: [123.00, 41.50], zoom: 7 },
    '吉林省': { center: [125.80, 43.50], zoom: 7 },
    '黑龙江省': { center: [127.00, 47.00], zoom: 6.5 },
    '江苏省': { center: [119.00, 32.50], zoom: 8 },
    '浙江省': { center: [120.50, 29.00], zoom: 8 },
    '安徽省': { center: [117.00, 32.00], zoom: 7.5 },
    '福建省': { center: [118.00, 26.00], zoom: 7.5 },
    '江西省': { center: [115.50, 27.50], zoom: 7.5 },
    '山东省': { center: [117.50, 36.50], zoom: 7.5 },
    '河南省': { center: [113.50, 34.00], zoom: 7.5 },
    '湖北省': { center: [112.50, 31.00], zoom: 7.5 },
    '湖南省': { center: [112.00, 28.00], zoom: 7.5 },
    '广东省': { center: [113.50, 23.00], zoom: 8 },
    '海南省': { center: [109.50, 18.80], zoom: 7.5 },
    '四川省': { center: [104.00, 30.50], zoom: 7 },
    '贵州省': { center: [107.00, 27.00], zoom: 7.5 },
    '云南省': { center: [102.00, 25.00], zoom: 7 },
    '陕西省': { center: [109.00, 35.00], zoom: 7 },
    '甘肃省': { center: [100.00, 38.00], zoom: 6.5 },
    '青海省': { center: [96.00, 36.00], zoom: 6 },
    '内蒙古自治区': { center: [113.00, 44.00], zoom: 5.5 },
    '广西壮族自治区': { center: [108.50, 23.50], zoom: 7 },
    '西藏自治区': { center: [88.00, 31.00], zoom: 5 },
    '宁夏回族自治区': { center: [106.00, 37.50], zoom: 7.5 },
    '新疆维吾尔自治区': { center: [85.00, 41.00], zoom: 5 },
    '香港特别行政区': { center: [114.17, 22.27], zoom: 10 },
    '澳门特别行政区': { center: [113.54, 22.19], zoom: 11 }
};

// ==================== 省份预测详细数据 ====================
function getProvincePredictionData(provinceName) {
    if (realPredictionData && realPredictionData.province_heatmap) {
        for (var i = 0; i < realPredictionData.province_heatmap.length; i++) {
            var pName = realPredictionData.province_heatmap[i].name;
            var fullNameMap = {
                '北京': '北京市', '上海': '上海市', '天津': '天津市', '重庆': '重庆市',
                '广东': '广东省', '江苏': '江苏省', '浙江': '浙江省', '四川': '四川省',
                '湖北': '湖北省', '湖南': '湖南省', '河南': '河南省', '河北': '河北省',
                '山东': '山东省', '山西': '山西省', '陕西': '陕西省', '福建': '福建省',
                '安徽': '安徽省', '江西': '江西省', '辽宁': '辽宁省', '吉林': '吉林省',
                '黑龙江': '黑龙江省', '云南': '云南省', '贵州': '贵州省', '甘肃': '甘肃省',
                '青海': '青海省', '海南': '海南省', '新疆': '新疆维吾尔自治区',
                '内蒙古': '内蒙古自治区', '广西': '广西壮族自治区', '宁夏': '宁夏回族自治区',
                '西藏': '西藏自治区', '香港': '香港特别行政区', '澳门': '澳门特别行政区'
            };
            var targetName = fullNameMap[pName] || pName;
            if (provinceName === targetName || provinceName.indexOf(pName) !== -1) {
                var index = realPredictionData.province_heatmap[i].value;
                var level = index >= 90 ? '严重拥堵预测' : (index >= 80 ? '中度拥堵预测' : (index >= 70 ? '轻度拥堵预测' : (index >= 60 ? '基本畅通预测' : '畅通预测')));
                var alertLevel = index >= 90 ? '红色预警' : (index >= 80 ? '橙色预警' : (index >= 70 ? '黄色预警' : (index >= 60 ? '蓝色预警' : '无预警')));
                return {
                    index: index,
                    level: level,
                    trend: index > 70 ? '↑上升' : (index < 50 ? '↓下降' : '→平稳'),
                    mainRoads: '主要干道',
                    timeRange: '未来30-60分钟',
                    affectedArea: provinceName + '主城区',
                    suggestion: index >= 70 ? '建议错峰出行' : '路况良好',
                    alertLevel: alertLevel
                };
            }
        }
    }
    
    var defaultData = { index: 65, level: '基本畅通预测', trend: '→平稳', mainRoads: '主要干道', timeRange: '未来30-60分钟', affectedArea: '主城区', suggestion: '注意行车安全', alertLevel: '无预警' };
    return defaultData;
}

// ==================== 显示省份预测信息弹窗 ====================
function showProvincePredictionInfo(provinceName, data) {
    var levelColor = { '红色预警': '#ff0066', '橙色预警': '#ff6600', '黄色预警': '#ffcc00', '蓝色预警': '#44aaff', '无预警': '#44ff88' };
    var alertColor = levelColor[data.alertLevel] || '#00aaff';
    var levelIcon = { '严重拥堵预测': '🔴', '中度拥堵预测': '🟠', '轻度拥堵预测': '🟡', '基本畅通预测': '🟢', '畅通预测': '🟢' };
    var icon = levelIcon[data.level] || '📊';
    var trendColor = data.trend.indexOf('上升') !== -1 ? '#ff8888' : (data.trend.indexOf('下降') !== -1 ? '#88ff88' : '#ffdd88');
    
    var existingModal = document.getElementById('provinceModal');
    if (existingModal) existingModal.remove();
    
    var alertBadge = data.alertLevel !== '无预警' ? '<div style="margin-top:8px;"><span style="background:' + alertColor + ';color:#000;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:bold;">⚠️ ' + data.alertLevel + '</span></div>' : '';
    
    var modalHtml = '<div id="provinceModal" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(145deg,#1e4a7a 0%,#0f2d4f 100%);border:2px solid ' + alertColor + ';border-radius:20px;padding:25px 35px;z-index:1000;min-width:420px;max-width:500px;max-height:85vh;overflow-y:auto;box-shadow:0 0 50px rgba(0,170,255,0.7);"><div style="position:sticky;top:0;text-align:right;cursor:pointer;color:#fff;font-size:24px;font-weight:bold;margin-bottom:10px;" onclick="closeProvinceModal()">✕</div><div style="text-align:center;margin-bottom:22px;"><span style="font-size:42px;">' + icon + '</span><h2 style="color:' + alertColor + ';margin:10px 0 0 0;font-size:26px;">' + provinceName + '</h2><div style="margin-top:8px;"><span style="background:' + alertColor + ';color:#000;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:bold;">' + data.level + '</span></div>' + alertBadge + '</div><div style="border-top:1px solid rgba(0,170,255,0.5);margin:12px 0 18px 0;"></div><div style="display:flex;justify-content:space-around;text-align:center;margin-bottom:20px;"><div><div style="font-size:32px;font-weight:bold;color:' + alertColor + ';">' + data.index + '</div><div style="font-size:11px;color:#8bbddd;">预测拥堵指数</div></div><div><div style="font-size:32px;font-weight:bold;color:#ffdd88;">' + data.trend + '</div><div style="font-size:11px;color:#8bbddd;">趋势变化</div></div><div><div style="font-size:32px;font-weight:bold;color:#88ddff;">' + data.timeRange + '</div><div style="font-size:11px;color:#8bbddd;">预测时间</div></div></div><table style="width:100%;color:#f0f0f0;font-size:14px;"><tr style="height:42px;"><td style="width:100px;">🛣️ 主要路段：</td><td style="font-weight:bold;color:#ffdd88;">' + data.mainRoads + 'NonNullable</td></tr><tr style="height:42px;"><td>📍 影响范围：</td><td style="font-weight:bold;color:#88ddff;">' + data.affectedArea + 'NonNullable</td></tr><tr style="height:42px;"><td>💡 出行建议：</td><td style="font-weight:bold;color:#aaffaa;">' + data.suggestion + 'NonNullable</td></tr></table><div style="border-top:1px solid rgba(0,170,255,0.3);margin:15px 0 8px 0;padding-top:10px;text-align:center;font-size:11px;color:#8bbddd;">📡 基于实时路况AI预测 | 每5分钟更新</div></div>';
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeProvinceModal() {
    var modal = document.getElementById('provinceModal');
    if (modal) modal.remove();
}

function showBackButton() {
    removeBackButton();
    var backBtn = document.createElement('div');
    backBtn.id = 'backToNationalBtn';
    backBtn.innerHTML = '← 返回全国地图';
    backBtn.style.cssText = 'position:absolute;bottom:20px;right:20px;background:rgba(0,170,255,0.9);color:white;padding:10px 20px;border-radius:25px;cursor:pointer;font-size:14px;font-weight:bold;z-index:100;box-shadow:0 2px 15px rgba(0,0,0,0.3);';
    backBtn.onclick = function() { backToNationalView(); };
    var mapContainer = document.getElementById('map');
    if (mapContainer) { mapContainer.style.position = 'relative'; mapContainer.appendChild(backBtn); }
}

function removeBackButton() {
    var existingBtn = document.getElementById('backToNationalBtn');
    if (existingBtn) existingBtn.remove();
}

function backToNationalView() {
    isProvinceView = false;
    currentProvince = '';
    if (predictionMapChart) { 
        predictionMapChart.setOption({ 
            geo: { center: currentCenter, zoom: currentZoom, roam: true }
        });
    }
    removeBackButton();
}

// ==================== 城市坐标数据 ====================
var cityCoordinates = {
    '北京': [116.40, 39.90], '上海': [121.48, 31.22], '广州': [113.27, 23.13],
    '深圳': [114.06, 22.54], '天津': [117.20, 39.13], '重庆': [106.55, 29.56],
    '成都': [104.06, 30.67], '杭州': [120.15, 30.28], '武汉': [114.30, 30.60],
    '南京': [118.78, 32.04], '西安': [108.94, 34.34], '郑州': [113.65, 34.76],
    '长沙': [112.98, 28.20], '苏州': [120.62, 31.30], '青岛': [120.38, 36.07],
    '沈阳': [123.43, 41.80], '宁波': [121.55, 29.88], '合肥': [117.28, 31.86],
    '佛山': [113.12, 23.02], '东莞': [113.75, 23.04], '无锡': [120.29, 31.49],
    '昆明': [102.71, 25.05], '哈尔滨': [126.63, 45.75], '南宁': [108.32, 22.84],
    '厦门': [118.10, 24.46], '长春': [125.35, 43.88], '南昌': [115.89, 28.68],
    '济南': [117.00, 36.65], '大连': [121.62, 38.92], '福州': [119.30, 26.08],
    '贵阳': [106.71, 26.57], '兰州': [103.82, 36.06], '太原': [112.56, 37.87],
    '乌鲁木齐': [87.62, 43.82], '呼和浩特': [111.65, 40.82], '银川': [106.27, 38.47],
    '西宁': [101.74, 36.56], '海口': [110.35, 20.02], '香港': [114.17, 22.27],
    '澳门': [113.54, 22.19], '石家庄': [114.52, 38.05], '台北': [121.52, 25.03]
};

// ==================== 更新顶部指标 ====================
function updateTopIndicators() {
    if (!realPredictionData) return;
    var wc = document.getElementById('warningCount');
    var acc = document.getElementById('accuracy');
    var ci = document.getElementById('congestionIndex');
    var sp = document.getElementById('avgSpeed');
    if (wc) wc.innerText = realPredictionData.warning_count || 3;
    if (acc) acc.innerText = (realPredictionData.accuracy || 92) + '%';
    if (ci) ci.innerText = realPredictionData.congestion_index || 1.95;
    if (sp) sp.innerText = realPredictionData.avg_speed || 20.3;
}

// ==================== 更新折线图 ====================
function updateLineChart() {
    if (!lineChart || !realPredictionData) return;
    var trendData = realPredictionData.predicted_trend || [1.46,1.48,1.51,1.55,1.62,1.70,1.78,1.85,1.91,1.94,1.95,1.94,1.93];
    lineChart.setOption({ series: [{ data: trendData }] });
}

// ==================== 更新柱状图 ====================
function updateBarChart() {
    if (!barChart || !realPredictionData) return;
    var roads = realPredictionData.top_roads || [{name:"人民路",index:98},{name:"中山路",index:95},{name:"解放路",index:92},{name:"世纪大道",index:88},{name:"建设路",index:85}];
    barChart.setOption({
        yAxis: { data: roads.map(function(r) { return r.name; }) },
        series: [{ data: roads.map(function(r) { return r.index; }) }]
    });
}

// ==================== 更新饼图 ====================
function updatePieChart() {
    if (!pieChart || !realPredictionData) return;
    var types = realPredictionData.warning_types || [
        { type: "拥堵预警", ratio: 38 }, { type: "事故预警", ratio: 28 },
        { type: "设备故障预警", ratio: 16 }, { type: "天气预警", ratio: 12 }, { type: "交通管制预警", ratio: 6 }
    ];
    pieChart.setOption({ series: [{ data: types.map(function(t) { return { value: t.ratio, name: t.type }; }) }] });
}

// ==================== 初始化地图 ====================
function initPredictionMap() {
    var mapDom = document.getElementById('map');
    if (!mapDom) return;
    
    if (predictionMapChart) {
        predictionMapChart.dispose();
    }
    predictionMapChart = echarts.init(mapDom);
    
    var option = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            formatter: function(params) {
                if (params.seriesName === '拥堵热力图') {
                    return params.name + '<br/>拥堵指数: <b>' + (params.value || '暂无') + '</b>';
                }
                if (params.seriesName === '城市拥堵节点') {
                    return params.name + '<br/>拥堵指数: <b>' + params.value[2] + '</b>';
                }
                return params.name;
            }
        },
        geo: {
            map: 'china',
            roam: true,
            zoom: 1.2,
            center: [104.0, 35.0],
            itemStyle: {
                areaColor: 'rgba(0, 170, 255, 0.2)',
                borderColor: '#00aaff',
                borderWidth: 1
            },
            label: {
                show: true,
                color: '#fff',
                fontSize: 9
            },
            emphasis: {
                itemStyle: { areaColor: 'rgba(0, 170, 255, 0.5)' },
                label: { show: true, color: '#ffd600', fontSize: 11 }
            }
        },
        visualMap: {
            type: 'continuous',
            min: 30,
            max: 90,
            calculable: true,
            inRange: { color: ['#44ff88', '#88cc00', '#ffcc00', '#ff6600', '#ff0066'] },
            textStyle: { color: '#fff' },
            left: 20,
            bottom: 20,
            text: ['高拥堵', '低拥堵']
        },
        series: [
            {
                name: '拥堵热力图',
                type: 'map',
                map: 'china',
                geoIndex: 0,
                label: {
                    show: true,
                    color: '#fff',
                    fontSize: 9
                },
                emphasis: {
                    label: { show: true, color: '#ffd600', fontSize: 11 }
                },
                itemStyle: {
                    borderColor: '#00aaff',
                    borderWidth: 1
                },
                data: []
            },
            {
                name: '城市拥堵节点',
                type: 'scatter',
                coordinateSystem: 'geo',
                geoIndex: 0,
                data: [],
                symbolSize: function(val) {
                    return 12 + (val[2] - 40) / 60 * 10;
                },
                itemStyle: {
                    color: function(params) {
                        var v = params.value[2];
                        if (v >= 90) return '#ff0066';
                        if (v >= 80) return '#ff3300';
                        if (v >= 70) return '#ff6600';
                        if (v >= 60) return '#ffcc00';
                        if (v >= 50) return '#88cc00';
                        return '#44ff88';
                    },
                    shadowBlur: 10,
                    borderWidth: 2,
                    borderColor: '#fff'
                },
                label: {
                    show: true,
                    formatter: '{b}',
                    position: 'right',
                    color: '#fff',
                    fontSize: 10,
                    offset: [6, 0]
                },
                emphasis: {
                    scale: 1.4,
                    label: { show: true, fontSize: 12, color: '#ffd600' }
                }
            }
        ]
    };
    
    predictionMapChart.setOption(option);
    
    currentZoom = 1.2;
    currentCenter = [104.0, 35.0];
    
    predictionMapChart.off('click');
    predictionMapChart.on('click', function(params) {
    console.log('点击:', params);
    var provinceName = params.name;
    if (!provinceName && params.data && params.data.name) {
        provinceName = params.data.name;
    }
    if (provinceName) {
        if (!isProvinceView) {
            isProvinceView = true;
            currentProvince = provinceName;
        }
        var config = provinceViewConfig[provinceName] || { center: [104.0, 35.0], zoom: 6 };
        predictionMapChart.setOption({ geo: { center: config.center, zoom: config.zoom, roam: true } });
        showBackButton();
        var predictionData = getProvincePredictionData(provinceName);
        showProvincePredictionInfo(provinceName, predictionData);
    }
});
    
    window.addEventListener('resize', function() {
        if (predictionMapChart) predictionMapChart.resize();
    });
}

// ==================== 更新地图数据 ====================
function updateMapData() {
    if (!predictionMapChart || !realPredictionData) return;
    
    console.log('开始更新地图数据...');
    
    var cities = realPredictionData.cities || [];
    var provinceHeatmap = realPredictionData.province_heatmap || [];
    
    var provinceFullNameMap = {
        '北京': '北京市', '上海': '上海市', '天津': '天津市', '重庆': '重庆市',
        '广东': '广东省', '江苏': '江苏省', '浙江': '浙江省', '四川': '四川省',
        '湖北': '湖北省', '湖南': '湖南省', '河南': '河南省', '河北': '河北省',
        '山东': '山东省', '山西': '山西省', '陕西': '陕西省', '福建': '福建省',
        '安徽': '安徽省', '江西': '江西省', '辽宁': '辽宁省', '吉林': '吉林省',
        '黑龙江': '黑龙江省', '云南': '云南省', '贵州': '贵州省', '甘肃': '甘肃省',
        '青海': '青海省', '海南': '海南省', '新疆': '新疆维吾尔自治区',
        '内蒙古': '内蒙古自治区', '广西': '广西壮族自治区', '宁夏': '宁夏回族自治区',
        '西藏': '西藏自治区', '香港': '香港特别行政区', '澳门': '澳门特别行政区'
    };
    
    var heatmapData = [];
    for (var i = 0; i < provinceHeatmap.length; i++) {
        var item = provinceHeatmap[i];
        var fullName = provinceFullNameMap[item.name];
        if (fullName) {
            heatmapData.push({ name: fullName, value: item.value });
        } else {
            heatmapData.push({ name: item.name, value: item.value });
        }
    }
    
    var cityNodes = [];
    for (var i = 0; i < cities.length; i++) {
        var city = cities[i];
        var coords = cityCoordinates[city.name];
        if (coords) {
            cityNodes.push({
                name: city.name,
                value: [coords[0], coords[1], city.value]
            });
        }
    }
    
    predictionMapChart.setOption({
        series: [
            { name: '拥堵热力图', data: heatmapData },
            { name: '城市拥堵节点', data: cityNodes }
        ]
    });
    
    console.log('地图更新完成 - 省份数据: ' + heatmapData.length + '条, 城市节点: ' + cityNodes.length + '个');
}

// ==================== 初始化其他图表 ====================
function initOtherCharts() {
    var lineDom = document.getElementById('line');
    if (lineDom) {
        lineChart = echarts.init(lineDom);
        lineChart.setOption({
            tooltip: { trigger: 'axis' },
            grid: { top: '15%', left: '5%', right: '5%', bottom: '10%', containLabel: true },
            xAxis: { type: 'category', data: ['现在', '5min', '10min', '15min', '20min', '25min', '30min', '35min', '40min', '45min', '50min', '55min', '60min'], axisLabel: { color: '#fff' } },
            yAxis: { type: 'value', axisLabel: { color: '#fff' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } } },
            series: [{ type: 'line', smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { color: '#fff', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(100,220,255,0.5)' }, { offset: 1, color: 'rgba(100,220,255,0)' }]) }, data: [] }]
        });
    }
    
    var barDom = document.getElementById('bar');
    if (barDom) {
        barChart = echarts.init(barDom);
        barChart.setOption({
            tooltip: { trigger: "item" },
            grid: { top: "10%", left: "22%", right: "10%", bottom: "10%" },
            xAxis: { type: "value", show: false, max: 100 },
            yAxis: { type: "category", inverse: true, data: [], axisLabel: { color: "#fff" } },
            series: [{ type: "bar", barWidth: 18, itemStyle: { barBorderRadius: 10, color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: "#0099ff" }, { offset: 1, color: "#00ffcc" }]) }, label: { show: true, position: "insideRight", color: "#fff", formatter: "{c}" } }]
        });
    }
    
    var pieDom = document.getElementById('pie');
    if (pieDom) {
        pieChart = echarts.init(pieDom);
        pieChart.setOption({
            color: ["#ff0066", "#ff6600", "#ffcc00", "#44aaff", "#88ff88"],
            tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
            series: [{ type: "pie", radius: ["30%", "70%"], center: ["50%", "45%"], itemStyle: { borderRadius: 6 }, label: { color: "#fff", fontSize: 12 }, labelLine: { lineStyle: { color: "#fff" } }, data: [] }]
        });
    }
    
    window.addEventListener('resize', function() {
        if (lineChart) lineChart.resize();
        if (barChart) barChart.resize();
        if (pieChart) pieChart.resize();
        if (predictionMapChart) predictionMapChart.resize();
    });
}

// ==================== 从API加载预测数据 ====================
async function loadPredictionData() {
    try {
        console.log('🔄 开始加载预测数据...');
        var response = await fetch(API_BASE + '/prediction');
        var result = await response.json();
        if (result) {
            realPredictionData = result;
            console.log('✅ 预测数据加载成功');
            updateTopIndicators();
            updateLineChart();
            updateBarChart();
            updatePieChart();
            if (predictionMapChart) {
                updateMapData();
            }
        }
    } catch (error) {
        console.error('❌ 加载预测数据失败:', error);
    }
}

// ==================== 页面加载 ====================
window.addEventListener('load', function() {
    initOtherCharts();
    loadPredictionData();
    
    if (typeof window.waitForChinaMap === 'function') {
        window.waitForChinaMap(function() { initPredictionMap(); });
    } else {
        setTimeout(function() { initPredictionMap(); }, 500);
    }
    
    setInterval(loadPredictionData, 5 * 60 * 1000);
});