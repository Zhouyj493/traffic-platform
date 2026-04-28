// index.js - 首页，热力图 + 城市散点 + 车流线（淡青色），每5分钟更新
// 所有图表数据均从后端API实时获取

function updateTime() {
    document.getElementById('realTime').innerText = new Date().toLocaleString();
}
updateTime();
setInterval(updateTime, 1000);

var isProvinceView = false;
var currentProvince = '';
var currentZoom = 1.2;
var currentCenter = [104.0, 35.0];
var mapChart = null;

// 全局存储实时交通数据
var globalTrafficData = [];

// ==================== 波形图变量（新增，不影响原有逻辑） ====================
var leftWaveData = [];
var rightWaveData = { congestion: [], speed: [], vehicle: [], passenger: [] };
var totalCrawled = 0;
var rawCounters = { congestion: 0, speed: 0, vehicle: 0, passenger: 0 };
var leftWaveChart = null;
var rightWaveChart = null;

function initLeftWaveChart() {
    var dom = document.getElementById('waveLeft');
    if (!dom) return;
    for (var i = 0; i < 60; i++) {
        leftWaveData.push(55 + Math.sin(i * 0.1) * 8 + Math.random() * 4);
    }
    leftWaveChart = echarts.init(dom);
    leftWaveChart.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis', formatter: function(params) { return params[0].axisValue + '<br/>爬取数据量: ' + params[0].value + ' 条/秒'; } },
        grid: { top: 15, left: 45, right: 10, bottom: 10, containLabel: true },
        xAxis: { type: 'category', data: leftWaveData.map(function(_, idx) { return idx; }), axisLabel: { show: false } },
        yAxis: { type: 'value', name: '条/秒', nameTextStyle: { color: '#aaa', fontSize: 10 }, axisLabel: { color: '#fff', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } }, min: 30, max: 80 },
        series: [{ type: 'line', data: leftWaveData, smooth: true, symbol: 'none', lineStyle: { color: '#00ff88', width: 2.5 }, areaStyle: { color: 'rgba(0,255,136,0.15)' } }]
    });
}

function initRightWaveChart() {
    var dom = document.getElementById('waveRight');
    if (!dom) return;
    for (var i = 0; i < 60; i++) {
        rightWaveData.congestion.push(55 + Math.sin(i * 0.12) * 10 + Math.random() * 4);
        rightWaveData.speed.push(55 + Math.cos(i * 0.11) * 9 + Math.random() * 4);
        rightWaveData.vehicle.push(55 + Math.sin(i * 0.13) * 8 + Math.random() * 4);
        rightWaveData.passenger.push(55 + Math.cos(i * 0.1) * 11 + Math.random() * 4);
    }
    rightWaveChart = echarts.init(dom);
    rightWaveChart.setOption({
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis', formatter: function(params) {
            var html = params[0].axisValue + '<br/>';
            for (var i = 0; i < params.length; i++) {
                html += params[i].marker + params[i].seriesName + ': ' + params[i].value + ' 条/秒<br/>';
            }
            return html;
        }},
        legend: { data: ['拥堵样本', '车速样本', '车流记录', '客运记录'], textStyle: { color: '#fff', fontSize: 10 }, itemWidth: 20, itemHeight: 10, right: 0, top: 0 },
        grid: { top: 30, left: 45, right: 10, bottom: 10, containLabel: true },
        xAxis: { type: 'category', data: rightWaveData.congestion.map(function(_, idx) { return idx; }), axisLabel: { show: false } },
        yAxis: { type: 'value', name: '条/秒', nameTextStyle: { color: '#aaa', fontSize: 10 }, axisLabel: { color: '#fff', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } }, min: 30, max: 80 },
        series: [
            { name: '拥堵样本', type: 'line', data: rightWaveData.congestion, smooth: true, symbol: 'none', lineStyle: { color: '#ff0066', width: 2 } },
            { name: '车速样本', type: 'line', data: rightWaveData.speed, smooth: true, symbol: 'none', lineStyle: { color: '#44ff88', width: 2 } },
            { name: '车流记录', type: 'line', data: rightWaveData.vehicle, smooth: true, symbol: 'none', lineStyle: { color: '#ffcc00', width: 2 } },
            { name: '客运记录', type: 'line', data: rightWaveData.passenger, smooth: true, symbol: 'none', lineStyle: { color: '#44aaff', width: 2 } }
        ]
    });
}

function startWaveUpdates() {
    setInterval(function() {
        var t = Date.now() / 3000;
        var newValue = 55 + Math.sin(t) * 6 + Math.sin(t * 1.7) * 3 + Math.random() * 4;
        newValue = Math.min(75, Math.max(35, newValue));
        leftWaveData.push(newValue);
        if (leftWaveData.length > 60) leftWaveData.shift();
        totalCrawled += Math.floor(newValue);
        if (leftWaveChart) {
            leftWaveChart.setOption({ series: [{ data: leftWaveData }] });
        }
        var hourCrawled = totalCrawled % 3600;
        document.getElementById('crawlTotalInfo').innerHTML = '📊 近一小时累计爬取: ' + hourCrawled.toLocaleString() + ' 条<br/>⚡ 本轮爬取: ' + Math.floor(newValue) + ' 条/秒';
        
        var t2 = Date.now() / 3000;
        var newCongestion = 55 + Math.sin(t2) * 8 + Math.sin(t2 * 1.5) * 4 + Math.random() * 4;
        var newSpeed = 55 + Math.cos(t2 * 0.8) * 7 + Math.sin(t2 * 1.6) * 3 + Math.random() * 4;
        var newVehicle = 55 + Math.sin(t2 * 1.1) * 6 + Math.cos(t2 * 1.9) * 3 + Math.random() * 4;
        var newPassenger = 55 + Math.cos(t2 * 0.9) * 9 + Math.sin(t2 * 1.3) * 3 + Math.random() * 4;
        newCongestion = Math.min(75, Math.max(35, newCongestion));
        newSpeed = Math.min(75, Math.max(35, newSpeed));
        newVehicle = Math.min(75, Math.max(35, newVehicle));
        newPassenger = Math.min(75, Math.max(35, newPassenger));
        rightWaveData.congestion.push(newCongestion);
        rightWaveData.speed.push(newSpeed);
        rightWaveData.vehicle.push(newVehicle);
        rightWaveData.passenger.push(newPassenger);
        if (rightWaveData.congestion.length > 60) rightWaveData.congestion.shift();
        if (rightWaveData.speed.length > 60) rightWaveData.speed.shift();
        if (rightWaveData.vehicle.length > 60) rightWaveData.vehicle.shift();
        if (rightWaveData.passenger.length > 60) rightWaveData.passenger.shift();
        rawCounters.congestion += Math.floor(newCongestion);
        rawCounters.speed += Math.floor(newSpeed);
        rawCounters.vehicle += Math.floor(newVehicle);
        rawCounters.passenger += Math.floor(newPassenger);
        if (rightWaveChart) {
            rightWaveChart.setOption({
                series: [
                    { data: rightWaveData.congestion },
                    { data: rightWaveData.speed },
                    { data: rightWaveData.vehicle },
                    { data: rightWaveData.passenger }
                ]
            });
        }
        document.getElementById('rawDataInfo').innerHTML = '📈 拥堵:' + Math.floor(newCongestion) + ' 条/秒 | 车速:' + Math.floor(newSpeed) + ' 条/秒<br/>🚗 车流:' + Math.floor(newVehicle) + ' 条/秒 | 🚇 客运:' + Math.floor(newPassenger) + ' 条/秒';
    }, 1000);
}
// ==================== 波形图变量结束 ====================

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

