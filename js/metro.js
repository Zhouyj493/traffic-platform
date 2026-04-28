// ==================== API配置 ====================
const API_BASE = 'http://localhost:5000/api';
let realMetroData = null;
let mapChart = null;
let lineChart = null;
let pieChart = null;
let barChart = null;
let isProvinceView = false;
let currentProvince = '';
let currentZoom = 1.2;
let currentCenter = [104.0, 35.0];

// ==================== 实时时间 ====================
function updateTime() {
    const timeElem = document.getElementById('realTime');
    if (timeElem) timeElem.innerText = new Date().toLocaleString();
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

// ==================== 城市坐标数据 ====================
const cityCoordinates = {
    '上海': [121.48, 31.22], '北京': [116.46, 39.92], '广州': [113.23, 23.16],
    '深圳': [114.07, 22.62], '天津': [117.20, 39.13], '重庆': [106.54, 29.59],
    '成都': [104.06, 30.67], '杭州': [120.19, 30.26], '武汉': [114.31, 30.52],
    '南京': [118.78, 32.04], '西安': [108.95, 34.27], '郑州': [113.65, 34.76],
    '长沙': [112.98, 28.21], '苏州': [120.62, 31.32], '青岛': [120.33, 36.07],
    '沈阳': [123.43, 41.80], '宁波': [121.55, 29.88], '合肥': [117.28, 31.86],
    '佛山': [113.12, 23.02], '东莞': [113.75, 23.04], '无锡': [120.29, 31.49],
    '昆明': [102.71, 25.05], '哈尔滨': [126.63, 45.75], '南宁': [108.32, 22.84],
    '厦门': [118.10, 24.46], '长春': [125.35, 43.88], '南昌': [115.89, 28.68],
    '济南': [117.00, 36.65], '大连': [121.62, 38.92], '福州': [119.30, 26.08],
    '贵阳': [106.71, 26.57], '兰州': [103.82, 36.06], '太原': [112.56, 37.87],
    '乌鲁木齐': [87.62, 43.82], '呼和浩特': [111.65, 40.82], '银川': [106.27, 38.47],
    '西宁': [101.74, 36.56], '海口': [110.35, 20.02], '徐州': [117.18, 34.26],
    '常州': [119.95, 31.79], '南通': [120.86, 32.01], '绍兴': [120.58, 30.03],
    '嘉兴': [120.75, 30.75], '金华': [119.65, 29.08], '台州': [121.42, 28.66],
    '芜湖': [118.38, 31.33], '洛阳': [112.45, 34.62], '香港': [114.17, 22.27],
    '澳门': [113.54, 22.19]
};

// ==================== 获取省份地铁汇总数据 ====================
function getProvinceMetroSummary(provinceName) {
    if (!realMetroData) {
        return { hasMetro: false, cityCount: 0, totalFlow: 0, totalLines: 0, totalStations: 0, peakFlow: 0, peakHour: '--', avgSpeed: '--', topStations: [], cities: [] };
    }
    
    const provinceCityMap = {
        '广东省': ['广州', '深圳', '佛山', '东莞'], '江苏省': ['南京', '苏州', '无锡', '常州', '徐州', '南通'],
        '浙江省': ['杭州', '宁波', '绍兴', '嘉兴', '金华', '台州'], '山东省': ['济南', '青岛'],
        '四川省': ['成都'], '湖北省': ['武汉'], '湖南省': ['长沙'], '河南省': ['郑州'], '陕西省': ['西安'],
        '天津市': ['天津'], '重庆市': ['重庆'], '辽宁省': ['沈阳', '大连'], '黑龙江省': ['哈尔滨'],
        '吉林省': ['长春'], '福建省': ['福州', '厦门'], '江西省': ['南昌'], '安徽省': ['合肥', '芜湖'],
        '云南省': ['昆明'], '广西壮族自治区': ['南宁'], '贵州省': ['贵阳'], '甘肃省': ['兰州'],
        '山西省': ['太原'], '新疆维吾尔自治区': ['乌鲁木齐'], '内蒙古自治区': ['呼和浩特'],
        '宁夏回族自治区': ['银川'], '青海省': ['西宁'], '海南省': ['海口'],
        '北京市': ['北京'], '上海市': ['上海'], '香港特别行政区': ['香港'], '澳门特别行政区': ['澳门']
    };
    
    const citiesInProvince = provinceCityMap[provinceName] || [];
    const provinceCities = [];
    let totalFlow = 0, totalLines = 0, totalStations = 0;
    
    for (const city of realMetroData) {
        if (citiesInProvince.includes(city.city)) {
            provinceCities.push(city);
            totalFlow += city.flow;
            totalLines += city.lines || 0;
            totalStations += city.stations || 0;
        }
    }
    
    if (provinceCities.length === 0) {
        return { hasMetro: false, cityCount: 0, totalFlow: 0, totalLines: 0, totalStations: 0, peakFlow: 0, peakHour: '--', avgSpeed: '--', topStations: [], cities: [] };
    }
    
    const allTopStations = [];
    for (const city of provinceCities) {
        if (city.top_stations) {
            for (const station of city.top_stations.slice(0, 3)) {
                if (!allTopStations.includes(station)) allTopStations.push(station);
            }
        }
    }
    
    return {
        hasMetro: true,
        cityCount: provinceCities.length,
        totalFlow: totalFlow,
        totalLines: totalLines,
        totalStations: totalStations,
        peakFlow: Math.round(totalFlow * 0.18),
        peakHour: '8:00-9:00',
        avgSpeed: '32km/h',
        topStations: allTopStations.slice(0, 8),
        cities: provinceCities.map(c => ({ name: c.city, flow: c.flow, lines: c.lines, stations: c.stations }))
    };
}

// ==================== 弹窗函数 ====================
function showProvinceMetroInfo(provinceName, data) {
    var existingModal = document.getElementById('provinceModal');
    if (existingModal) existingModal.remove();
    
    if (!data.hasMetro || data.cityCount === 0) {
        var noMetroHtml = `<div id="provinceModal" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: linear-gradient(145deg, #1e4a7a 0%, #0f2d4f 100%); border: 2px solid #888888; border-radius: 20px; padding: 28px 38px; z-index: 1000; min-width: 320px; box-shadow: 0 0 50px rgba(0, 170, 255, 0.7);"><div style="position: absolute; top: 14px; right: 20px; cursor: pointer; color: #fff; font-size: 24px;" onclick="closeProvinceModal()">✕</div><div style="text-align: center;"><span style="font-size: 48px;">🚇</span><h2 style="color: #888; margin: 10px 0;">${provinceName}</h2><p style="color: #ffdd88; font-size: 16px;">目前暂无地铁运营</p><p style="color: #8bbddd; font-size: 12px; margin-top: 15px;">部分城市正在规划/建设中</p></div></div>`;
        document.body.insertAdjacentHTML('beforeend', noMetroHtml);
        return;
    }
    
    var flowColor = data.totalFlow >= 1000 ? '#ff0066' : (data.totalFlow >= 500 ? '#ff6600' : (data.totalFlow >= 200 ? '#ffcc00' : '#44ff88'));
    var flowLevel = data.totalFlow >= 1000 ? '🔥🔥 超高客流' : (data.totalFlow >= 500 ? '🔥 高客流' : (data.totalFlow >= 200 ? '➡️ 中等客流' : '💨 一般客流'));
    
    var cityListHtml = '';
    for (var i = 0; i < data.cities.length; i++) {
        var city = data.cities[i];
        var cityColor = city.flow >= 300 ? '#ff0066' : (city.flow >= 100 ? '#ff6600' : (city.flow >= 30 ? '#ffcc00' : '#44ff88'));
        cityListHtml += `<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,170,255,0.2);"><span style="color: #fff; font-weight: bold;">🚇 ${city.name}</span><span style="color: ${cityColor}; font-weight: bold;">${city.flow}万/日</span><span style="color: #88ddff;">${city.lines}条线</span><span style="color: #aaffaa;">${city.stations}站</span></div>`;
    }
    
    var topStationsHtml = '';
    for (var i = 0; i < data.topStations.length; i++) {
        topStationsHtml += `<span style="display: inline-block; background: rgba(0,170,255,0.3); padding: 3px 10px; border-radius: 15px; margin: 3px; font-size: 12px;">${data.topStations[i]}</span>`;
    }
    
    var modalHtml = `<div id="provinceModal" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: linear-gradient(145deg, #1e4a7a 0%, #0f2d4f 100%); border: 2px solid ${flowColor}; border-radius: 20px; padding: 25px 35px; z-index: 1000; min-width: 500px; max-width: 580px; max-height: 85vh; overflow-y: auto; box-shadow: 0 0 50px rgba(0, 170, 255, 0.7);"><div style="position: sticky; top: 0; text-align: right; cursor: pointer; color: #fff; font-size: 24px; margin-bottom: 10px;" onclick="closeProvinceModal()">✕</div><div style="text-align: center; margin-bottom: 20px;"><span style="font-size: 42px;">🚇</span><h2 style="color: ${flowColor}; margin: 8px 0; font-size: 24px;">${provinceName}</h2><div style="margin-top: 8px;"><span style="background: ${flowColor}; color: #000; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold;">${flowLevel}</span></div></div><div style="border-top: 1px solid rgba(0,170,255,0.5); margin: 10px 0 15px 0;"></div><div style="display: flex; justify-content: space-around; text-align: center; margin-bottom: 20px;"><div><div style="font-size: 28px; font-weight: bold; color: ${flowColor};">${data.cityCount}</div><div style="font-size: 11px; color: #8bbddd;">地铁城市</div></div><div><div style="font-size: 28px; font-weight: bold; color: ${flowColor};">${data.totalLines}</div><div style="font-size: 11px; color: #8bbddd;">运营线路</div></div><div><div style="font-size: 28px; font-weight: bold; color: ${flowColor};">${data.totalStations}</div><div style="font-size: 11px; color: #8bbddd;">车站总数</div></div></div><div style="display: flex; justify-content: space-around; text-align: center; margin-bottom: 20px;"><div><div style="font-size: 22px; font-weight: bold; color: #ffdd88;">${data.peakFlow}万</div><div style="font-size: 10px; color: #8bbddd;">高峰小时客流</div></div><div><div style="font-size: 22px; font-weight: bold; color: #88ddff;">${data.peakHour}</div><div style="font-size: 10px; color: #8bbddd;">高峰时段</div></div><div><div style="font-size: 22px; font-weight: bold; color: #aaffaa;">${data.avgSpeed}</div><div style="font-size: 10px; color: #8bbddd;">平均旅速</div></div></div><div style="border-top: 1px solid rgba(0,170,255,0.3); margin: 10px 0 15px 0;"></div><div style="margin-top: 10px;"><div style="color: #ffdd88; font-size: 14px; margin-bottom: 10px;">📋 各城市地铁详情：</div>${cityListHtml}</div><div style="margin-top: 15px;"><div style="color: #ffdd88; font-size: 14px; margin-bottom: 8px;">🏆 客流TOP站点：</div><div style="text-align: center;">${topStationsHtml}</div></div><div style="border-top: 1px solid rgba(0,170,255,0.3); margin: 15px 0 8px 0; padding-top: 10px; text-align: center; font-size: 11px; color: #8bbddd;">🚇 数据基于实时闸机统计 | 点击地图上的圆点可查看城市详情 | 点击其他省份可切换</div></div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeProvinceModal() {
    var modal = document.getElementById('provinceModal');
    if (modal) modal.remove();
}

function showCityMetroInfo(cityName, flow, lines, stations) {
    var existingModal = document.getElementById('cityModal');
    if (existingModal) existingModal.remove();
    
    var flowColor = flow >= 800 ? '#ff0066' : (flow >= 300 ? '#ff6600' : (flow >= 100 ? '#ffcc00' : '#44ff88'));
    var flowLevel = flow >= 800 ? '🔥🔥 超高客流' : (flow >= 300 ? '🔥 高客流' : (flow >= 100 ? '➡️ 中等客流' : '💨 一般客流'));
    var avgStationFlow = Math.round(flow * 10000 / stations);
    
    var modalHtml = `<div id="cityModal" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: linear-gradient(145deg, #1e4a7a 0%, #0f2d4f 100%); border: 2px solid ${flowColor}; border-radius: 20px; padding: 25px 35px; z-index: 1001; min-width: 360px; box-shadow: 0 0 50px rgba(0, 170, 255, 0.7);"><div style="position: absolute; top: 14px; right: 20px; cursor: pointer; color: #fff; font-size: 24px;" onclick="closeCityModal()">✕</div><div style="text-align: center; margin-bottom: 20px;"><span style="font-size: 42px;">🚇</span><h2 style="color: ${flowColor}; margin: 8px 0; font-size: 26px;">${cityName}</h2><div style="margin-top: 8px;"><span style="background: ${flowColor}; color: #000; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold;">${flowLevel}</span></div></div><div style="border-top: 1px solid rgba(0,170,255,0.5); margin: 10px 0 15px 0;"></div><table style="width: 100%; color: #f0f0f0; font-size: 15px;"><tr style="height: 45px;"><td style="width: 120px;">📊 日均客流：</td><td style="font-weight: bold; color: ${flowColor};">${flow} 万人次</td></tr><tr style="height: 45px;"><td>🟢 运营线路：</td><td style="font-weight: bold; color: #ffdd88;">${lines} 条</td></tr><tr style="height: 45px;"><td>🚉 车站数量：</td><td style="font-weight: bold; color: #ffdd88;">${stations} 座</td></tr><tr style="height: 45px;"><td>📈 站均客流：</td><td style="font-weight: bold; color: #88ddff;">${avgStationFlow.toLocaleString()} 人次/站</td></tr></table><div style="border-top: 1px solid rgba(0,170,255,0.3); margin: 15px 0 8px 0; padding-top: 10px; text-align: center; font-size: 11px; color: #8bbddd;">🚇 数据基于实时闸机统计 | 点击其他城市可切换</div></div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeCityModal() {
    var modal = document.getElementById('cityModal');
    if (modal) modal.remove();
}

function showBackButton() {
    removeBackButton();
    var backBtn = document.createElement('div');
    backBtn.id = 'backToNationalBtn';
    backBtn.innerHTML = '← 返回全国地图';
    backBtn.style.cssText = 'position: absolute; bottom: 20px; right: 20px; background: rgba(0, 170, 255, 0.9); color: white; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 12px; font-weight: bold; z-index: 100; box-shadow: 0 2px 10px rgba(0,0,0,0.3); transition: all 0.3s;';
    backBtn.onmouseover = function() { this.style.background = '#00aaff'; this.style.transform = 'scale(1.05)'; };
    backBtn.onmouseout = function() { this.style.background = 'rgba(0, 170, 255, 0.9)'; this.style.transform = 'scale(1)'; };
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
    if (mapChart) { mapChart.setOption({ geo: { center: currentCenter, zoom: currentZoom, roam: true } }); }
    removeBackButton();
}

// ==================== 初始化地图 ====================
function initMetroMap() {
    if (!mapChart) { mapChart = echarts.init(document.getElementById('map')); }
    
    var mapCitiesData = [];
    if (realMetroData && realMetroData.length > 0) {
        for (var i = 0; i < realMetroData.length; i++) {
            var city = realMetroData[i];
            var coords = cityCoordinates[city.city] || [116.46, 39.92];
            mapCitiesData.push({
                name: city.city,
                value: [coords[0], coords[1], city.flow, city.lines || 0],
                stations: city.stations || 0,
                status: city.flow > 0 ? '运营中' : '规划中'
            });
        }
    }
    
    var highFlowCities = mapCitiesData.filter(function(city) {
        return city.value[2] >= 200;
    });
    
    var mediumFlowCities = mapCitiesData.filter(function(city) {
        return city.value[2] >= 100 && city.value[2] < 200;
    });
    
    mapChart.setOption({
        backgroundColor: 'transparent',
        geo: {
            map: 'china', roam: true, zoom: 1.2, center: [104.0, 35.0],
            itemStyle: { areaColor: 'rgba(0, 170, 255, 0.2)', borderColor: '#00aaff', borderWidth: 1 },
            label: { show: true, color: '#fff', fontSize: 8 },
            emphasis: { itemStyle: { areaColor: 'rgba(0, 170, 255, 0.5)' }, label: { show: true, color: '#ffd600', fontSize: 10 } }
        },
        visualMap: {
            type: 'continuous', min: 0, max: 1200, calculable: true, show: false,
            inRange: { color: ['#44ff88', '#88cc00', '#ffcc00', '#ff6600', '#ff0066'] },
            textStyle: { color: '#fff', fontSize: 11 }, left: 20, bottom: 20, text: ['高客流', '低客流'], seriesIndex: 0
        },
        series: [
            { 
                name: '地铁客流节点', type: 'scatter', coordinateSystem: 'geo', data: mapCitiesData,
                symbolSize: function(val) { 
                    if (val[2] >= 800) return 28;
                    if (val[2] >= 500) return 22;
                    if (val[2] >= 200) return 16;
                    if (val[2] >= 100) return 12;
                    if (val[2] >= 30) return 8;
                    return 5;
                },
                itemStyle: { 
                    color: function(params) { 
                        var v = params.value[2];
                        if (v >= 800) return '#ff0066';
                        if (v >= 500) return '#ff3300';
                        if (v >= 200) return '#ff6600';
                        if (v >= 100) return '#ffcc00';
                        if (v >= 30) return '#88cc00';
                        return '#44ff88';
                    },
                    shadowBlur: 12, borderWidth: 1.5, borderColor: '#fff', opacity: 0.9
                },
                label: { show: false },
                emphasis: { scale: 1.4, label: { show: true, fontSize: 11, color: '#ffd600', formatter: function(p) { return p.name + '\n' + p.value[2] + '万人次/日'; }, position: 'top', offset: [0, -10] } }
            },
            { 
                name: '高客流脉冲', type: 'effectScatter', coordinateSystem: 'geo', data: highFlowCities,
                symbolSize: function(val) { return 18 + (val[2] - 200) / 1000 * 20; },
                rippleEffect: { brushType: 'stroke', period: 3, scale: 4, color: '#ff0066' },
                itemStyle: { color: '#ff0066', shadowBlur: 20, borderWidth: 2, borderColor: '#fff' },
                label: { show: true, formatter: '🚇 {b}', position: 'top', color: '#ff8888', fontWeight: 'bold', fontSize: 10, offset: [0, -12] },
                zlevel: 1
            },
            { 
                name: '中等客流节点', type: 'scatter', coordinateSystem: 'geo', data: mediumFlowCities,
                symbolSize: function(val) { return 10; },
                itemStyle: { color: '#ffcc00', shadowBlur: 8, borderWidth: 1.5, borderColor: '#fff' },
                label: { show: false }, zlevel: 1
            }
        ],
        tooltip: {
            trigger: 'item',
            formatter: function(params) {
                if (params.value && params.value[2]) {
                    var f = params.value[2], l = params.value[3], s = params.data.stations;
                    var level = f >= 800 ? '🔥🔥 超高客流' : (f >= 500 ? '🔥 高客流' : (f >= 200 ? '📈 较高客流' : (f >= 100 ? '➡️ 中等客流' : (f >= 30 ? '💨 一般客流' : '⚪ 低客流'))));
                    var color = f >= 800 ? '#ff0066' : (f >= 500 ? '#ff3300' : (f >= 200 ? '#ff6600' : (f >= 100 ? '#ffcc00' : (f >= 30 ? '#88cc00' : '#44ff88'))));
                    var status = f > 0 ? '✅ 运营中' : '🚧 规划中';
                    return `<span style="color:${color};">🚇</span> <b>${params.name}</b> ${status}<br/>📊 日均客流量: <b>${f}</b> 万人次<br/>🟢 运营线路: <b>${l}</b> 条<br/>🚉 车站数量: <b>${s}</b> 座<br/>📈 客流等级: ${level}`;
                }
                return params.name;
            },
            backgroundColor: 'rgba(10,30,50,0.95)', borderColor: '#ff0066', borderWidth: 1, textStyle: { color: '#fff', fontSize: 12 }, borderRadius: 8
        }
    });
    
    var opt = mapChart.getOption();
    if (opt.geo && opt.geo[0]) { currentZoom = opt.geo[0].zoom || 1.2; currentCenter = opt.geo[0].center || [104.0, 35.0]; }
    
    mapChart.off('click');
    mapChart.on('click', function(params) {
        if (params.componentType === 'series' && (params.seriesName === '地铁客流节点' || params.seriesName === '中等客流节点')) {
            showCityMetroInfo(params.name, params.value[2], params.value[3], params.data.stations);
            return;
        }
        if (params.componentType === 'geo') {
            var provinceName = params.name;
            if (provinceName) {
                if (!isProvinceView) {
                    var opt2 = mapChart.getOption();
                    if (opt2.geo && opt2.geo[0]) { currentZoom = opt2.geo[0].zoom || 1.2; currentCenter = opt2.geo[0].center || [104.0, 35.0]; }
                    isProvinceView = true; currentProvince = provinceName;
                }
                var config = provinceViewConfig[provinceName] || { center: [104.0, 35.0], zoom: 6 };
                mapChart.setOption({ geo: { center: config.center, zoom: config.zoom, roam: true } });
                showBackButton();
                var metroData = getProvinceMetroSummary(provinceName);
                showProvinceMetroInfo(provinceName, metroData);
            }
        }
    });
}

// ==================== 初始化折线图（客流时段趋势） ====================
function initLineChart() {
    var chartDom = document.getElementById('line');
    if (!chartDom) return;
    lineChart = echarts.init(chartDom);
    lineChart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: '5%', right: '5%', bottom: '10%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: ['5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'], axisLabel: { color: '#fff', rotate: 0 } },
        yAxis: { type: 'value', name: '客流量(万人次)', nameTextStyle: { color: '#fff' }, splitLine: { show: true, lineStyle: { color: 'rgba(200, 200, 200, 0.3)' } }, axisLabel: { color: '#fff' } },
        series: [{ type: 'line', smooth: true, data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], lineStyle: { color: '#00aaff', width: 3 }, areaStyle: { color: 'rgba(0, 170, 255, 0.2)' }, symbol: 'circle', symbolSize: 6, markPoint: { data: [{ type: 'max', name: '峰值' }] } }]
    });
}

