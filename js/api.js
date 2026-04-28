// 高德地图API Key
const AMAP_KEY = '6f60e1a892b19e582e10d065ccbd278c';

export const cityCodes = {
    '北京': '110000', '上海': '310000', '广州': '440100', '深圳': '440300',
    '天津': '120000', '重庆': '500000', '成都': '510100', '杭州': '330100',
    '武汉': '420100', '南京': '320100', '苏州': '320500', '郑州': '410100',
    '西安': '610100', '长沙': '430100', '济南': '370100', '青岛': '370200',
    '沈阳': '210100', '哈尔滨': '230100', '长春': '220100', '石家庄': '130100',
    '太原': '140100', '呼和浩特': '150100', '南宁': '450100', '海口': '460100',
    '贵阳': '520100', '昆明': '530100', '兰州': '620100', '西宁': '630100',
    '银川': '640100', '乌鲁木齐': '650100', '香港': '810000', '澳门': '820000'
};

export async function getCityTraffic(cityCode) {
    try {
        const url = `/amap-api/v3/traffic/status/road?key=${AMAP_KEY}&city=${cityCode}&level=4&extensions=all`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        return null;
    }
}

export async function getCityCongestion(cityCode, cityName) {
    const trafficData = await getCityTraffic(cityCode);
    
    if (trafficData && trafficData.status === '1') {
        const roads = trafficData.trafficinfo?.roads || [];
        if (roads.length === 0) {
            return { name: cityName, index: 65, status: 'default' };
        }
        
        let totalSpeed = 0;
        for (let i = 0; i < roads.length; i++) {
            totalSpeed += roads[i].speed || 40;
        }
        const avgSpeed = totalSpeed / roads.length;
        
        let congestionIndex;
        if (avgSpeed >= 60) congestionIndex = 45;
        else if (avgSpeed >= 50) congestionIndex = 55;
        else if (avgSpeed >= 40) congestionIndex = 65;
        else if (avgSpeed >= 30) congestionIndex = 75;
        else if (avgSpeed >= 20) congestionIndex = 85;
        else congestionIndex = 92;
        
        return { name: cityName, index: Math.round(congestionIndex), status: 'success' };
    }
    
    return { name: cityName, index: 65, status: 'fallback' };
}

// 并发请求版本
export async function getBatchCityCongestion(cities, onProgress) {
    const promises = [];
    const results = [];
    
    for (let i = 0; i < cities.length; i++) {
        const city = cities[i];
        const code = cityCodes[city.name];
        if (code) {
            promises.push({ promise: getCityCongestion(code, city.name), index: i });
        } else {
            results[i] = { name: city.name, index: city.value?.[2] || 60, status: 'default' };
        }
    }
    
    const pendingPromises = promises.map(p => p.promise);
    const resolved = await Promise.all(pendingPromises);
    
    for (let i = 0; i < promises.length; i++) {
        results[promises[i].index] = resolved[i];
        if (onProgress) {
            onProgress(i + 1, promises.length, resolved[i]);
        }
    }
    
    return results;
}