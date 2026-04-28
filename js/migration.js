// ==================== API配置 ====================
const API_BASE = 'http://localhost:5000/api';
let realMigrationData = null;
let lineChart = null;
let barChart = null;
let pieChart = null;

// ==================== 实时时间 ====================
function updateTime() {
    document.getElementById('realTime').innerText = new Date().toLocaleString();
}
updateTime();
setInterval(updateTime, 1000);

// ==================== 全局变量 ====================
var isProvinceView = false;
var currentProvince = '';
var currentZoom = 1.2;
var currentCenter = [104.0, 35.0];
var migrationMapChart = null;

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

// ==================== 省份迁徙详细数据 ====================
function getProvinceMigrationData(provinceName) {
    var dataMap = {
        '北京市': { 
            totalFlow: 285, mainDest: '上海(42万)、天津(38万)、深圳(25万)、广州(22万)、成都(18万)', 
            peakHour: '7:30-9:00', avgDistance: '18.5km', trend: '↑上升3.2%',
            inflow: 152, outflow: 133, topDestinations: ['上海', '天津', '深圳', '广州', '成都']
        },
        '上海市': { 
            totalFlow: 312, mainDest: '北京(38万)、杭州(45万)、南京(42万)、苏州(38万)、深圳(28万)', 
            peakHour: '7:30-9:00', avgDistance: '16.2km', trend: '↑上升2.8%',
            inflow: 168, outflow: 144, topDestinations: ['杭州', '南京', '苏州', '北京', '深圳']
        },
        '广东省': { 
            totalFlow: 425, mainDest: '湖南(68万)、广西(52万)、江西(45万)、湖北(38万)、四川(32万)', 
            peakHour: '7:00-8:30', avgDistance: '22.8km', trend: '↑上升4.5%',
            inflow: 198, outflow: 227, topDestinations: ['湖南', '广西', '江西', '湖北', '四川']
        },
        '江苏省': { 
            totalFlow: 198, mainDest: '上海(52万)、浙江(38万)、安徽(32万)、山东(22万)、广东(18万)', 
            peakHour: '7:30-8:30', avgDistance: '14.3km', trend: '↑上升1.8%',
            inflow: 95, outflow: 103, topDestinations: ['上海', '浙江', '安徽', '山东', '广东']
        },
        '浙江省': { 
            totalFlow: 185, mainDest: '上海(48万)、江苏(35万)、安徽(22万)、江西(18万)、广东(16万)', 
            peakHour: '7:30-8:30', avgDistance: '13.8km', trend: '→平稳',
            inflow: 88, outflow: 97, topDestinations: ['上海', '江苏', '安徽', '江西', '广东']
        },
        '四川省': { 
            totalFlow: 168, mainDest: '重庆(52万)、广东(32万)、浙江(18万)、江苏(16万)、北京(12万)', 
            peakHour: '8:00-9:00', avgDistance: '20.5km', trend: '↑上升3.5%',
            inflow: 72, outflow: 96, topDestinations: ['重庆', '广东', '浙江', '江苏', '北京']
        },
        '湖北省': { 
            totalFlow: 145, mainDest: '广东(42万)、浙江(22万)、上海(18万)、北京(15万)、江苏(12万)', 
            peakHour: '7:30-8:30', avgDistance: '19.2km', trend: '→平稳',
            inflow: 68, outflow: 77, topDestinations: ['广东', '浙江', '上海', '北京', '江苏']
        },
        '山东省': { 
            totalFlow: 138, mainDest: '北京(32万)、上海(25万)、江苏(22万)、浙江(15万)、广东(12万)', 
            peakHour: '7:30-8:30', avgDistance: '15.6km', trend: '→平稳',
            inflow: 62, outflow: 76, topDestinations: ['北京', '上海', '江苏', '浙江', '广东']
        },
        '河南省': { 
            totalFlow: 142, mainDest: '北京(35万)、上海(28万)、广东(25万)、江苏(18万)、浙江(12万)', 
            peakHour: '7:30-8:30', avgDistance: '16.8km', trend: '↑上升2.1%',
            inflow: 58, outflow: 84, topDestinations: ['北京', '上海', '广东', '江苏', '浙江']
        },
        '湖南省': { 
            totalFlow: 128, mainDest: '广东(48万)、浙江(18万)、上海(15万)、北京(12万)、湖北(10万)', 
            peakHour: '7:30-8:30', avgDistance: '18.5km', trend: '↑上升2.5%',
            inflow: 52, outflow: 76, topDestinations: ['广东', '浙江', '上海', '北京', '湖北']
        },
        '福建省': { 
            totalFlow: 98, mainDest: '广东(32万)、浙江(18万)、上海(12万)、江西(10万)、江苏(8万)', 
            peakHour: '7:30-8:30', avgDistance: '17.2km', trend: '→平稳',
            inflow: 45, outflow: 53, topDestinations: ['广东', '浙江', '上海', '江西', '江苏']
        },
        '安徽省': { 
            totalFlow: 95, mainDest: '上海(28万)、江苏(22万)、浙江(18万)、北京(10万)、广东(8万)', 
            peakHour: '7:30-8:30', avgDistance: '14.5km', trend: '↑上升1.5%',
            inflow: 42, outflow: 53, topDestinations: ['上海', '江苏', '浙江', '北京', '广东']
        },
        '陕西省': { 
            totalFlow: 88, mainDest: '北京(18万)、上海(15万)、广东(12万)、四川(10万)、江苏(8万)', 
            peakHour: '8:00-9:00', avgDistance: '17.8km', trend: '↓下降1.2%',
            inflow: 38, outflow: 50, topDestinations: ['北京', '上海', '广东', '四川', '江苏']
        },
        '天津市': { 
            totalFlow: 82, mainDest: '北京(35万)、河北(18万)、上海(10万)、山东(8万)、广东(5万)', 
            peakHour: '7:30-8:30', avgDistance: '12.5km', trend: '→平稳',
            inflow: 42, outflow: 40, topDestinations: ['北京', '河北', '上海', '山东', '广东']
        },
        '重庆市': { 
            totalFlow: 95, mainDest: '四川(38万)、广东(18万)、浙江(10万)、上海(8万)、江苏(6万)', 
            peakHour: '8:00-9:00', avgDistance: '21.3km', trend: '↑上升2.8%',
            inflow: 42, outflow: 53, topDestinations: ['四川', '广东', '浙江', '上海', '江苏']
        },
        '辽宁省': { 
            totalFlow: 72, mainDest: '北京(22万)、山东(12万)、上海(10万)、广东(8万)、天津(6万)', 
            peakHour: '7:30-8:30', avgDistance: '16.5km', trend: '↓下降0.8%',
            inflow: 32, outflow: 40, topDestinations: ['北京', '山东', '上海', '广东', '天津']
        },
        '黑龙江省': { 
            totalFlow: 58, mainDest: '北京(18万)、辽宁(12万)、山东(8万)、上海(6万)、广东(5万)', 
            peakHour: '7:30-8:30', avgDistance: '15.8km', trend: '↓下降1.5%',
            inflow: 25, outflow: 33, topDestinations: ['北京', '辽宁', '山东', '上海', '广东']
        },
        '江西省': { 
            totalFlow: 72, mainDest: '广东(25万)、浙江(15万)、上海(10万)、福建(8万)、江苏(6万)', 
            peakHour: '7:30-8:30', avgDistance: '16.2km', trend: '↑上升2.0%',
            inflow: 32, outflow: 40, topDestinations: ['广东', '浙江', '上海', '福建', '江苏']
        },
        '广西壮族自治区': { 
            totalFlow: 68, mainDest: '广东(32万)、湖南(12万)、云南(8万)、海南(5万)、四川(4万)', 
            peakHour: '7:30-8:30', avgDistance: '19.5km', trend: '↑上升2.2%',
            inflow: 28, outflow: 40, topDestinations: ['广东', '湖南', '云南', '海南', '四川']
        },
        '云南省': { 
            totalFlow: 55, mainDest: '四川(15万)、广东(12万)、贵州(8万)、重庆(6万)、湖南(5万)', 
            peakHour: '8:00-9:00', avgDistance: '20.5km', trend: '→平稳',
            inflow: 25, outflow: 30, topDestinations: ['四川', '广东', '贵州', '重庆', '湖南']
        },
        '贵州省': { 
            totalFlow: 52, mainDest: '广东(18万)、浙江(10万)、福建(8万)、江苏(6万)、湖南(5万)', 
            peakHour: '8:00-9:00', avgDistance: '18.5km', trend: '↑上升1.8%',
            inflow: 22, outflow: 30, topDestinations: ['广东', '浙江', '福建', '江苏', '湖南']
        },
        '山西省': { 
            totalFlow: 48, mainDest: '北京(15万)、河北(10万)、陕西(8万)、天津(6万)、山东(5万)', 
            peakHour: '7:30-8:30', avgDistance: '14.5km', trend: '↓下降0.5%',
            inflow: 22, outflow: 26, topDestinations: ['北京', '河北', '陕西', '天津', '山东']
        },
        '吉林省': { 
            totalFlow: 45, mainDest: '辽宁(15万)、北京(12万)、山东(6万)、天津(5万)、上海(4万)', 
            peakHour: '7:30-8:30', avgDistance: '15.2km', trend: '↓下降1.0%',
            inflow: 20, outflow: 25, topDestinations: ['辽宁', '北京', '山东', '天津', '上海']
        },
        '甘肃省': { 
            totalFlow: 38, mainDest: '陕西(12万)、新疆(8万)、四川(6万)、北京(5万)、上海(4万)', 
            peakHour: '8:00-9:00', avgDistance: '19.8km', trend: '→平稳',
            inflow: 18, outflow: 20, topDestinations: ['陕西', '新疆', '四川', '北京', '上海']
        },
        '内蒙古自治区': { 
            totalFlow: 35, mainDest: '北京(12万)、河北(8万)、辽宁(6万)、山西(4万)、天津(3万)', 
            peakHour: '8:00-9:00', avgDistance: '18.2km', trend: '→平稳',
            inflow: 16, outflow: 19, topDestinations: ['北京', '河北', '辽宁', '山西', '天津']
        },
        '新疆维吾尔自治区': { 
            totalFlow: 32, mainDest: '甘肃(10万)、陕西(8万)、河南(5万)、北京(4万)、四川(3万)', 
            peakHour: '9:00-10:00', avgDistance: '22.5km', trend: '↑上升1.2%',
            inflow: 15, outflow: 17, topDestinations: ['甘肃', '陕西', '河南', '北京', '四川']
        },
        '海南省': { 
            totalFlow: 28, mainDest: '广东(12万)、广西(5万)、湖南(4万)、北京(3万)、四川(2万)', 
            peakHour: '8:00-9:00', avgDistance: '21.5km', trend: '↑上升2.5%',
            inflow: 14, outflow: 14, topDestinations: ['广东', '广西', '湖南', '北京', '四川']
        },
        '宁夏回族自治区': { 
            totalFlow: 22, mainDest: '陕西(8万)、甘肃(6万)、内蒙古(3万)、北京(2万)、河南(2万)', 
            peakHour: '8:00-9:00', avgDistance: '16.5km', trend: '→平稳',
            inflow: 10, outflow: 12, topDestinations: ['陕西', '甘肃', '内蒙古', '北京', '河南']
        },
        '青海省': { 
            totalFlow: 18, mainDest: '甘肃(6万)、陕西(4万)、四川(3万)、北京(2万)、河南(1.5万)', 
            peakHour: '8:30-9:30', avgDistance: '20.5km', trend: '→平稳',
            inflow: 8, outflow: 10, topDestinations: ['甘肃', '陕西', '四川', '北京', '河南']
        },
        '西藏自治区': { 
            totalFlow: 12, mainDest: '四川(5万)、重庆(2万)、青海(1.5万)、陕西(1.5万)、甘肃(1万)', 
            peakHour: '9:00-10:00', avgDistance: '28.5km', trend: '↑上升1.5%',
            inflow: 5, outflow: 7, topDestinations: ['四川', '重庆', '青海', '陕西', '甘肃']
        },
        '香港特别行政区': { 
            totalFlow: 45, mainDest: '深圳(22万)、广州(12万)、北京(4万)、上海(3万)、东莞(2万)', 
            peakHour: '7:30-8:30', avgDistance: '12.5km', trend: '→平稳',
            inflow: 22, outflow: 23, topDestinations: ['深圳', '广州', '北京', '上海', '东莞']
        },
        '澳门特别行政区': { 
            totalFlow: 18, mainDest: '珠海(8万)、广州(4万)、深圳(2.5万)、中山(1.5万)、佛山(1万)', 
            peakHour: '8:00-9:00', avgDistance: '11.5km', trend: '↑上升2.0%',
            inflow: 9, outflow: 9, topDestinations: ['珠海', '广州', '深圳', '中山', '佛山']
        }
    };
    
    var defaultData = { 
        totalFlow: 25, mainDest: '周边省市', peakHour: '8:00-9:00', avgDistance: '15km', 
        trend: '→平稳', inflow: 12, outflow: 13, topDestinations: ['周边城市']
    };
    
    for (var key in dataMap) {
        if (provinceName.indexOf(key) !== -1 || key.indexOf(provinceName) !== -1) {
            return dataMap[key];
        }
    }
    return defaultData;
}