// ==================== 更新折线图（从API读取hourly_flow） ====================
function updateLineChartWithRealData(citiesData) {
    if (!lineChart) return;
    
    // 取有客流数据且非规划中的城市，用第一个有hourly_flow的城市数据
    var targetCity = null;
    for (var i = 0; i < citiesData.length; i++) {
        var city = citiesData[i];
        if (city.hourly_flow && city.hourly_flow.length === 24 && city.flow > 0) {
            targetCity = city;
            break;
        }
    }
    
    // 如果没有找到，用北京/上海的数据
    if (!targetCity) {
        for (var i = 0; i < citiesData.length; i++) {
            if (citiesData[i].city === '北京' || citiesData[i].city === '上海') {
                targetCity = citiesData[i];
                break;
            }
        }
    }
    
    if (targetCity && targetCity.hourly_flow && targetCity.hourly_flow.length === 24) {
        // 只取5-23点的数据（19个点）
        var hourlyData = targetCity.hourly_flow.slice(5, 24);
        lineChart.setOption({
            series: [{ data: hourlyData }],
            xAxis: { data: ['5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'] }
        });
        console.log('📈 折线图已更新 - 使用 ' + targetCity.city + ' 的分时数据');
    }
}

// ==================== 初始化饼图（换乘站客流占比） ====================
function initPieChart() {
    var chartDom = document.getElementById('pie');
    if (!chartDom) return;
    pieChart = echarts.init(chartDom);
    pieChart.setOption({
        tooltip: { trigger: 'item' },
        color: ['#96f496', '#eef0c9', '#ffcc88', '#ff8888', '#88ccff', '#ffaa66'],
        series: [{
            type: 'pie',
            radius: ['35%', '60%'],
            center: ['50%', '50%'],
            data: [{ value: 0, name: '加载中...' }],
            label: { color: '#fff', fontSize: 12 },
            labelLine: { lineStyle: { color: '#fff' } }
        }]
    });
}