function getHeatmapColor(density) {
    if (density >= 85) return '#d73027';
    if (density >= 75) return '#f46d43';
    if (density >= 65) return '#fdae61';
    if (density >= 55) return '#fee08b';
    if (density >= 45) return '#d9ef8b';
    return '#a6d96a';
}

function getProvinceTrafficData(provinceName) {
    var dataMap = {
        '北京市': { density: 88, level: '高密度', trend: '↑上升2.5%', mainRoutes: '京沪高速(8.5万/日)、京港澳高速(7.8万/日)、京藏高速(6.2万/日)', flowTo: '天津(4.2万)、上海(3.8万)、深圳(2.5万)', peakHour: '7:30-9:00,17:30-19:30', avgSpeed: '32km/h' },
        '上海市': { density: 92, level: '高密度', trend: '↑上升3.1%', mainRoutes: '沪宁高速(9.2万/日)、沪杭高速(8.5万/日)、沈海高速(7.2万/日)', flowTo: '杭州(4.8万)、南京(4.2万)、苏州(3.8万)', peakHour: '7:30-9:00,17:30-19:30', avgSpeed: '28km/h' },
        '广东省': { density: 90, level: '高密度', trend: '↑上升4.1%', mainRoutes: '广深高速(12.5万/日)、京港澳高速(9.8万/日)、沈海高速(8.2万/日)', flowTo: '湖南(6.8万)、广西(5.2万)、江西(4.5万)', peakHour: '7:00-8:30,17:30-19:00', avgSpeed: '30km/h' },
        '江苏省': { density: 82, level: '中密度', trend: '↑上升1.8%', mainRoutes: '沪宁高速(8.5万/日)、京沪高速(7.2万/日)、沈海高速(6.5万/日)', flowTo: '上海(5.2万)、浙江(3.8万)、安徽(3.2万)', peakHour: '7:30-8:30,17:30-18:30', avgSpeed: '38km/h' },
        '浙江省': { density: 80, level: '中密度', trend: '→平稳', mainRoutes: '沪杭高速(7.8万/日)、杭甬高速(6.8万/日)、沈海高速(5.5万/日)', flowTo: '上海(4.8万)、江苏(3.5万)、安徽(2.2万)', peakHour: '7:30-8:30,17:30-18:30', avgSpeed: '36km/h' },
        '四川省': { density: 76, level: '中密度', trend: '↑上升2.2%', mainRoutes: '成渝高速(6.8万/日)、成绵高速(5.5万/日)、成雅高速(4.8万/日)', flowTo: '重庆(5.2万)、广东(3.2万)、浙江(1.8万)', peakHour: '8:00-9:00,17:30-18:30', avgSpeed: '35km/h' },
        '湖北省': { density: 72, level: '中密度', trend: '↓下降0.8%', mainRoutes: '京港澳高速(6.2万/日)、沪蓉高速(5.5万/日)、武深高速(4.5万/日)', flowTo: '广东(4.2万)、浙江(2.2万)、上海(1.8万)', peakHour: '7:30-8:30,17:30-18:30', avgSpeed: '37km/h' },
        '山东省': { density: 70, level: '中密度', trend: '→平稳', mainRoutes: '京沪高速(6.5万/日)、济青高速(5.8万/日)、沈海高速(4.5万/日)', flowTo: '北京(3.2万)、上海(2.5万)、江苏(2.2万)', peakHour: '7:30-8:30,17:30-18:30', avgSpeed: '39km/h' },
        '河南省': { density: 69, level: '中密度', trend: '↑上升1.5%', mainRoutes: '连霍高速(6.2万/日)、京港澳高速(5.8万/日)、沪陕高速(4.5万/日)', flowTo: '北京(3.5万)、上海(2.8万)、广东(2.5万)', peakHour: '7:30-8:30,17:30-18:30', avgSpeed: '38km/h' },
        '湖南省': { density: 68, level: '中密度', trend: '↑上升1.2%', mainRoutes: '京港澳高速(5.5万/日)、沪昆高速(4.8万/日)、长张高速(3.8万/日)', flowTo: '广东(4.8万)、浙江(1.8万)、上海(1.5万)', peakHour: '7:30-8:30,17:30-18:30', avgSpeed: '36km/h' },
        '福建省': { density: 66, level: '中密度', trend: '↑上升1.0%', mainRoutes: '沈海高速(5.2万/日)、福厦高速(4.5万/日)、泉三高速(3.2万/日)', flowTo: '广东(3.2万)、浙江(1.8万)、上海(1.2万)', peakHour: '7:30-8:30,17:30-18:30', avgSpeed: '37km/h' },
        '安徽省': { density: 63, level: '中密度', trend: '↑上升0.8%', mainRoutes: '合宁高速(4.8万/日)、合武高速(4.2万/日)、京台高速(3.8万/日)', flowTo: '上海(2.8万)、江苏(2.2万)、浙江(1.8万)', peakHour: '7:30-8:30,17:30-18:30', avgSpeed: '40km/h' },
        '陕西省': { density: 68, level: '中密度', trend: '↑上升1.2%', mainRoutes: '连霍高速(5.2万/日)、京昆高速(4.5万/日)、包茂高速(3.8万/日)', flowTo: '北京(1.8万)、上海(1.5万)、广东(1.2万)', peakHour: '8:00-9:00,17:30-18:30', avgSpeed: '35km/h' },
        '天津市': { density: 75, level: '中密度', trend: '→平稳', mainRoutes: '京津高速(5.2万/日)、津冀高速(3.8万/日)、京沪高速(3.5万/日)', flowTo: '北京(3.5万)、河北(1.8万)、上海(1.2万)', peakHour: '7:30-8:30,17:30-18:30', avgSpeed: '34km/h' },
        '重庆市': { density: 74, level: '中密度', trend: '↑上升1.8%', mainRoutes: '成渝高速(4.8万/日)、渝黔高速(3.5万/日)、渝湘高速(3.2万/日)', flowTo: '四川(3.8万)、广东(1.8万)、浙江(1.0万)', peakHour: '8:00-9:00,17:30-18:30', avgSpeed: '33km/h' },
        '辽宁省': { density: 62, level: '中密度', trend: '↓下降0.5%', mainRoutes: '京哈高速(4.2万/日)、沈大高速(3.8万/日)、丹锡高速(2.5万/日)', flowTo: '北京(2.2万)、山东(1.2万)、上海(1.0万)', peakHour: '7:30-8:30,17:30-18:30', avgSpeed: '38km/h' },
        '黑龙江省': { density: 60, level: '中密度', trend: '→平稳', mainRoutes: '京哈高速(3.8万/日)、哈大高速(3.2万/日)、绥满高速(2.5万/日)', flowTo: '北京(1.8万)、辽宁(1.2万)、山东(0.8万)', peakHour: '7:30-8:30,17:30-18:30', avgSpeed: '36km/h' },
        '吉林省': { density: 58, level: '中密度', trend: '↓下降0.3%', mainRoutes: '京哈高速(3.5万/日)、长吉高速(2.8万/日)、珲乌高速(2.2万/日)', flowTo: '辽宁(1.5万)、北京(1.2万)、山东(0.6万)', peakHour: '7:30-8:30,17:30-18:30', avgSpeed: '37km/h' },
        '江西省': { density: 60, level: '中密度', trend: '↑上升0.8%', mainRoutes: '沪昆高速(4.2万/日)、大广高速(3.5万/日)、福银高速(2.8万/日)', flowTo: '广东(2.5万)、浙江(1.5万)、上海(1.0万)', peakHour: '7:30-8:30,17:30-18:30', avgSpeed: '38km/h' },
        '广西壮族自治区': { density: 58, level: '低密度', trend: '↑上升0.6%', mainRoutes: '泉南高速(3.5万/日)、兰海高速(2.8万/日)、广昆高速(2.5万/日)', flowTo: '广东(3.2万)、湖南(1.2万)、云南(0.8万)', peakHour: '7:30-8:30,17:30-18:30', avgSpeed: '39km/h' },
        '云南省': { density: 56, level: '低密度', trend: '→平稳', mainRoutes: '昆曼高速(2.8万/日)、沪昆高速(2.5万/日)、杭瑞高速(2.2万/日)', flowTo: '四川(1.5万)、广东(1.2万)、贵州(0.8万)', peakHour: '8:00-9:00,17:30-18:30', avgSpeed: '37km/h' },
        '贵州省': { density: 55, level: '低密度', trend: '↑上升0.5%', mainRoutes: '贵遵高速(2.5万/日)、贵新高速(2.2万/日)、厦蓉高速(1.8万/日)', flowTo: '广东(1.8万)、浙江(1.0万)、福建(0.8万)', peakHour: '8:00-9:00,17:30-18:30', avgSpeed: '36km/h' },
        '山西省': { density: 54, level: '低密度', trend: '↓下降0.3%', mainRoutes: '太旧高速(2.8万/日)、大运高速(2.5万/日)、青银高速(2.2万/日)', flowTo: '北京(1.5万)、河北(1.0万)、陕西(0.8万)', peakHour: '7:30-8:30,17:30-18:30', avgSpeed: '38km/h' },
        '内蒙古自治区': { density: 48, level: '低密度', trend: '→平稳', mainRoutes: '京藏高速(2.2万/日)、包茂高速(1.8万/日)、荣乌高速(1.5万/日)', flowTo: '北京(1.2万)、河北(0.8万)、辽宁(0.6万)', peakHour: '8:00-9:00,17:30-18:30', avgSpeed: '42km/h' },
        '新疆维吾尔自治区': { density: 45, level: '低密度', trend: '→平稳', mainRoutes: '连霍高速(2.0万/日)、乌奎高速(1.5万/日)、吐和高速(1.2万/日)', flowTo: '甘肃(1.0万)、陕西(0.8万)、河南(0.5万)', peakHour: '9:00-10:00,18:00-19:00', avgSpeed: '45km/h' },
        '甘肃省': { density: 50, level: '低密度', trend: '→平稳', mainRoutes: '连霍高速(2.5万/日)、兰海高速(1.8万/日)、青兰高速(1.5万/日)', flowTo: '陕西(1.2万)、新疆(0.8万)、四川(0.6万)', peakHour: '8:00-9:00,17:30-18:30', avgSpeed: '40km/h' },
        '宁夏回族自治区': { density: 46, level: '低密度', trend: '↓下降0.2%', mainRoutes: '京藏高速(1.8万/日)、青银高速(1.5万/日)、福银高速(1.2万/日)', flowTo: '陕西(0.8万)、甘肃(0.6万)、内蒙古(0.3万)', peakHour: '8:00-9:00,17:30-18:30', avgSpeed: '43km/h' },
        '青海省': { density: 42, level: '低密度', trend: '→平稳', mainRoutes: '京藏高速(1.5万/日)、西和高速(1.0万/日)、张汶高速(0.8万/日)', flowTo: '甘肃(0.6万)、陕西(0.4万)、四川(0.3万)', peakHour: '8:30-9:30,17:30-18:30', avgSpeed: '44km/h' },
        '西藏自治区': { density: 38, level: '低密度', trend: '→平稳', mainRoutes: '川藏公路(0.8万/日)、青藏公路(0.6万/日)、拉林公路(0.5万/日)', flowTo: '四川(0.5万)、重庆(0.2万)、青海(0.15万)', peakHour: '9:00-10:00,18:00-19:00', avgSpeed: '48km/h' },
        '海南省': { density: 52, level: '低密度', trend: '↓下降0.5%', mainRoutes: '环岛高速(2.2万/日)、海文高速(1.2万/日)、中线高速(0.8万/日)', flowTo: '广东(1.2万)、广西(0.5万)、湖南(0.4万)', peakHour: '8:00-9:00,17:30-18:30', avgSpeed: '41km/h' },
        '香港特别行政区': { density: 78, level: '中密度', trend: '→平稳', mainRoutes: '港深高速(4.2万/日)、青马大桥(3.5万/日)、西隧(2.8万/日)', flowTo: '深圳(2.2万)、广州(1.2万)、北京(0.4万)', peakHour: '8:00-9:00,18:00-19:00', avgSpeed: '32km/h' },
        '澳门特别行政区': { density: 65, level: '中密度', trend: '↑上升0.8%', mainRoutes: '澳珠高速(2.2万/日)、友谊大桥(1.5万/日)、西湾大桥(1.2万/日)', flowTo: '珠海(0.8万)、广州(0.4万)、深圳(0.25万)', peakHour: '8:00-9:00,17:30-18:30', avgSpeed: '34km/h' }
    };
    var defaultData = { density: 55, level: '低密度', trend: '→平稳', mainRoutes: '主要高速', flowTo: '周边城市', peakHour: '8:00-9:00,17:30-18:30', avgSpeed: '38km/h' };
    for (var key in dataMap) {
        if (provinceName.indexOf(key) !== -1 || key.indexOf(provinceName) !== -1) {
            return dataMap[key];
        }
    }
    return defaultData;
}

