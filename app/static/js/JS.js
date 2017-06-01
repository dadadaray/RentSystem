var locationcity = document.getElementById('info').innerHTML
//初始化地图对象，加载地图
var map = new AMap.Map('container', {
    resizeEnable: true,

});
// 添加标尺
var scale = new AMap.Scale();
map.addControl(scale);

// 公交到达圈对象
var arrivalRange = new AMap.ArrivalRange();
//经度，维度，时间，通勤方式（默认“地铁+公交”）
var x, y, t, vehicle = "SUBWAY,BUS";
//工作地点，工作标记
var workAddress, workMarker;
//房源标记队列
var rentMarkerArray = [];
//多边形队列，存储公交到达的计算结果
var polygonArray = [];
//路径规划
var amapTransfer;

//信息窗体对象：在房源标记被点击时弹出
var infoWindow = new AMap.InfoWindow({
    offset: new AMap.Pixel(0, -30)
});

var auto = new AMap.Autocomplete({
    //通过id指定输入元素
    input: "work-location"
});


//工作地点的经纬度：
var workjingwei;

//存放距离数组
var dis = [];

//添加事件监听，在选择补完的地址后调用workLocationSelected
AMap.event.addListener(auto, "select", workLocationSelected);


function takeBus(radio) {
    vehicle = radio.value;
    loadWorkLocation()
}

function takeSubway(radio) {
    vehicle = radio.value;
    loadWorkLocation()
}

//加载房源信息
function importRentInfo() {
    var wl = document.getElementById("work-location").value
    if (wl) {
        var file = "static/rent.csv"
        loadRentLocationByFile(file);
    } else {
        alert("工作地点为空，请填上")
    }
}

function workLocationSelected(e) {
    //更新工作地点，加载公交到达圈
    workAddress = e.poi.name;
    locationcity = workAddress;
    loadWorkLocation();
}

function loadWorkMarker(x, y, locationName) {
    workMarker = new AMap.Marker({
        map: map,
        title: locationName,
        icon: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
        position: [x, y]

    });
}


function loadWorkRange(x, y, t, color, v) {
    arrivalRange.search([x, y], t, function (status, result) {
        if (result.bounds) {
            for (var i = 0; i < result.bounds.length; i++) {
                //新建多边形对象
                var polygon = new AMap.Polygon({
                    map: map,
                    fillColor: color,
                    fillOpacity: "0.4",
                    strokeColor: color,
                    strokeOpacity: "0.8",
                    strokeWeight: 1
                });
                //得到到达圈的多边形路径
                polygon.setPath(result.bounds[i]);
                polygonArray.push(polygon);
            }
        }
    }, {
        policy: v
    });
}

function addMarkerByAddress(address) {
    var geocoder = new AMap.Geocoder({
        city: locationcity,
        radius: 1000
    });
    geocoder.getLocation(address, function (status, result) {
        if (status === "complete" && result.info === 'OK') {
            var geocode = result.geocodes[0];
            rentMarker = new AMap.Marker({
                map: map,
                title: address,
                icon: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
                position: [geocode.location.getLng(), geocode.location.getLat()]
            });
            rentMarkerArray.push(rentMarker);

            rentMarker.content = "<div>房源：<a target = '_blank' href='http://bj.58.com/pinpaigongyu/?key=" + address + "'>" + address + "</a><div>"
            //在房源标记被点击时打开
            rentMarker.on('click', function (e) {
                //鼠标移到标记上会显示标记content属性的内容
                infoWindow.setContent(e.target.content);
                //在标记的位置打开窗体
                infoWindow.open(map, e.target.getPosition());
                if (amapTransfer) amapTransfer.clear();
                amapTransfer = new AMap.Transfer({
                    map: map,
                    policy: AMap.TransferPolicy.LEAST_TIME,
                    city: locationcity,
                    panel: 'transfer-panel'
                });
                amapTransfer.search([{
                    keyword: workAddress
                }, {
                    keyword: address
                }], function (status, result) {
                })
            });
        }
    })
}