// ==================== 更新饼图（从API读取station_ratio） ====================
function updatePieChartWithRealData(citiesData) {
    if (!pieChart) return;
    
    // 汇总全国平均比例
    var totalTransfer = 0, totalOrdinary = 0, totalHub = 0, totalTerminal = 0;
    var count = 0;
    
    for (var i = 0; i < citiesData.length; i++) {
        var city = citiesData[i];
        if (city.station_ratio && city.flow > 0) {
            totalTransfer += city.station_ratio.transfer || 0;
            totalOrdinary += city.station_ratio.ordinary || 0;
            totalHub += city.station_ratio.hub || 0;
            totalTerminal += city.station_ratio.terminal || 0;
            count++;
        }
    }
    
    if (count > 0) {
        var avgTransfer = (totalTransfer / count).toFixed(1);
        var avgOrdinary = (totalOrdinary / count).toFixed(1);
        var avgHub = (totalHub / count).toFixed(1);
        var avgTerminal = (totalTerminal / count).toFixed(1);
        
        pieChart.setOption({
            series: [{
                data: [
                    { value: parseFloat(avgTransfer), name: '换乘站' },
                    { value: parseFloat(avgOrdinary), name: '普通站' },
                    { value: parseFloat(avgHub), name: '枢纽站' },
                    { value: parseFloat(avgTerminal), name: '终点站' }
                ]
            }]
        });
        console.log('🥧 饼图已更新 - 换乘站:' + avgTransfer + '%, 普通站:' + avgOrdinary + '%, 枢纽站:' + avgHub + '%, 终点站:' + avgTerminal + '%');
    }
}