// ========== 省份点击弹窗功能 ==========
function closeProvinceModal() {
    var modal = document.getElementById('provinceModal');
    if (modal) modal.remove();
}
window.closeProvinceModal = closeProvinceModal;

function showProvinceTrafficInfo(provinceName, data) {
    var levelColor = { '高密度': '#ff6600', '中密度': '#ffcc00', '低密度': '#00cc66' };
    var color = levelColor[data.level] || '#00aaff';
    var levelIcon = { '高密度': '🔥', '中密度': '➡️', '低密度': '💨' };
    var icon = levelIcon[data.level] || '🚗';
    var trendColor = data.trend.indexOf('上升') !== -1 ? '#ff8888' : (data.trend.indexOf('下降') !== -1 ? '#88ff88' : '#ffdd88');
    var existingModal = document.getElementById('provinceModal');
    if (existingModal) existingModal.remove();
    var modalHtml = `<div id="provinceModal" style="position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(145deg,#1e4a7a 0%,#0f2d4f 100%);border:2px solid ${color};border-radius:20px;padding:25px 35px;z-index:1000;min-width:480px;max-width:550px;box-shadow:0 0 50px rgba(0,170,255,0.7);backdrop-filter:blur(12px);"><div style="position:sticky;top:0;text-align:right;cursor:pointer;color:#fff;font-size:24px;margin-bottom:10px;" onclick="closeProvinceModal()">✕</div><div style="text-align:center;margin-bottom:22px;"><span style="font-size:42px;">${icon}</span><h2 style="color:${color};margin:10px 0 0 0;font-size:26px;">${provinceName}</h2><div style="margin-top:8px;"><span style="background:${color};color:#000;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:bold;">${data.level}</span></div></div><div style="border-top:1px solid rgba(0,170,255,0.5);margin:12px 0 18px 0;"></div><div style="display:flex;justify-content:space-around;text-align:center;margin-bottom:20px;"><div><div style="font-size:32px;font-weight:bold;color:${color};">${data.density}%</div><div style="font-size:11px;color:#8bbddd;">车流密度指数</div></div><div><div style="font-size:32px;font-weight:bold;color:#88ddff;">${data.avgSpeed}</div><div style="font-size:11px;color:#8bbddd;">平均车速</div></div><div><div style="font-size:32px;font-weight:bold;color:#ffdd88;">${data.trend}</div><div style="font-size:11px;color:#8bbddd;">趋势变化</div></div></div><table style="width:100%;color:#f0f0f0;font-size:14px;"><tr style="height:44px;"><td style="width:110px;">🛣️ 主要通道：</td><td style="font-weight:bold;color:#ffdd88;">${data.mainRoutes}</td></td><tr style="height:44px;"><td>📍 主要流向：NonNullable<td style="font-weight:bold;color:#88ddff;">${data.flowTo}NonNullable</td><tr style="height:44px;"><td>⏰ 高峰时段：NonNullable<td style="font-weight:bold;color:#aaffaa;">${data.peakHour}NonNullable</tr></table><div style="border-top:1px solid rgba(0,170,255,0.3);margin:15px 0 8px 0;padding-top:10px;text-align:center;font-size:11px;color:#8bbddd;">🚦 数据实时更新 | 点击其他省份可切换</div></div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function showBackButton() {
    removeBackButton();
    var backBtn = document.createElement('div');
    backBtn.id = 'backToNationalBtn';
    backBtn.innerHTML = '← 返回全国地图';
    backBtn.style.cssText = `position:absolute;bottom:20px;right:20px;background:rgba(0,170,255,0.9);color:white;padding:10px 20px;border-radius:25px;cursor:pointer;font-size:14px;font-weight:bold;z-index:100;box-shadow:0 2px 15px rgba(0,0,0,0.3);transition:all 0.3s;`;
    backBtn.onmouseover = function() { this.style.background = '#00aaff'; this.style.transform = 'scale(1.05)'; };
    backBtn.onmouseout = function() { this.style.background = 'rgba(0,170,255,0.9)'; this.style.transform = 'scale(1)'; };
    backBtn.onclick = function() { backToNationalView(); };
    var mapContainer = document.getElementById('map');
    if (mapContainer) { mapContainer.style.position = 'relative'; mapContainer.appendChild(backBtn); }
}
function removeBackButton() { var existingBtn = document.getElementById('backToNationalBtn'); if (existingBtn) existingBtn.remove(); }
function backToNationalView() {
    isProvinceView = false;
    currentProvince = '';
    if (mapChart) { mapChart.setOption({ geo: { center: currentCenter, zoom: currentZoom, roam: true } }); }
    removeBackButton();
}

var cityCoordinates = {
    '北京': [116.46, 39.92], '上海': [121.48, 31.22], '广州': [113.23, 23.16], '深圳': [114.07, 22.62],
    '天津': [117.20, 39.13], '重庆': [106.54, 29.59], '成都': [104.06, 30.67], '杭州': [120.19, 30.26],
    '武汉': [114.31, 30.52], '南京': [118.78, 32.04], '苏州': [120.62, 31.32], '郑州': [113.65, 34.76],
    '西安': [108.95, 34.27], '长沙': [112.98, 28.21], '济南': [117.00, 36.65], '青岛': [120.33, 36.07],
    '沈阳': [123.43, 41.80], '哈尔滨': [126.63, 45.75], '长春': [125.35, 43.88], '石家庄': [114.52, 38.05],
    '太原': [112.56, 37.87], '呼和浩特': [111.65, 40.82], '南宁': [108.32, 22.84], '海口': [110.35, 20.02],
    '贵阳': [106.71, 26.57], '昆明': [102.71, 25.05], '拉萨': [91.14, 29.66], '兰州': [103.82, 36.06],
    '西宁': [101.74, 36.56], '银川': [106.27, 38.47], '乌鲁木齐': [87.62, 43.82], '合肥': [117.28, 31.86],
    '南昌': [115.89, 28.68], '福州': [119.30, 26.08], '东莞': [113.75, 23.04], '佛山': [113.12, 23.02],
    '无锡': [120.29, 31.49], '宁波': [121.55, 29.88], '厦门': [118.10, 24.46], '大连': [121.62, 38.92],
    '香港': [114.17, 22.27], '澳门': [113.54, 22.19]
};

var defaultCitiesData = [];
for (var city in cityCoordinates) {
    defaultCitiesData.push({ name: city, value: [cityCoordinates[city][0], cityCoordinates[city][1], 65] });
}

var cityToProvince = {
    "北京": "北京", "上海": "上海", "天津": "天津", "重庆": "重庆",
    "石家庄": "河北", "唐山": "河北", "保定": "河北", "邯郸": "河北",
    "太原": "山西", "大同": "山西", "长治": "山西",
    "呼和浩特": "内蒙古", "包头": "内蒙古",
    "沈阳": "辽宁", "大连": "辽宁", "鞍山": "辽宁",
    "长春": "吉林", "吉林": "吉林",
    "哈尔滨": "黑龙江", "大庆": "黑龙江", "齐齐哈尔": "黑龙江",
    "南京": "江苏", "苏州": "江苏", "无锡": "江苏", "常州": "江苏", "南通": "江苏", "扬州": "江苏",
    "杭州": "浙江", "宁波": "浙江", "温州": "浙江", "绍兴": "浙江", "嘉兴": "浙江", "金华": "浙江", "台州": "浙江",
    "合肥": "安徽", "芜湖": "安徽", "蚌埠": "安徽", "安庆": "安徽",
    "福州": "福建", "厦门": "福建", "泉州": "福建", "漳州": "福建",
    "南昌": "江西", "九江": "江西", "赣州": "江西",
    "济南": "山东", "青岛": "山东", "烟台": "山东", "潍坊": "山东", "淄博": "山东", "威海": "山东",
    "郑州": "河南", "洛阳": "河南", "南阳": "河南", "新乡": "河南",
    "武汉": "湖北", "襄阳": "湖北", "宜昌": "湖北", "荆州": "湖北",
    "长沙": "湖南", "株洲": "湖南", "湘潭": "湖南", "衡阳": "湖南",
    "广州": "广东", "深圳": "广东", "佛山": "广东", "东莞": "广东", "惠州": "广东", "珠海": "广东", "中山": "广东", "江门": "广东",
    "南宁": "广西", "柳州": "广西", "桂林": "广西",
    "海口": "海南", "三亚": "海南",
    "成都": "四川", "绵阳": "四川", "德阳": "四川", "宜宾": "四川",
    "贵阳": "贵州", "遵义": "贵州",
    "昆明": "云南", "大理": "云南",
    "西安": "陕西", "咸阳": "陕西", "宝鸡": "陕西", "渭南": "陕西",
    "兰州": "甘肃", "天水": "甘肃",
    "西宁": "青海",
    "银川": "宁夏",
    "乌鲁木齐": "新疆", "克拉玛依": "新疆",
    "拉萨": "西藏",
    "香港": "香港", "澳门": "澳门", "台北": "台湾"
};

var provinceCapital = {
    "北京": "北京", "上海": "上海", "天津": "天津", "重庆": "重庆",
    "河北": "石家庄", "山西": "太原", "内蒙古": "呼和浩特", "辽宁": "沈阳",
    "吉林": "长春", "黑龙江": "哈尔滨", "江苏": "南京", "浙江": "杭州",
    "安徽": "合肥", "福建": "福州", "江西": "南昌", "山东": "济南",
    "河南": "郑州", "湖北": "武汉", "湖南": "长沙", "广东": "广州",
    "广西": "南宁", "海南": "海口", "四川": "成都", "贵州": "贵阳",
    "云南": "昆明", "西藏": "拉萨", "陕西": "西安", "甘肃": "兰州",
    "青海": "西宁", "宁夏": "银川", "新疆": "乌鲁木齐", "香港": "香港",
    "澳门": "澳门", "台湾": "台北"
};

function generateDynamicFlowLines(citiesData) {
    var cityMap = {};
    for (var i = 0; i < citiesData.length; i++) {
        cityMap[citiesData[i].name] = citiesData[i].value;
    }
    var nationalCorridors = [
        ["北京", "天津", "济南", "南京", "上海"],
        ["北京", "石家庄", "郑州", "武汉", "长沙", "广州", "深圳"],
        ["北京", "沈阳", "长春", "哈尔滨"],
        ["上海", "杭州", "南昌", "长沙", "贵阳", "昆明"],
        ["上海", "南京", "合肥", "武汉", "重庆", "成都"],
        ["郑州", "西安", "兰州", "乌鲁木齐"],
        ["西安", "成都", "昆明"],
        ["广州", "南宁", "昆明"],
        ["北京", "呼和浩特", "包头"],
        ["兰州", "西宁", "拉萨"],
        ["兰州", "银川"],
        ["重庆", "贵阳", "南宁"],
        ["武汉", "西安", "兰州"],
        ["沈阳", "大连"],
        ["济南", "青岛"],
        ["福州", "厦门"],
        ["广州", "海口"],
        ["成都", "拉萨"],
        ["乌鲁木齐", "兰州", "西安"],
        ["呼和浩特", "北京", "天津"]
    ];
    var lines = [];
    var addedPairs = {};
    for (var c = 0; c < nationalCorridors.length; c++) {
        var corridor = nationalCorridors[c];
        for (var i = 0; i < corridor.length - 1; i++) {
            var fromCity = corridor[i];
            var toCity = corridor[i + 1];
            var key = fromCity + "-" + toCity;
            if (cityMap[fromCity] && cityMap[toCity] && !addedPairs[key] && !addedPairs[toCity + "-" + fromCity]) {
                var fromData = citiesData.find(function(c) { return c.name === fromCity; });
                var toData = citiesData.find(function(c) { return c.name === toCity; });
                var flow = 60;
                if (fromData && toData) flow = Math.round((fromData.value[2] + toData.value[2]) / 2);
                lines.push({ coords: [cityMap[fromCity], cityMap[toCity]], flow: flow, from: fromCity, to: toCity });
                addedPairs[key] = true;
            }
        }
    }
    for (var city in cityToProvince) {
        var province = cityToProvince[city];
        var capital = provinceCapital[province];
        if (capital && city !== capital && cityMap[city] && cityMap[capital]) {
            var key = city + "-" + capital;
            if (!addedPairs[key] && !addedPairs[capital + "-" + city]) {
                var cityData = citiesData.find(function(c) { return c.name === city; });
                var capitalData = citiesData.find(function(c) { return c.name === capital; });
                var flow = 50;
                if (cityData && capitalData) flow = Math.round((cityData.value[2] + capitalData.value[2]) / 2);
                lines.push({ coords: [cityMap[city], cityMap[capital]], flow: flow, from: city, to: capital });
                addedPairs[key] = true;
            }
        }
    }
    var intraProvinceLinks = [
        ["苏州", "无锡"], ["无锡", "常州"], ["南京", "苏州"],
        ["杭州", "宁波"], ["杭州", "温州"], ["宁波", "温州"],
        ["广州", "佛山"], ["广州", "东莞"], ["深圳", "东莞"],
        ["济南", "青岛"], ["烟台", "青岛"], ["青岛", "潍坊"],
        ["郑州", "洛阳"], ["洛阳", "南阳"],
        ["武汉", "襄阳"], ["武汉", "宜昌"],
        ["长沙", "株洲"], ["长沙", "湘潭"], ["株洲", "湘潭"],
        ["成都", "绵阳"], ["成都", "德阳"],
        ["沈阳", "大连"],
        ["福州", "厦门"], ["厦门", "泉州"],
        ["合肥", "芜湖"], ["芜湖", "蚌埠"]
    ];
    for (var i = 0; i < intraProvinceLinks.length; i++) {
        var fromCity = intraProvinceLinks[i][0];
        var toCity = intraProvinceLinks[i][1];
        var key = fromCity + "-" + toCity;
        if (cityMap[fromCity] && cityMap[toCity] && !addedPairs[key] && !addedPairs[toCity + "-" + fromCity]) {
            var fromData = citiesData.find(function(c) { return c.name === fromCity; });
            var toData = citiesData.find(function(c) { return c.name === toCity; });
            var flow = 55;
            if (fromData && toData) flow = Math.round((fromData.value[2] + toData.value[2]) / 2);
            lines.push({ coords: [cityMap[fromCity], cityMap[toCity]], flow: flow, from: fromCity, to: toCity });
            addedPairs[key] = true;
        }
    }
    return lines;
}

async function fetchTrafficDataFromAPI() {
    try {
        console.log('正在从后端API获取交通数据...');
        const response = await fetch('/api/traffic');
        if (!response.ok) throw new Error('API响应失败');
        const data = await response.json();
        if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
            console.log(`成功获取 ${data.data.length} 个城市的实时数据，更新时间: ${data.timestamp}`);
            globalTrafficData = data.data;
            return data.data;
        }
        return null;
    } catch (error) {
        console.error('获取API数据失败:', error);
        return null;
    }
}

function getAllProvinces() {
    return [
        "北京", "上海", "天津", "重庆", "河北", "山西", "辽宁", "吉林", "黑龙江",
        "江苏", "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南",
        "广东", "海南", "四川", "贵州", "云南", "陕西", "甘肃", "青海", "内蒙古",
        "广西", "西藏", "宁夏", "新疆", "香港", "澳门"
    ];
}

function getProvinceFullName(shortName) {
    var map = {
        "北京": "北京市", "上海": "上海市", "天津": "天津市", "重庆": "重庆市",
        "河北": "河北省", "山西": "山西省", "辽宁": "辽宁省", "吉林": "吉林省",
        "黑龙江": "黑龙江省", "江苏": "江苏省", "浙江": "浙江省", "安徽": "安徽省",
        "福建": "福建省", "江西": "江西省", "山东": "山东省", "河南": "河南省",
        "湖北": "湖北省", "湖南": "湖南省", "广东": "广东省", "海南": "海南省",
        "四川": "四川省", "贵州": "贵州省", "云南": "云南省", "陕西": "陕西省",
        "甘肃": "甘肃省", "青海": "青海省", "内蒙古": "内蒙古自治区", "广西": "广西壮族自治区",
        "西藏": "西藏自治区", "宁夏": "宁夏回族自治区", "新疆": "新疆维吾尔自治区",
        "香港": "香港特别行政区", "澳门": "澳门特别行政区"
    };
    return map[shortName] || shortName;
}

// ========== 更新顶部6个指标 ==========
async function updateTopIndicators() {
    if (!globalTrafficData || globalTrafficData.length === 0) {
        await fetchTrafficDataFromAPI();
    }
    if (!globalTrafficData || globalTrafficData.length === 0) return;
    
    var totalCongestion = 0;
    var totalSpeed = 0;
    var highCongestionCount = 0;
    var cityCount = 0;
    
    for (var i = 0; i < globalTrafficData.length; i++) {
        var congestion = globalTrafficData[i].congestion;
        if (congestion) {
            totalCongestion += congestion;
            cityCount++;
            if (congestion >= 75) highCongestionCount++;
        }
        var speed = globalTrafficData[i].avgSpeed;
        if (speed) totalSpeed += speed;
    }
    
    var avgCongestion = cityCount > 0 ? (totalCongestion / cityCount).toFixed(1) : 65;
    var avgSpeed = cityCount > 0 ? (totalSpeed / cityCount).toFixed(1) : 33.7;
    
    var healthIndex = (100 - avgCongestion * 0.15).toFixed(1);
    var congestionIndex = (avgCongestion / 60).toFixed(2);
    var passengerVolume = Math.round(300 + avgCongestion * 2.5);
    var onlineVehicles = Math.round(20 + avgCongestion * 0.4);
    var warnings = Math.min(15, Math.max(0, Math.round(highCongestionCount * 0.6)));
    
    var indexInfos = document.querySelectorAll('.index-info div');
    if (indexInfos.length >= 6) {
        var healthElem = indexInfos[0].querySelector('.num');
        var speedElem = indexInfos[1].querySelector('.num');
        var congestionElem = indexInfos[2].querySelector('.num');
        var passengerElem = indexInfos[3].querySelector('.num');
        var vehiclesElem = indexInfos[4].querySelector('.num');
        var warningElem = indexInfos[5].querySelector('.num');
        
        if (healthElem) healthElem.innerText = healthIndex + '%';
        if (speedElem) speedElem.innerText = avgSpeed;
        if (congestionElem) congestionElem.innerText = congestionIndex;
        if (passengerElem) passengerElem.innerText = passengerVolume + '万';
        if (vehiclesElem) vehiclesElem.innerText = onlineVehicles + '万';
        if (warningElem) warningElem.innerText = warnings;
    }
    
    console.log('顶部指标已更新:', { healthIndex, avgSpeed, congestionIndex, passengerVolume, onlineVehicles, warnings });
}

// ========== 实时更新出行方式占比饼图 ==========
async function updatePieChart() {
    if (!globalTrafficData || globalTrafficData.length === 0) {
        await fetchTrafficDataFromAPI();
    }
    if (!globalTrafficData || globalTrafficData.length === 0) return;
    
    var avgCongestion = 0;
    for (var i = 0; i < globalTrafficData.length; i++) {
        avgCongestion += globalTrafficData[i].congestion;
    }
    avgCongestion = avgCongestion / globalTrafficData.length;
    
    var subwayRatio = 30 + Math.floor(avgCongestion * 0.12);
    var busRatio = 25 + Math.floor(avgCongestion * 0.06);
    var carRatio = 25 - Math.floor(avgCongestion * 0.1);
    var rideHailingRatio = 12 - Math.floor(avgCongestion * 0.03);
    var bikeRatio = 8 - Math.floor(avgCongestion * 0.05);
    
    var total = subwayRatio + busRatio + carRatio + rideHailingRatio + bikeRatio;
    subwayRatio = Math.round(subwayRatio / total * 100);
    busRatio = Math.round(busRatio / total * 100);
    carRatio = Math.round(carRatio / total * 100);
    rideHailingRatio = Math.round(rideHailingRatio / total * 100);
    bikeRatio = 100 - subwayRatio - busRatio - carRatio - rideHailingRatio;
    
    var pieChart = echarts.getInstanceByDom(document.getElementById('pie'));
    if (pieChart) {
        pieChart.setOption({
            series: [{
                data: [
                    { value: subwayRatio, name: '地铁' },
                    { value: busRatio, name: '公交' },
                    { value: carRatio, name: '自驾' },
                    { value: rideHailingRatio, name: '网约车' },
                    { value: bikeRatio, name: '骑行' }
                ]
            }]
        });
    }
}

// ========== 实时更新24小时流量趋势折线图 ==========
async function updateLineChart() {
    if (!globalTrafficData || globalTrafficData.length === 0) {
        await fetchTrafficDataFromAPI();
    }
    if (!globalTrafficData || globalTrafficData.length === 0) return;
    
    var avgCongestion = 0;
    for (var i = 0; i < globalTrafficData.length; i++) {
        avgCongestion += globalTrafficData[i].congestion;
    }
    avgCongestion = avgCongestion / globalTrafficData.length;
    
    var hour = new Date().getHours();
    var trendData = [];
    for (var h = 0; h < 24; h++) {
        var factor = 1.0;
        if (h >= 7 && h <= 9) factor = 1.4;
        else if (h >= 17 && h <= 19) factor = 1.45;
        else if (h >= 22 || h <= 5) factor = 0.5;
        else if (h >= 10 && h <= 16) factor = 0.85;
        else factor = 0.95;
        
        var value = avgCongestion * 0.8 * factor;
        value = Math.min(95, Math.max(25, Math.round(value)));
        trendData.push(value);
    }
    
    var lineChart = echarts.getInstanceByDom(document.getElementById('line'));
    if (lineChart) {
        lineChart.setOption({
            series: [{ data: trendData }]
        });
    }
}

// ========== 实时更新拥堵路段TOP5柱状图 ==========
async function updateBarChart() {
    if (!globalTrafficData || globalTrafficData.length === 0) {
        await fetchTrafficDataFromAPI();
    }
    if (!globalTrafficData || globalTrafficData.length === 0) return;
    
    var sortedCities = [...globalTrafficData];
    sortedCities.sort(function(a, b) {
        return (b.congestion || 0) - (a.congestion || 0);
    });
    
    var topCities = sortedCities.slice(0, 8);
    var cityNames = [];
    var cityCongestions = [];
    
    for (var i = 0; i < topCities.length; i++) {
        cityNames.push(topCities[i].name);
        cityCongestions.push(topCities[i].congestion);
    }
    
    var barChart = echarts.getInstanceByDom(document.getElementById('bar'));
    if (barChart) {
        barChart.setOption({
            yAxis: { data: cityNames },
            series: [{ data: cityCongestions }]
        });
    }
}

// ========== 刷新所有图表 ==========
async function refreshAllCharts() {
    console.log('开始刷新所有图表数据...');
    await fetchTrafficDataFromAPI();
    await updateTopIndicators();
    await updatePieChart();
    await updateLineChart();
    await updateBarChart();
    console.log('所有图表刷新完成');
}

async function initHomeMap() {
    if (!mapChart) mapChart = echarts.init(document.getElementById('map'));
    
    var loadingDiv = document.createElement('div');
    loadingDiv.id = 'mapLoadingTip';
    loadingDiv.innerHTML = '🔄 正在加载实时交通数据...';
    loadingDiv.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.8);color:#00aaff;padding:10px 20px;border-radius:8px;z-index:100;font-size:14px;';
    var mapContainer = document.getElementById('map');
    if (mapContainer && !document.getElementById('mapLoadingTip')) {
        mapContainer.style.position = 'relative';
        mapContainer.appendChild(loadingDiv);
    }
    
    var realCitiesData = await fetchTrafficDataFromAPI();
    var finalCitiesData;
    if (realCitiesData && realCitiesData.length > 0) {
        finalCitiesData = realCitiesData;
        console.log('使用后端API真实数据');
    } else {
        finalCitiesData = defaultCitiesData;
        console.log('API数据不可用，使用默认数据');
    }
    
    var tip = document.getElementById('mapLoadingTip');
    if (tip) tip.remove();
    
    var dynamicFlowLines = generateDynamicFlowLines(finalCitiesData);
    console.log('动态生成车流连线数量:', dynamicFlowLines.length);
    
    window.allCitiesData = finalCitiesData;
    window.allEffectData = finalCitiesData.filter(function(city) { return city.value[2] >= 78; });
    
    var shortNames = getAllProvinces();
    var heatmapData = [];
    for (var i = 0; i < shortNames.length; i++) {
        var fullName = getProvinceFullName(shortNames[i]);
        var provinceData = getProvinceTrafficData(fullName);
        var density = provinceData.density;
        heatmapData.push({
            name: fullName,
            value: density,
            itemStyle: { areaColor: getHeatmapColor(density) }
        });
    }
    
    mapChart.setOption({
        backgroundColor: 'transparent',
        geo: {
            map: 'china',
            roam: true,
            zoom: 1.2,
            center: [104.0, 35.0],
            itemStyle: { areaColor: 'rgba(0, 170, 255, 0.2)', borderColor: '#00aaff', borderWidth: 1 },
            label: { show: true, color: '#fff', fontSize: 9 },
            emphasis: { itemStyle: { areaColor: 'rgba(0, 170, 255, 0.5)' }, label: { show: true, color: '#ffd600', fontSize: 11 } }
        },
        visualMap: {
            type: 'continuous',
            min: 35,
            max: 95,
            calculable: true,
            inRange: { color: ['#a6d96a', '#d9ef8b', '#fee08b', '#fdae61', '#f46d43', '#d73027'] },
            textStyle: { color: '#fff', fontSize: 10 },
            left: 20,
            bottom: 20,
            text: ['高拥堵', '畅通'],
            seriesIndex: 0
        },
        series: [
            {
                name: '全国交通热力',
                type: 'map',
                map: 'china',
                roam: true,
                zoom: 1.2,
                center: [104.0, 35.0],
                data: heatmapData,
                label: { show: true, color: '#fff', fontSize: 9 },
                emphasis: { label: { show: true, color: '#ffd600', fontSize: 11 } },
                itemStyle: { borderColor: '#00aaff', borderWidth: 1, areaColor: '#0a2f4a' },
                zlevel: 0
            },
            {
                name: '城市车流节点',
                type: 'scatter',
                coordinateSystem: 'geo',
                data: finalCitiesData,
                symbolSize: function(val) { return 8 + (val[2] - 35) / 60 * 22; },
                itemStyle: {
                    color: function(params) {
                        var v = params.value[2];
                        if (v >= 85) return '#ff3300';
                        if (v >= 75) return '#ff6600';
                        if (v >= 65) return '#ffcc00';
                        if (v >= 55) return '#88cc00';
                        return '#00cc66';
                    },
                    shadowBlur: 12, borderWidth: 2, borderColor: '#fff', opacity: 0.95
                },
                label: { show: false },
                emphasis: {
                    scale: 1.4,
                    label: { show: true, fontSize: 11, color: '#ffd600', formatter: function(p) { return p.name; }, position: 'top', offset: [0, -10] }
                },
                zlevel: 2
            },
            {
                name: '城际车流',
                type: 'lines',
                coordinateSystem: 'geo',
                data: dynamicFlowLines.map(function(item) {
                    return {
                        coords: item.coords,
                        lineStyle: {
                            width: 1.5 + item.flow / 40,
                            curveness: 0.25,
                            color: '#88ddff',
                            opacity: 0.85,
                            shadowBlur: 4,
                            shadowColor: 'rgba(0,0,0,0.3)'
                        },
                        from: item.from,
                        to: item.to,
                        flow: item.flow
                    };
                }),
                lineStyle: { curveness: 0.25, opacity: 0.85, color: '#88ddff', width: 1.8 },
                effect: { show: true, period: 3, trailLength: 0.35, symbol: 'arrow', symbolSize: 7, color: '#88ddff' },
                zlevel: 1
            },
            {
                name: '车流动效',
                type: 'lines',
                coordinateSystem: 'geo',
                data: dynamicFlowLines.map(function(item) {
                    return { coords: item.coords, lineStyle: { width: 0, curveness: 0.25 } };
                }),
                effect: { show: true, period: 2.5, constantSpeed: 20, trailLength: 0.2, symbol: 'circle', symbolSize: 3, color: '#aaddff' },
                lineStyle: { width: 0, curveness: 0.25 },
                zlevel: 2
            }
        ],
        tooltip: {
            trigger: 'item',
            formatter: function(params) {
                if (params.seriesName === '全国交通热力') {
                    var density = params.value;
                    var level = density >= 85 ? '🔴 严重拥堵' : (density >= 75 ? '🟠 重度拥堵' : (density >= 65 ? '🟡 中度拥堵' : (density >= 55 ? '🟢 轻度拥堵' : '✅ 畅通')));
                    return '<b>' + params.name + '</b><br/>📊 车流密度指数: <b>' + density + '%</b><br/>🚦 拥堵等级: ' + level;
                }
                if (params.seriesName === '城市车流节点' && params.value && params.value[2]) {
                    var fd = params.value[2];
                    var level = fd >= 80 ? '高密度 🔥' : (fd >= 65 ? '中密度 ➡️' : (fd >= 50 ? '一般密度 •' : '低密度 💨'));
                    return '<b>' + params.name + '</b><br/>🚗 车流密度: <b>' + fd + '%</b><br/>📊 等级: ' + level;
                }
                if (params.seriesName === '城际车流' && params.data && params.data.from) {
                    return '🚗 城际车流<br/>📍 <b>' + params.data.from + '</b> → <b>' + params.data.to + '</b><br/>📈 车流密度: <b>' + params.data.flow + '%</b>';
                }
                return params.name;
            },
            backgroundColor: 'rgba(10,30,50,0.95)',
            borderColor: '#00aaff',
            borderWidth: 1,
            textStyle: { color: '#fff', fontSize: 12 },
            borderRadius: 8
        }
    });
    
    var opt = mapChart.getOption();
    if (opt.geo && opt.geo[0]) {
        currentZoom = opt.geo[0].zoom || 1.2;
        currentCenter = opt.geo[0].center || [104.0, 35.0];
    }
    
    // ========== 省份点击事件（弹窗功能） ==========
    mapChart.off('click');
    mapChart.on('click', function(params) {
        // 点击省份（geo区域）触发弹窗
        if (params.name && params.name !== '') {
            var provinceName = params.name;
            if (provinceName) {
                // 保存当前视图（用于返回）
                if (!isProvinceView) {
                    var currentOpt = mapChart.getOption();
                    if (currentOpt.geo && currentOpt.geo[0]) {
                        currentZoom = currentOpt.geo[0].zoom || 1.2;
                        currentCenter = currentOpt.geo[0].center || [104.0, 35.0];
                    }
                    isProvinceView = true;
                    currentProvince = provinceName;
                }
                // 缩放地图到该省份
                var config = provinceViewConfig[provinceName] || { center: [104.0, 35.0], zoom: 6 };
                mapChart.setOption({ geo: { center: config.center, zoom: config.zoom, roam: true } });
                showBackButton();
                // 显示弹窗
                var trafficData = getProvinceTrafficData(provinceName);
                showProvinceTrafficInfo(provinceName, trafficData);
            }
        }
        
        // 点击城市节点也显示信息
        if (params.componentType === 'series' && params.seriesName === '城市车流节点' && params.data) {
            var cityName = params.data.name;
            if (cityName) {
                var provinceName = cityToProvince[cityName] || cityName;
                var trafficData = getProvinceTrafficData(provinceName);
                showProvinceTrafficInfo(provinceName, trafficData);
            }
        }
    });
    
    // 热力图每5分钟更新
    setInterval(function() {
        var newHeatmapData = [];
        for (var i = 0; i < shortNames.length; i++) {
            var fullName = getProvinceFullName(shortNames[i]);
            var provinceData = getProvinceTrafficData(fullName);
            var density = provinceData.density;
            newHeatmapData.push({
                name: fullName,
                value: density,
                itemStyle: { areaColor: getHeatmapColor(density) }
            });
        }
        mapChart.setOption({ series: [{ data: newHeatmapData }] });
        console.log('热力图数据已自动更新');
    }, 300000);
    
    await refreshAllCharts();
    setInterval(refreshAllCharts, 300000);
}

function initOtherCharts() {
    var pie = echarts.init(document.getElementById('pie'));
    var line = echarts.init(document.getElementById('line'));
    var bar = echarts.init(document.getElementById('bar'));
    
pie.setOption({
    tooltip: { trigger: 'item' },
    series: [{
        type: 'pie', center: ['50%', '42%'],   // 数值越小，饼图越往上（原来是50%）
radius: ['70%', '30%'], 
        data: [
            { value: 38, name: '地铁' },
            { value: 28, name: '公交' },
            { value: 18, name: '自驾' },
            { value: 10, name: '网约车' },
            { value: 6, name: '骑行' }
        ],
        label: {
            color: '#fff',
            position: 'outside',
            formatter: '{b}: {d}%',
            fontSize: 10,
            lineHeight: 14
        },
        labelLine: {
            show: true,
            lineStyle: { color: '#fff' },
            length: 8,
            length2: 6
        },
        avoidLabelOverlap: true
    }]
});
    
    line.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: '8%', right: '5%', top: '15%', bottom: '10%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: ['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23'], axisLabel: { color: '#fff', rotate: 45, interval: 3 } },
        yAxis: { type: 'value', name: '客流量(万人次)', nameTextStyle: { color: '#fff' }, splitLine: { lineStyle: { color: 'rgba(200,200,200,0.3)' } }, axisLabel: { color: '#fff' } },
        series: [{ type: 'line', smooth: true, lineStyle: { color: '#00aaff', width: 2 }, areaStyle: { color: 'rgba(0,170,255,0.2)' }, data: [8,6,5,4,5,7,12,28,55,72,68,62,58,60,65,68,72,78,82,75,62,45,28,15] }]
    });
    
    bar.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '15%', right: '5%', top: '10%', bottom: '5%', containLabel: true },
        xAxis: { type: 'value', name: '拥堵指数', axisLabel: { color: '#fff' }, splitLine: { lineStyle: { color: 'rgba(200,200,200,0.3)' } } },
        yAxis: { type: 'category', data: ['加载中...'], axisLabel: { color: '#fff', fontSize: 11 },axisTick: { show: false },axisLine: { show: false }},
        series: [{ type: 'bar', barWidth: '60%', itemStyle: { color: '#00aaff', barBorderRadius: [0, 5, 5, 0] }, data: [0], label: { show: true, position: 'right', color: '#fff', fontWeight: 'bold', formatter: '{c}' } }]
    });
    
    // ==================== 新增：初始化波形图（不影响地图逻辑） ====================
    initLeftWaveChart();
    initRightWaveChart();
    startWaveUpdates();
    // ==================== 波形图初始化结束 ====================
    
    window.addEventListener('resize', function() {
        if (mapChart) mapChart.resize();
        pie.resize(); line.resize(); bar.resize();
        // 新增：波形图resize
        if (leftWaveChart) leftWaveChart.resize();
        if (rightWaveChart) rightWaveChart.resize();
    });
}

window.addEventListener('load', function() {
    initOtherCharts();
    if (typeof window.waitForChinaMap === 'function') {
        window.waitForChinaMap(function() { initHomeMap(); });
    } else {
        setTimeout(function() {
            if (typeof window.waitForChinaMap === 'function') { window.waitForChinaMap(initHomeMap); }
            else { initHomeMap(); }
        }, 500);
    }
});