function delWorkLocation() {
    if (polygonArray) map.remove(polygonArray);
    if (workMarker) map.remove(workMarker);
    polygonArray = [];
}

function delRentLocation() {
    if (rentMarkerArray) map.remove(rentMarkerArray);
    rentMarkerArray = [];
}

function loadWorkLocation() {
    //首先清空地图上已有的到达圈
    delWorkLocation();
    var geocoder = new AMap.Geocoder({
        city: locationcity,
        radius: 1000
    });

    geocoder.getLocation(workAddress, function (status, result) {
        if (status === "complete" && result.info === 'OK') {
            var geocode = result.geocodes[0];
            x = geocode.location.getLng();
            y = geocode.location.getLat();
            //加载工作地点标记
            loadWorkMarker(x, y);
            //加载60分钟内工作地点到达圈
            loadWorkRange(x, y, 60, "#3f67a5", vehicle);
            //地图移动到工作地点的位置
            map.setZoomAndCenter(12, [x, y]);
        }
    })
}

//经纬度获取类  by Ray
AMap.service('AMap.Geocoder', function () {//回调函数
    //实例化Geocoder
    geocoder = new AMap.Geocoder({
        city: "010"//城市，默认：“全国”
    });
    // 使用geocoder 对象完成相关功能
})

//记录所有房源地址
function loadRentLocationByFile(fileName) {
    //获取工作地点的经纬度
    geocoder.getLocation(locationcity, function (status, result) {
        if (status === 'complete' && result.info === 'OK') {
            //alert(result.geocodes[0].location);
            workjingwei = result.geocodes[0].location;
            // alert("这是工作地点的经纬度"+workjingwei);
        }
    });
    //alert(locationcity);
    //先删除现有的房源标记
    delRentLocation();
    //所有的地点都记录在记录在集合中
    var rent_locations = new Set();
    //jquery操作
    $.get(fileName, function (data) {
        data = data.split("\n");
        data.forEach(function (item, index) {
            rent_locations.add(item.split(",")[1]);
        });
        //获取各个房源信息的经纬度  by  Ray
        rent_locations.forEach(function (element, index) {
            geocoder.getLocation(element, function (status, result) {
                if (status === 'complete' && result.info === 'OK') {
                    //存放地点和匹配的信息
                     var match=[];
                     //存放地点
                     match.push(element);
                     //存放距离
                     match.push(workjingwei.distance(result.geocodes[0].location));
                    // alert(result.geocodes[0].location);
                    // jingwei.push(result.geocodes[0].location);
                    // alert(workjingwei.distance(result.geocodes[0].location))
                    dis.push(match);
                }
            });
            //加上房源标记
            addMarkerByAddress(element);
        });
    });

    console.log(dis);



}

//地图中添加地图操作ToolBar插件
map.plugin(['AMap.ToolBar'], function () {
    //设置地位标记为自定义标记
    var toolBar = new AMap.ToolBar();
    map.addControl(toolBar);
});

var map, geolocation;
map.plugin('AMap.Geolocation', function () {
    geolocation = new AMap.Geolocation({
        enableHighAccuracy: true,//是否使用高精度定位，默认:true
        timeout: 10000,          //超过10秒后停止定位，默认：无穷大
        buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
        zoomToAccuracy: false,      //定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
        buttonPosition: 'RB'
    });
    map.addControl(geolocation);
    geolocation.getCurrentPosition();
    AMap.event.addListener(geolocation, 'complete', onComplete);//返回定位信息
    AMap.event.addListener(geolocation, 'error', onError);      //返回定位出错信息
});

map.on('moveend', getCity);
//解析定位结果
function getCity() {
    map.getCity(function (data) {
        if (data['province'] && typeof data['province'] === 'string') {
            document.getElementById('info').innerHTML = (data['city'] || data['province']);
            document.getElementById("hidden").style.display = "block";
            return data['city']
        }
    });
}
//解析定位错误信息
function onError(data) {
    document.getElementById('tip').innerHTML = '定位失败';
}