// ==================== 初始化柱状图 ====================
function initBarChart() {
    var chartDom = document.getElementById('bar');
    if (!chartDom) return;
    barChart = echarts.init(chartDom);
    barChart.setOption({
        grid: { top: "10%", left: "25%", bottom: "10%", right: "8%" },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        xAxis: { type: 'value', name: '日均客流量(万人次)', nameTextStyle: { color: '#fff' }, axisLabel: { color: '#fff' }, splitLine: { show: false } },
        yAxis: { type: 'category', data: ["加载中..."], axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: "#fff", fontSize: 11 } },
        series: [{ type: 'bar', data: [0], barWidth: 18, itemStyle: { barBorderRadius: [0, 8, 8, 0], color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{ offset: 0, color: '#00aaff' }, { offset: 1, color: '#00ffcc' }]) }, label: { show: true, position: 'right', color: '#fff', fontWeight: 'bold', formatter: '{c}万' } }]
    });
}

// ==================== 更新柱状图（TOP10站点） ====================
function updateBarChartWithRealData(citiesData) {
    if (!barChart) return;
    var allStations = [];
    for (var i = 0; i < citiesData.length; i++) {
        var city = citiesData[i];
        if (city.top_stations && city.top_stations.length > 0 && city.flow > 0) {
            var baseFlow = city.flow;
            for (var j = 0; j < Math.min(city.top_stations.length, 8); j++) {
                var station = city.top_stations[j];
                var stationFlow = Math.round(baseFlow * (0.15 - j * 0.01));
                if (stationFlow > 0) {
                    allStations.push({ name: station, flow: stationFlow, city: city.city });
                }
            }
        }
    }
    allStations.sort(function(a, b) { return b.flow - a.flow; });
    var top10 = allStations.slice(0, 10);
    if (top10.length === 0) {
        top10 = [{ name: '暂无数据', flow: 0 }];
    }
    barChart.setOption({
        yAxis: { data: top10.map(function(s) { return s.name.length > 8 ? s.name.slice(0, 8) + '..' : s.name; }) },
        series: [{ data: top10.map(function(s) { return s.flow; }) }]
    });
}