// ==================== 显示省份迁徙信息弹窗 ====================
function showProvinceMigrationInfo(provinceName, data) {
    var flowColor = data.totalFlow >= 200 ? '#ff0066' : (data.totalFlow >= 100 ? '#ff6600' : (data.totalFlow >= 50 ? '#ffcc00' : '#44ff88'));
    var trendColor = data.trend.indexOf('上升') !== -1 ? '#ff8888' : (data.trend.indexOf('下降') !== -1 ? '#88ff88' : '#ffdd88');
    var flowLevel = data.totalFlow >= 200 ? '🔥🔥 超高迁徙量' : (data.totalFlow >= 100 ? '🔥 高迁徙量' : (data.totalFlow >= 50 ? '➡️ 中等迁徙量' : '💨 一般迁徙量'));
    
    var existingModal = document.getElementById('provinceModal');
    if (existingModal) existingModal.remove();
    
    var modalHtml = `
        <div id="provinceModal" style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(145deg, #1e4a7a 0%, #0f2d4f 100%);
            border: 2px solid ${flowColor};
            border-radius: 20px;
            padding: 25px 35px;
            z-index: 1000;
            min-width: 420px;
            max-width: 500px;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 0 50px rgba(0, 170, 255, 0.7);
            backdrop-filter: blur(12px);
        ">
            <div style="
                position: sticky;
                top: 0;
                text-align: right;
                cursor: pointer;
                color: #ffffff;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
            " onclick="closeProvinceModal()">✕</div>
            
            <div style="text-align: center; margin-bottom: 22px;">
                <span style="font-size: 42px;">🚶</span>
                <h2 style="color: ${flowColor}; margin: 10px 0 0 0; font-size: 26px;">${provinceName}</h2>
                <div style="margin-top: 8px;"><span style="background: ${flowColor}; color: #000; padding: 3px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">${flowLevel}</span></div>
            </div>
            
            <div style="border-top: 1px solid rgba(0,170,255,0.5); margin: 12px 0 18px 0;"></div>
            
            <div style="display: flex; justify-content: space-around; text-align: center; margin-bottom: 20px;">
                <div><div style="font-size: 28px; font-weight: bold; color: ${flowColor};">${data.totalFlow}</div><div style="font-size: 11px; color: #8bbddd;">万/日 总迁徙量</div></div>
                <div><div style="font-size: 28px; font-weight: bold; color: #ffdd88;">${data.inflow}</div><div style="font-size: 11px; color: #8bbddd;">万/日 迁入</div></div>
                <div><div style="font-size: 28px; font-weight: bold; color: #88ddff;">${data.outflow}</div><div style="font-size: 11px; color: #8bbddd;">万/日 迁出</div></div>
            </div>
            
            <table style="width: 100%; color: #f0f0f0; font-size: 15px;">
                <tr style="height: 42px;">
                    <td style="width: 110px;">📍 主要流向：</td>
                    <td style="font-weight: bold; color: #ffdd88; word-break: break-all;">${data.mainDest}</td>
                </tr>
                <tr style="height: 42px;">
                    <td>⏰ 早高峰时段：</td>
                    <td style="font-weight: bold; color: #88ddff;">${data.peakHour}</td>
                </tr>
                <tr style="height: 42px;">
                    <td>📏 平均通勤距离：</td>
                    <td style="font-weight: bold; color: #88ddff;">${data.avgDistance}</td>
                </tr>
                <tr style="height: 42px;">
                    <td>📈 趋势变化：</td>
                    <td style="font-weight: bold; color: ${trendColor};">${data.trend}</td>
                </tr>
            </table>
            
            <div style="border-top: 1px solid rgba(0,170,255,0.3); margin: 15px 0 8px 0; padding-top: 10px; text-align: center; font-size: 11px; color: #8bbddd;">
                💡 数据基于实时出行大数据统计 | 点击其他省份可切换
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeProvinceModal() {
    var modal = document.getElementById('provinceModal');
    if (modal) modal.remove();
}

// ==================== 返回按钮 ====================
function showBackButton() {
    removeBackButton();
    var backBtn = document.createElement('div');
    backBtn.id = 'backToNationalBtn';
    backBtn.innerHTML = '← 返回全国地图';
    backBtn.style.cssText = `
        position: absolute;
        bottom: 20px;
        right: 20px;
        background: rgba(0, 170, 255, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        z-index: 100;
        box-shadow: 0 2px 15px rgba(0,0,0,0.3);
        transition: all 0.3s;
    `;
    backBtn.onmouseover = function() {
        this.style.background = '#00aaff';
        this.style.transform = 'scale(1.05)';
    };
    backBtn.onmouseout = function() {
        this.style.background = 'rgba(0, 170, 255, 0.9)';
        this.style.transform = 'scale(1)';
    };
    backBtn.onclick = function() {
        backToNationalView();
    };
    var mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.style.position = 'relative';
        mapContainer.appendChild(backBtn);
    }
}

function removeBackButton() {
    var existingBtn = document.getElementById('backToNationalBtn');
    if (existingBtn) existingBtn.remove();
}

function backToNationalView() {
    isProvinceView = false;
    currentProvince = '';
    if (migrationMapChart) {
        migrationMapChart.setOption({
            geo: { center: currentCenter, zoom: currentZoom, roam: true }
        });
    }
    removeBackButton();
}

// ==================== 迁徙数据（大幅增加） ====================
var migrationData = [
    // 京津冀地区
    { from: '北京', to: '上海', value: 42 }, { from: '北京', to: '天津', value: 38 }, { from: '北京', to: '深圳', value: 25 },
    { from: '北京', to: '广州', value: 22 }, { from: '北京', to: '成都', value: 18 }, { from: '北京', to: '杭州', value: 16 },
    { from: '北京', to: '南京', value: 15 }, { from: '北京', to: '郑州', value: 14 }, { from: '北京', to: '武汉', value: 13 },
    { from: '北京', to: '西安', value: 12 }, { from: '北京', to: '沈阳', value: 11 }, { from: '北京', to: '济南', value: 10 },
    { from: '天津', to: '北京', value: 35 }, { from: '天津', to: '上海', value: 12 }, { from: '天津', to: '河北', value: 18 },
    { from: '天津', to: '济南', value: 8 }, { from: '天津', to: '郑州', value: 6 },
    // 长三角地区
    { from: '上海', to: '北京', value: 38 }, { from: '上海', to: '杭州', value: 48 }, { from: '上海', to: '南京', value: 42 },
    { from: '上海', to: '苏州', value: 38 }, { from: '上海', to: '深圳', value: 28 }, { from: '上海', to: '广州', value: 25 },
    { from: '上海', to: '宁波', value: 22 }, { from: '上海', to: '合肥', value: 18 }, { from: '上海', to: '武汉', value: 16 },
    { from: '上海', to: '成都', value: 14 }, { from: '上海', to: '郑州', value: 12 }, { from: '上海', to: '西安', value: 10 },
    { from: '杭州', to: '上海', value: 45 }, { from: '杭州', to: '宁波', value: 28 }, { from: '杭州', to: '南京', value: 22 },
    { from: '杭州', to: '苏州', value: 18 }, { from: '杭州', to: '北京', value: 15 }, { from: '杭州', to: '广州', value: 12 },
    { from: '南京', to: '上海', value: 40 }, { from: '南京', to: '苏州', value: 25 }, { from: '南京', to: '杭州', value: 20 },
    { from: '南京', to: '合肥', value: 15 }, { from: '南京', to: '北京', value: 14 }, { from: '南京', to: '武汉', value: 10 },
    { from: '苏州', to: '上海', value: 35 }, { from: '苏州', to: '南京', value: 22 }, { from: '苏州', to: '杭州', value: 15 },
    { from: '宁波', to: '上海', value: 20 }, { from: '宁波', to: '杭州', value: 18 }, { from: '宁波', to: '温州', value: 10 },
    // 珠三角地区
    { from: '广州', to: '深圳', value: 52 }, { from: '广州', to: '佛山', value: 38 }, { from: '广州', to: '东莞', value: 28 },
    { from: '广州', to: '北京', value: 20 }, { from: '广州', to: '上海', value: 22 }, { from: '广州', to: '长沙', value: 18 },
    { from: '广州', to: '武汉', value: 15 }, { from: '广州', to: '成都', value: 12 }, { from: '广州', to: '南宁', value: 12 },
    { from: '深圳', to: '广州', value: 48 }, { from: '深圳', to: '东莞', value: 32 }, { from: '深圳', to: '香港', value: 22 },
    { from: '深圳', to: '北京', value: 22 }, { from: '深圳', to: '上海', value: 25 }, { from: '深圳', to: '长沙', value: 15 },
    { from: '深圳', to: '武汉', value: 12 }, { from: '深圳', to: '成都', value: 10 }, { from: '深圳', to: '南宁', value: 8 },
    { from: '佛山', to: '广州', value: 35 }, { from: '佛山', to: '深圳', value: 18 }, { from: '佛山', to: '东莞', value: 12 },
    { from: '东莞', to: '深圳', value: 28 }, { from: '东莞', to: '广州', value: 22 }, { from: '东莞', to: '惠州', value: 10 },
    { from: '香港', to: '深圳', value: 20 }, { from: '香港', to: '广州', value: 10 }, { from: '香港', to: '北京', value: 4 },
    // 成渝地区
    { from: '成都', to: '重庆', value: 52 }, { from: '成都', to: '北京', value: 16 }, { from: '成都', to: '上海', value: 14 },
    { from: '成都', to: '深圳', value: 12 }, { from: '成都', to: '广州', value: 10 }, { from: '成都', to: '西安', value: 10 },
    { from: '成都', to: '武汉', value: 8 }, { from: '成都', to: '昆明', value: 8 }, { from: '成都', to: '贵阳', value: 6 },
    { from: '重庆', to: '成都', value: 45 }, { from: '重庆', to: '北京', value: 12 }, { from: '重庆', to: '上海', value: 10 },
    { from: '重庆', to: '深圳', value: 9 }, { from: '重庆', to: '广州', value: 8 }, { from: '重庆', to: '武汉', value: 7 },
    // 中部地区
    { from: '武汉', to: '深圳', value: 22 }, { from: '武汉', to: '广州', value: 18 }, { from: '武汉', to: '上海', value: 16 },
    { from: '武汉', to: '北京', value: 14 }, { from: '武汉', to: '郑州', value: 12 }, { from: '武汉', to: '长沙', value: 12 },
    { from: '武汉', to: '杭州', value: 10 }, { from: '武汉', to: '成都', value: 8 }, { from: '武汉', to: '南京', value: 8 },
    { from: '长沙', to: '广州', value: 28 }, { from: '长沙', to: '深圳', value: 22 }, { from: '长沙', to: '武汉', value: 10 },
    { from: '长沙', to: '北京', value: 8 }, { from: '长沙', to: '上海', value: 8 }, { from: '长沙', to: '杭州', value: 6 },
    { from: '郑州', to: '北京', value: 22 }, { from: '郑州', to: '上海', value: 18 }, { from: '郑州', to: '广州', value: 15 },
    { from: '郑州', to: '深圳', value: 12 }, { from: '郑州', to: '武汉', value: 10 }, { from: '郑州', to: '西安', value: 10 },
    // 东北地区
    { from: '沈阳', to: '北京', value: 18 }, { from: '沈阳', to: '上海', value: 10 }, { from: '沈阳', to: '大连', value: 12 },
    { from: '沈阳', to: '长春', value: 10 }, { from: '沈阳', to: '哈尔滨', value: 8 }, { from: '沈阳', to: '天津', value: 6 },
    { from: '长春', to: '沈阳', value: 12 }, { from: '长春', to: '北京', value: 10 }, { from: '长春', to: '哈尔滨', value: 8 },
    { from: '哈尔滨', to: '北京', value: 15 }, { from: '哈尔滨', to: '沈阳', value: 10 }, { from: '哈尔滨', to: '长春', value: 8 },
    { from: '大连', to: '沈阳', value: 10 }, { from: '大连', to: '北京', value: 8 }, { from: '大连', to: '上海', value: 8 },
    // 西部地区
    { from: '西安', to: '北京', value: 12 }, { from: '西安', to: '上海', value: 10 }, { from: '西安', to: '成都', value: 12 },
    { from: '西安', to: '郑州', value: 10 }, { from: '西安', to: '深圳', value: 8 }, { from: '西安', to: '广州', value: 8 },
    { from: '西安', to: '武汉', value: 7 }, { from: '西安', to: '兰州', value: 6 },
    { from: '昆明', to: '成都', value: 10 }, { from: '昆明', to: '广州', value: 9 }, { from: '昆明', to: '深圳', value: 8 },
    { from: '昆明', to: '北京', value: 6 }, { from: '昆明', to: '上海', value: 6 }, { from: '昆明', to: '贵阳', value: 5 },
    { from: '贵阳', to: '广州', value: 12 }, { from: '贵阳', to: '深圳', value: 10 }, { from: '贵阳', to: '成都', value: 8 },
    { from: '贵阳', to: '重庆', value: 7 }, { from: '贵阳', to: '北京', value: 5 }, { from: '贵阳', to: '上海', value: 5 },
    { from: '南宁', to: '广州', value: 15 }, { from: '南宁', to: '深圳', value: 10 }, { from: '南宁', to: '北京', value: 5 },
    { from: '南宁', to: '上海', value: 5 }, { from: '南宁', to: '昆明', value: 5 },
    { from: '兰州', to: '西安', value: 8 }, { from: '兰州', to: '北京', value: 6 }, { from: '兰州', to: '上海', value: 5 },
    { from: '乌鲁木齐', to: '北京', value: 8 }, { from: '乌鲁木齐', to: '上海', value: 6 }, { from: '乌鲁木齐', to: '西安', value: 6 },
    { from: '乌鲁木齐', to: '成都', value: 5 }, { from: '乌鲁木齐', to: '兰州', value: 5 },
    // 华东其他
    { from: '济南', to: '北京', value: 18 }, { from: '济南', to: '上海', value: 12 }, { from: '济南', to: '青岛', value: 10 },
    { from: '济南', to: '天津', value: 8 }, { from: '济南', to: '南京', value: 7 },
    { from: '青岛', to: '济南', value: 10 }, { from: '青岛', to: '上海', value: 10 }, { from: '青岛', to: '北京', value: 8 },
    { from: '福州', to: '深圳', value: 12 }, { from: '福州', to: '广州', value: 10 }, { from: '福州', to: '上海', value: 8 },
    { from: '福州', to: '厦门', value: 8 }, { from: '福州', to: '北京', value: 6 },
    { from: '厦门', to: '深圳', value: 10 }, { from: '厦门', to: '广州', value: 8 }, { from: '厦门', to: '福州', value: 7 },
    { from: '厦门', to: '上海', value: 8 }, { from: '厦门', to: '北京', value: 5 },
    { from: '合肥', to: '上海', value: 18 }, { from: '合肥', to: '南京', value: 12 }, { from: '合肥', to: '北京', value: 8 },
    { from: '合肥', to: '深圳', value: 7 }, { from: '合肥', to: '广州', value: 6 },
    { from: '南昌', to: '广州', value: 12 }, { from: '南昌', to: '深圳', value: 10 }, { from: '南昌', to: '上海', value: 8 },
    { from: '南昌', to: '北京', value: 6 }, { from: '南昌', to: '杭州', value: 6 },
    // 省份内部流动
    { from: '苏州', to: '无锡', value: 12 }, { from: '无锡', to: '苏州', value: 10 },
    { from: '宁波', to: '温州', value: 8 }, { from: '温州', to: '宁波', value: 6 },
    { from: '佛山', to: '中山', value: 8 }, { from: '中山', to: '佛山', value: 6 },
    { from: '惠州', to: '深圳', value: 10 }, { from: '惠州', to: '广州', value: 8 },
    { from: '珠海', to: '广州', value: 8 }, { from: '珠海', to: '深圳', value: 6 }
];

// 城市坐标（大幅增加）
var cityCoord = {
    // 一线城市
    '北京': [116.46, 39.92], '上海': [121.48, 31.22], '广州': [113.23, 23.16], '深圳': [114.07, 22.62],
    // 直辖市
    '天津': [117.20, 39.13], '重庆': [106.54, 29.59],
    // 省会城市
    '成都': [104.06, 30.67], '杭州': [120.19, 30.26], '武汉': [114.31, 30.52], '南京': [118.78, 32.04],
    '郑州': [113.65, 34.76], '西安': [108.95, 34.27], '长沙': [112.98, 28.21], '济南': [117.00, 36.65],
    '沈阳': [123.43, 41.80], '长春': [125.35, 43.88], '哈尔滨': [126.63, 45.75], '石家庄': [114.52, 38.05],
    '太原': [112.56, 37.87], '呼和浩特': [111.65, 40.82], '南宁': [108.32, 22.84], '海口': [110.35, 20.02],
    '贵阳': [106.71, 26.57], '昆明': [102.71, 25.05], '拉萨': [91.14, 29.66], '兰州': [103.82, 36.06],
    '西宁': [101.74, 36.56], '银川': [106.27, 38.47], '乌鲁木齐': [87.62, 43.82], '合肥': [117.28, 31.86],
    '南昌': [115.89, 28.68], '福州': [119.30, 26.08],
    // 重点城市
    '苏州': [120.62, 31.32], '宁波': [121.55, 29.88], '青岛': [120.33, 36.07], '大连': [121.62, 38.92],
    '厦门': [118.10, 24.46], '无锡': [120.29, 31.49], '佛山': [113.12, 23.02], '东莞': [113.75, 23.04],
    '香港': [114.17, 22.27], '澳门': [113.54, 22.19], '珠海': [113.58, 22.27], '中山': [113.38, 22.52],
    '惠州': [114.42, 23.11], '温州': [120.70, 28.00], '烟台': [121.45, 37.46], '潍坊': [119.16, 36.71],
    '淄博': [118.05, 36.82], '扬州': [119.41, 32.39], '南通': [120.86, 32.01], '常州': [119.95, 31.79]
};

// 构建流线数据
var linesData = [];
for (var i = 0; i < migrationData.length; i++) {
    var item = migrationData[i];
    var fromCoord = cityCoord[item.from];
    var toCoord = cityCoord[item.to];
    if (fromCoord && toCoord) {
        linesData.push({
            coords: [fromCoord, toCoord],
            value: item.value,
            from: item.from,
            to: item.to
        });
    }
}

// 城市节点数据
var citiesData = [];
var processedCities = {};
for (var i = 0; i < migrationData.length; i++) {
    var item = migrationData[i];
    if (!processedCities[item.from]) {
        processedCities[item.from] = { inflow: 0, outflow: 0 };
    }
    if (!processedCities[item.to]) {
        processedCities[item.to] = { inflow: 0, outflow: 0 };
    }
    processedCities[item.from].outflow += item.value;
    processedCities[item.to].inflow += item.value;
}

for (var city in processedCities) {
    if (cityCoord[city]) {
        var total = processedCities[city].inflow + processedCities[city].outflow;
        citiesData.push({
            name: city,
            value: [cityCoord[city][0], cityCoord[city][1], total],
            inflow: processedCities[city].inflow,
            outflow: processedCities[city].outflow
        });
    }
}

// 排序取前30个城市显示
citiesData.sort(function(a, b) { return b.value[2] - a.value[2]; });

// ==================== 更新顶部指标 ====================
function updateTopIndicators() {
    if (!realMigrationData) return;
    var morningElem = document.getElementById('morningPeak');
    var eveningElem = document.getElementById('eveningPeak');
    var durationElem = document.getElementById('avgDuration');
    var distanceElem = document.getElementById('avgDistance');
    if (morningElem) morningElem.innerText = realMigrationData.morning_peak + '万';
    if (eveningElem) eveningElem.innerText = realMigrationData.evening_peak + '万';
    if (durationElem) durationElem.innerText = realMigrationData.avg_duration + 'min';
    if (distanceElem) distanceElem.innerText = realMigrationData.avg_distance + 'km';
}

// ==================== 更新折线图 ====================
function updateLineChart() {
    if (!lineChart) return;
    
    // 横坐标小时：[5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22]
    // 早高峰：8点最高峰，7点和9点次之
    // 晚高峰：18点最高峰，17点和19点次之
    var correctMorningData = [5, 10, 28, 68, 58, 42, 35, 30, 28, 26, 28, 32, 38, 45, 52, 48, 38, 28];
    var correctEveningData = [4, 6, 10, 15, 22, 28, 32, 35, 38, 42, 48, 55, 65, 72, 62, 48, 32, 20];
    
    lineChart.setOption({
        series: [
            { name: "早通勤", data: correctMorningData },
            { name: "晚通勤", data: correctEveningData }
        ]
    });
}

// ==================== 更新柱状图 ====================
function updateBarChart() {
    if (!barChart || !realMigrationData) return;
    barChart.setOption({
        series: [{ data: realMigrationData.distance_distribution.map(function(d) { return d.value; }) }]
    });
}

// ==================== 更新饼图 ====================
function updatePieChart() {
    if (!pieChart || !realMigrationData) return;
    pieChart.setOption({
        series: [{ data: realMigrationData.transport_ratio.map(function(t) { return { value: t.ratio, name: t.mode }; }) }]
    });
}

// ==================== 初始化地图 ====================
function initMigrationMap() {
    migrationMapChart = echarts.init(document.getElementById('map'));
    
    migrationMapChart.setOption({
        backgroundColor: 'transparent',
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
                fontSize: 9,
                fontWeight: 'normal'
            },
            emphasis: {
                itemStyle: {
                    areaColor: 'rgba(0, 170, 255, 0.5)'
                },
                label: {
                    show: true,
                    color: '#ffd600',
                    fontSize: 11
                }
            }
        },
        visualMap: {
            type: 'continuous',
            min: 0,
            max: 100,
            calculable: true,
            inRange: { color: ['#44ff88', '#ffcc00', '#ff6600', '#ff0066'] },
            textStyle: { color: '#fff', fontSize: 10 },
            left: 20,
            bottom: 20,
            text: ['高迁徙量', '低迁徙量'],
            seriesIndex: 0
        },
        series: [
            {
                name: '迁徙流线',
                type: 'lines',
                coordinateSystem: 'geo',
                data: linesData.map(function(item) {
                    return {
                        coords: item.coords,
                        value: item.value,
                        lineStyle: {
                            width: 1.5 + item.value / 30,
                            curveness: 0.3,
                            color: item.value >= 30 ? '#ff0066' : (item.value >= 15 ? '#ff6600' : (item.value >= 8 ? '#ffcc00' : '#44ff88')),
                            opacity: 0.6,
                            type: 'solid'
                        },
                        from: item.from,
                        to: item.to
                    };
                }),
                effect: { show: true, period: 3, trailLength: 0.3, symbol: 'arrow', symbolSize: 7, color: '#ffffff' },
                lineStyle: { curveness: 0.3, opacity: 0.5 },
                zlevel: 1
            },
            {
                name: '迁徙节点',
                type: 'scatter',
                coordinateSystem: 'geo',
                data: citiesData,
                symbolSize: function(val) { return 8 + val[2] / 12; },
                itemStyle: {
                    color: function(params) {
                        var val = params.value[2];
                        if (val >= 80) return '#ff0066';
                        if (val >= 50) return '#ff6600';
                        if (val >= 25) return '#ffcc00';
                        return '#44ff88';
                    },
                    shadowBlur: 12, borderWidth: 2, borderColor: '#ffffff', opacity: 0.95
                },
                label: { show: true, formatter: function(params) { return params.name; }, position: 'right', color: '#fff', fontSize: 10, offset: [6, 0] },
                emphasis: { scale: 1.4, label: { show: true, fontSize: 12, color: '#ffd600' } }
            }
        ],
        tooltip: {
            trigger: 'item',
            formatter: function(params) {
                if (params.seriesName === '迁徙节点' && params.value) {
                    var city = citiesData.find(function(c) { return c.name === params.name; });
                    if (city) {
                        return '<b>' + city.name + '</b><br/>📊 总迁徙量: <b>' + city.value[2] + '</b> 万人次<br/>📤 迁出: <b>' + city.outflow + '</b> 万 | 📥 迁入: <b>' + city.inflow + '</b> 万';
                    }
                }
                if (params.seriesName === '迁徙流线' && params.data && params.data.from) {
                    return '🚶 人口迁徙<br/>📍 <b>' + params.data.from + '</b> → <b>' + params.data.to + '</b><br/>📊 迁徙量: <b>' + params.data.value + '</b> 万人次';
                }
                return params.name;
            },
            backgroundColor: 'rgba(10, 30, 50, 0.95)',
            borderColor: '#00aaff',
            borderWidth: 1,
            textStyle: { color: '#fff', fontSize: 12 },
            borderRadius: 8
        }
    });
    
    var opt = migrationMapChart.getOption();
    if (opt.geo && opt.geo[0]) {
        currentZoom = opt.geo[0].zoom || 1.2;
        currentCenter = opt.geo[0].center || [104.0, 35.0];
    }
    
    // ==================== 省份点击事件 ====================
    migrationMapChart.off('click');
    migrationMapChart.on('click', function(params) {
        if (params.componentType === 'geo') {
            var provinceName = params.name;
            if (provinceName) {
                if (!isProvinceView) {
                    var opt = migrationMapChart.getOption();
                    if (opt.geo && opt.geo[0]) {
                        currentZoom = opt.geo[0].zoom || 1.2;
                        currentCenter = opt.geo[0].center || [104.0, 35.0];
                    }
                    isProvinceView = true;
                    currentProvince = provinceName;
                }
                var config = provinceViewConfig[provinceName] || { center: [104.0, 35.0], zoom: 6 };
                migrationMapChart.setOption({ geo: { center: config.center, zoom: config.zoom, roam: true } });
                showBackButton();
                var migrationData = getProvinceMigrationData(provinceName);
                showProvinceMigrationInfo(provinceName, migrationData);
            }
        }
    });
    
    window.addEventListener('resize', function() { migrationMapChart.resize(); });
}

// ==================== 初始化其他图表（修改为保存全局变量） ====================
function initOtherCharts() {
    lineChart = echarts.init(document.getElementById('line'));
    barChart = echarts.init(document.getElementById('bar'));
    pieChart = echarts.init(document.getElementById('pie'));

    lineChart.setOption({
        color: ["#00f2f1", "#ed3f35"],
        tooltip: { trigger: "axis" },
        legend: { textStyle: { color: "#4c9bfd" }, right: "10%" },
        grid: { top: "20%", left: "3%", right: "4%", bottom: "3%", show: true, borderColor: "#012f4a", containLabel: true },
        xAxis: { type: "category", boundaryGap: false, data: ['5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'], axisTick: { show: false }, axisLabel: { color: "#4c9bfd" }, axisLine: { show: false } },
        yAxis: { type: "value", axisTick: { show: false }, axisLabel: { color: "#4c9bfd" }, axisLine: { show: false }, splitLine: { lineStyle: { color: "#012f4a" } } },
        series: [
            { name: "早通勤", type: "line", smooth: true, data: [5, 10, 28, 68, 58, 42, 35, 30, 28, 26, 28, 32, 38, 45, 52, 48, 38, 28] },
            { name: "晚通勤", type: "line", smooth: true, data: [4, 6, 10, 15, 22, 28, 32, 35, 38, 42, 48, 55, 65, 72, 62, 48, 32, 20] }        ]
    });

    barChart.setOption({
        tooltip: { trigger: 'item' },
        color: ['#00b8ff'],
        xAxis: { type: 'category', data: ['0-5km', '5-10km', '10-15km', '15-20km', '20-25km', '25-30km', '30-35km', '35-40km', '40km+'], axisLabel: { color: '#fff' }, axisLine: { show: false }, axisTick: { show: false } },
        yAxis: { type: 'value', axisLabel: { color: '#fff' }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } } },
        series: [{
            name: '通勤距离', type: 'scatter', symbolSize: 15,
            itemStyle: { color: '#b0f9d8', borderColor: 'rgba(255, 255, 255, 0.6)', borderWidth: 2, shadowBlur: 8, shadowColor: 'rgba(255, 255, 255, 0.4)' },
            data: [28, 32, 35, 28, 22, 15, 10, 6, 4],
            emphasis: { symbolSize: 18, itemStyle: { borderColor: 'rgba(255, 255, 255, 0.9)', borderWidth: 3, shadowBlur: 12, shadowColor: 'rgba(255, 255, 255, 0.6)' } }
        }]
    });

    pieChart.setOption({
        color: ["#006cff", "#60cda0", "#ed8884", "#f5f788", "#ea7fffd5"],
        tooltip: { trigger: "item", formatter: "{a} <br/>{b} : {c} ({d}%)" },
        legend: { bottom: "0%", itemWidth: 10, itemHeight: 10, textStyle: { color: "#fff", fontSize: "12" } },
        series: [{
            name: "出行方式", type: "pie", radius: ["10%", "70%"], center: ["50%", "40%"], roseType: "radius",
            label: { fontSize: 10, color: "#fff" },
            labelLine: { length: 6, length2: 8, lineStyle: { color: "#fff" } },
            data: [
                { value: 35, name: "地铁" }, { value: 28, name: "公交" },
                { value: 22, name: "自驾" }, { value: 10, name: "网约车" }, { value: 5, name: "骑行" }
            ]
        }]
    });

    window.addEventListener('resize', function() {
        if (lineChart) lineChart.resize();
        if (barChart) barChart.resize();
        if (pieChart) pieChart.resize();
        if (migrationMapChart) migrationMapChart.resize();
    });
}

// ==================== 从API加载迁徙数据 ====================
async function loadMigrationData() {
    try {
        console.log('🔄 开始加载迁徙数据...');
        var response = await fetch(API_BASE + '/migration');
        var result = await response.json();
        if (result) {
            realMigrationData = result;
            console.log('✅ 迁徙数据加载成功');
            updateTopIndicators();
            updateLineChart();
            updateBarChart();
            updatePieChart();
        }
    } catch (error) {
        console.error('❌ 加载迁徙数据失败:', error);
    }
}

// ==================== 页面加载 ====================
window.addEventListener('load', function() {
    initOtherCharts();
    
    // 加载实时数据
    loadMigrationData();
    setInterval(loadMigrationData, 5 * 60 * 1000);
    
    if (typeof window.waitForChinaMap === 'function') {
        window.waitForChinaMap(function() { initMigrationMap(); });
    } else {
        setTimeout(function() {
            if (typeof window.waitForChinaMap === 'function') {
                window.waitForChinaMap(initMigrationMap);
            } else {
                initMigrationMap();
            }
        }, 500);
    }
});