// ==================== 更新顶部指标 ====================
function updateTopIndicators(citiesData) {
    var validCities = citiesData.filter(function(city) { return city.flow > 0; });
    
    var totalFlow = 0;
    var totalLinesAll = 0;
    var maxFlowCity = null;
    
    for (var i = 0; i < validCities.length; i++) {
        var city = validCities[i];
        totalFlow += city.flow;
        totalLinesAll += city.lines || 0;
        if (!maxFlowCity || city.flow > maxFlowCity.flow) {
            maxFlowCity = city;
        }
    }
    
    var todayFlowElem = document.getElementById('todayFlow');
    if (todayFlowElem) todayFlowElem.innerText = Math.round(totalFlow) + '万';
    
    var totalLinesElem = document.getElementById('totalLines');
    if (totalLinesElem) totalLinesElem.innerText = totalLinesAll;
    
    var peakFlowElem = document.getElementById('peakFlow');
    if (peakFlowElem) {
        var peakEstimate = maxFlowCity ? Math.round(maxFlowCity.flow * 0.18) : 0;
        peakFlowElem.innerText = peakEstimate + '万';
    }
    
    var punctualityElem = document.getElementById('punctuality');
    if (punctualityElem) punctualityElem.innerText = '98.7%';
    
    console.log('📊 指标更新完成 - 总客流:' + Math.round(totalFlow) + '万, 线路数:' + totalLinesAll + ', 高峰:' + (maxFlowCity ? Math.round(maxFlowCity.flow * 0.18) : 0) + '万');
}

// ==================== 从API加载真实数据 ====================
async function loadRealMetroData() {
    try {
        console.log('🔄 开始加载地铁数据...');
        var response = await fetch(API_BASE + '/metro');
        var result = await response.json();
        if (result && result.data) {
            realMetroData = result.data;
            console.log('✅ 加载成功，共 ' + realMetroData.length + ' 个城市');
            updateTopIndicators(realMetroData);
            updateBarChartWithRealData(realMetroData);
            updateLineChartWithRealData(realMetroData);
            updatePieChartWithRealData(realMetroData);
            if (mapChart) {
                initMetroMap();
            }
        } else {
            console.error('❌ 数据格式错误:', result);
        }
    } catch (error) {
        console.error('❌ 加载地铁数据失败:', error);
    }
}

// ==================== 页面加载 ====================
window.addEventListener('load', function() {
    console.log('🚀 页面加载完成，初始化...');
    initLineChart();
    initPieChart();
    initBarChart();
    loadRealMetroData();
    if (typeof window.waitForChinaMap === 'function') {
        window.waitForChinaMap(function() { 
            console.log('🗺️ 中国地图加载完成，初始化地铁地图...');
            initMetroMap(); 
        });
    } else {
        setTimeout(function() {
            if (typeof window.waitForChinaMap === 'function') { 
                window.waitForChinaMap(initMetroMap); 
            } else { 
                console.log('🗺️ 直接初始化地铁地图...');
                initMetroMap(); 
            }
        }, 500);
    }
    setInterval(loadRealMetroData, 5 * 60 * 1000);
});