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

//获取表单数据

var maxprice;
var minprice;
var maxarea;
var minarea;


//添加事件监听，在选择补完的地址后调用workLocationSelected
AMap.event.addListener(auto, "select", workLocationSelected);

//经纬度获取类  by Ray
AMap.service('AMap.Geocoder', function () {//回调函数
    //实例化Geocoder
    geocoder = new AMap.Geocoder({
        city: "010"//城市，默认：“全国”
    });
    // 使用geocoder 对象完成相关功能
})
//搜索类 by Ray
AMap.service('AMap.PlaceSearch', function () {//回调函数
    //实例化PlaceSearch
    placeSearch = new AMap.PlaceSearch();
    placeSearch.setCity('010');   // 插件搜索范围为全国
    //TODO: 使用placeSearch对象调用关键字搜索的功能
})

//新建类 by Ray
function placeDis(plase, dist, jingweidu) {
    this.plase = plase;
    this.dist = dist;
    this.jingweidu = jingweidu;
}


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

    var wl = document.getElementById("work-location").value;
    //alert("初始化打印la" + price11);
    if (wl) {
        var file = "rent.csv"
        loadRentLocationByFile(file);
    } else {
        alert("工作地点为空，请填上");
    }
    document.getElementById("zuirechaxun").style.display = "none";//隐藏
    var Condition = {};
    Condition["chooseSpace"] = $("#work-location").val().trim();
    Condition["lowPrice"] = $("#price1").val().trim()
    Condition["highPrice"] = $("#price2").val().trim()
    Condition["lowArea"] = $("#mian1").val().trim()
    Condition["highArea"] = $("#mian2").val().trim()
    Condition["vehicle"] = $(".way").val().trim()

    $.ajax({
        type: 'POST',
        url: "/his",
        data: Condition,
        success: function () {
            //alert("success");
        },
        error: function () {
            alert("fail")
        }
    })
    alert(Condition["chooseSpace"])
    $.ajax({
        type: 'POST',
        url: "/record",
        data: Condition,
        success: function () {
            //alert("success");
        },
        error: function () {
            alert("fail")
        }
    })
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
                //alert("隐藏了！");
                document.getElementById("panel").style.visibility = "hidden";//隐藏

                //a.remove();
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


//记录所有房源地址
function loadRentLocationByFile(fileName) {
    //获取工作地点的经纬度
    geocoder.getLocation(locationcity, function (status, result) {
        if (status === 'complete' && result.info === 'OK') {
            workjingwei = result.geocodes[0].location;

            //左侧推荐框查询
            var placeSearch = new AMap.PlaceSearch({ //构造地点查询类
                pageSize: 5,
                pageIndex: 1,
                city: "010", //全国城市
                panel: "panel"
            });
            //alert("推荐服务"+workjingwei);
            placeSearch.searchNearBy("生活服务", workjingwei, 500);
        }
    });
    //获取输入的数据
    var price11 = document.getElementById("price1").value;
    var price22 = document.getElementById("price2").value;
    var mian11 = document.getElementById("mian1").value;
    var mian22 = document.getElementById("mian2").value;
    //alert(typeof(price11));
    //转化成整型
    price11 = parseInt(price11);
    price22 = parseInt(price22);
    mian11 = parseInt(mian11);
    mian22 = parseInt(mian22);
    // //获取筛选条件
    // //筛选条件不为空
    //判断最大最小数值  by Ray
    //alert("有数据");
    //比较价格大小
    // if(isNaN(mian22)) alert("吆这是空哦!");
    if ((!isNaN(price11)) && (!isNaN(price22)) && (!isNaN(mian11)) && (!isNaN(mian22))) {
        //alert("哈，这次是全非空哦！");
        //alert("1");
        if (price11 >= price22) {
            //alert("2");
            maxprice = price11;
            minprice = price22
        } else {
            // alert("3");
            maxprice = price22;
            minprice = price11;
        }
        if (mian11 > mian22) {
            //alert("4");
            maxarea = mian11;
            minarea = mian22;
        } else {
            //alert("5");
            maxarea = mian22;
            minarea = mian11;
        }
    } else {
        // alert("有空的额 ");
        // if (isNaN(price11) && price22 == null) {
        //     minprice = null;
        //     maxprice = null;
        // }
        if ((!isNaN(price11)) && (!isNaN(price22))) {
            //alert("价格都不为空");
            minprice = price11;
            maxprice = price22;
        }

        if ((!isNaN(price11)) && isNaN(price22)) {
            //alert("到了 1不为空，2为空");
            minprice = price11;
        }
        if (isNaN(price11) && (!isNaN(price22))) {
            // alert("8");
            maxprice = price22;
        }
        if ((!isNaN(mian11)) && (!isNaN(mian22))) {
            minarea = mian11;
            maxarea = mian22;
        }
        if (isNaN(mian11) && (!isNaN(mian22))) {
            //alert("89");
            maxarea = mian22;
        }
        if ((!isNaN(mian11)) && isNaN(mian22)) {
            // alert("48");
            minarea = mian11;
        }
    }
    // alert("最小价格" + minprice);
    // alert("最大价格" + maxprice);
    // alert("最小面积" + minarea);
    // alert("最大面积" + maxarea);

    //先删除现有的房源标记
    delRentLocation();
    //所有的地点都记录在记录在集合中
    var rent_locations = new Set();
    //s //jquery操作
    $.get(fileName, function (data) {
            data = data.split("\n");
            data.forEach(function (item, index) {

                var minGpri = item.split(",")[2].split("-")[0];
                var maxGpri = item.split(",")[2].split("-")[1];
                var Garea = item.split(",")[3];
                //所有条件填满
                if ((!isNaN(minprice)) || (!isNaN(maxprice)) || (!isNaN(minarea)) || (!isNaN(maxarea))) {
                    // alert("有不为空的。");
                    if ((!isNaN(minprice)) && (!isNaN(maxprice)) && (!isNaN(minarea)) && (!isNaN(maxarea))) {
                        //alert("价格面积最大最小都不为空");
                        if (isNaN(maxGpri)) {
                            //区分没有最大价格的情况
                            if (minGpri >= minprice && minGpri <= maxprice && Garea >= minarea && Garea <= maxarea) {
                                // console.log(minGpri);
                                // console.log(maxGpri);
                                // console.log(Garea);
                                rent_locations.add(item.split(",")[1]);

                            } else {
                                if (minGpri >= minprice && maxGpri <= maxprice && Garea >= minarea && Garea <= maxarea) {
                                    // console.log(minGpri);
                                    // console.log(maxGpri);
                                    // console.log(Garea);
                                    rent_locations.add(item.split(",")[1]);
                                }
                            }
                        }
                    } else {
                        //最低价格不为空
                        if ((!isNaN(minprice)) && isNaN(maxprice)) {
                            //alert("最低价格为不为空,z");
                            //最低价格不为空，面积全满
                            if ((!isNaN(minarea)) && (!isNaN(maxarea))) {
                                // alert("最低价格不为空，最高价格为空，面积都不为空");
                                if (minGpri >= minprice && Garea >= minarea && Garea <= maxarea) {
                                    rent_locations.add(item.split(",")[1]);
                                }
                            } else {
                                // 最低价格不为空，只有最小面积
                                if ((!isNaN(minarea)) && isNaN(maxarea)) {
                                    //alert("最低价格不为空，最高价格为空，最小面积不为空，最大面积为空");
                                    if (minGpri >= minprice && Garea >= minarea) {
                                        rent_locations.add(item.split(",")[1]);
                                    }
                                }
                                //最低价格不为空，只有最大面积
                                if (isNaN(minarea) && (!isNaN(maxarea))) {
                                    // alert("最低价格不为空，最大价格为空，最小面积为空，最大面积不为空");
                                    if (minGpri >= minprice && Garea <= maxarea) {
                                        rent_locations.add(item.split(",")[1]);
                                    }
                                }
                                //最低价格下，没有面积数据
                                if (isNaN(minarea) && isNaN(maxarea)) {
                                    //alert("最低价格下，最高价格为空，没有面积");
                                    if (minGpri >= minprice) {
                                        rent_locations.add(item.split(",")[1]);
                                    }
                                }

                            }
                        }

                        //最高价格下不为空，最低价格为空

                        if (isNaN(minprice) && (!isNaN(maxprice))) {

                            //最高价格不为空，面积全满
                            if ((!isNaN(minarea)) && (!isNaN(maxarea))) {
                                // alert("最低价格为空，最高价格不为空，有大小面积");
                                if (isNaN(maxGpri)) {
                                    if (minGpri <= maxprice && Garea <= maxarea) {
                                        rent_locations.add(item.split(",")[1]);
                                    }

                                } else {
                                    if (maxGpri <= maxprice && Garea >= minarea && Garea <= maxarea) {
                                        rent_locations.add(item.split(",")[1]);
                                    }
                                }
                            } else {
                                // 最高价格不为空，只有最小面积
                                if ((!isNaN(minarea)) && isNaN(maxarea)) {
                                    //alert("最低价格为空，最高价格不为空，有小面积，没大面积");
                                    if (minGpri >= minprice && Garea >= minarea) {
                                        rent_locations.add(item.split(",")[1]);
                                    }
                                }
                                //最低价格不为空，只有最大面积
                                if (isNaN(minarea) && (!isNaN(maxarea))) {
                                    // alert("最低价格为空，最高价格不为空，没有小面积，有大面积");
                                    if (minGpri >= minprice && Garea <= maxarea) {
                                        rent_locations.add(item.split(",")[1]);
                                    }
                                }
                                //最低价格下，没有面积数据
                                if (isNaN(minarea) && isNaN(maxarea)) {
                                    // alert("最低价格为空，最高价格不为空，没有面积");
                                    if (minGpri >= minprice) {
                                        rent_locations.add(item.split(",")[1]);
                                    }
                                }

                            }

                        }

                        //最高价格和最低价格都为空的情况

                        if (isNaN(minprice) && isNaN(maxprice)) {
                            //最高价格不为空，面积全满
                            if ((!isNaN(minarea)) && (!isNaN(maxarea))) {
                                //alert("价格都为空，面积都有");
                                if (Garea >= minarea && Garea <= maxarea) {
                                    rent_locations.add(item.split(",")[1]);
                                }
                            } else {
                                // 只有最小面积
                                if ((!isNaN(minarea)) && isNaN(maxarea)) {
                                    //  alert("价格都为空，有小面积，没有大面积");
                                    if (Garea >= minarea) {
                                        rent_locations.add(item.split(",")[1]);
                                    }
                                }
                                //只有最大面积
                                if (isNaN(minarea) && (!isNaN(maxarea))) {
                                    // alert("价格都为空，没有小面积，只有大面积");
                                    if (Garea <= maxarea) {
                                        rent_locations.add(item.split(",")[1]);
                                    }
                                }
                            }
                        }

                        //价格都不为空的情况
                        if ((!isNaN(minprice)) && (!isNaN(maxprice))) {
                            //alert("最低价格为不为空,z");
                            //最低价格不为空，面积全满
                            if ((!isNaN(minarea)) && isNaN(maxarea)) {
                                //alert("有大小价格，最小面积不为空，最大面积为空");
                                if (isNaN(maxGpri)) {
                                    if (minGpri > minprice && minGpri < maxprice && Garea >= minarea) {
                                        rent_locations.add(item.split(",")[1]);
                                    }

                                } else {
                                    if (minGpri > minprice && maxGpri < maxprice && minGpri >= minprice && Garea >= minarea) {
                                        rent_locations.add(item.split(",")[1]);
                                    }
                                }
                            }
                            //最低价格不为空，只有最大面积
                            if (isNaN(minarea) && (!isNaN(maxarea))) {
                                //alert("有大小价格，最小面积为空，最大面积不为空");
                                if (isNaN(maxGpri)) {
                                    if (minGpri > minprice && minGpri < maxprice && Garea <= maxarea) {
                                        rent_locations.add(item.split(",")[1]);
                                    }
                                } else {
                                    if (minGpri > minprice && maxGpri < maxprice && minGpri >= minprice && Garea <= maxarea) {
                                        rent_locations.add(item.split(",")[1]);
                                    }
                                }
                            }
                            //最低价格下，没有面积数据
                            if (isNaN(minarea) && isNaN(maxarea)) {
                                //alert("有大小价格，没有面积");
                                if (isNaN(maxGpri)) {
                                    if (minGpri > minprice && minGpri < maxprice) {
                                        rent_locations.add(item.split(",")[1]);
                                    }
                                } else {
                                    if (minGpri > minprice && maxGpri < maxprice) {
                                        rent_locations.add(item.split(",")[1]);
                                    }
                                }
                            }
                        }
                    }
                } else {
                    //alert("条件为空");
                    //没有条件 直接显示全部
                    rent_locations.add(item.split(",")[1]);
                }
            });
            //alert("这是所有房源信息");
            // console.log(rent_locations);
            //console.log(rent_locations);
            //获取各个房源信息的经纬度  by  Ray
            rent_locations.forEach(function (element, index) {
                geocoder.getLocation(element, function (status, result) {
                    if (status === 'complete' && result.info === 'OK') {
                        dis.push(new placeDis(element, workjingwei.distance(result.geocodes[0].location), result.geocodes[0].location));
                    }
                });
                //加上房源标记
                addMarkerByAddress(element);
            });
            // alert("这是最新的。" + dis[2].dist);
            Sorted();
            var addd = document.getElementById("addd");
            addd.innerHTML = "";
            addd.innerHTML = "<br>";
            for (var j = 1; j < 6; j++) {
                //alert("hi");
                addd.innerHTML += dis[j].plase + ":" + dis[j].dist + "<br>";
            }
        }
    )
}

//排序函数
function Sorted() {

    //alert("这是排序哦");
    dis.sort(function (a, b) {
        return a.dist - b.dist;
    });

    //alert(typeof(dis[1]));
    // alert(dis[1].dist);

    //
    // for (var v in dis) {
    //     alert("hhh");
    //     alert(v);
    //     alert(dis[v]);
    // }

    //
    // console.log(dis);
    //alert(dis["placeDis"]);
    //console.log(dis[1][2]);
    // alert("第一个数据de"+placeDis);
    // for (var i = 0; i < 5; i++) {
    //     //alert("这是数据框" + dis[i]);
    //     //addd.innerHTML += dis[i];
    // }    //addd.innerHTML = "";
}

//地图中添加地图操作ToolBar插件地图中添加地图操作ToolBar插件地图中添加地图操作ToolBar插件
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
            return data['city'];
        }
    });
}
//解析定位错误信息
function onError(data) {
    document.getElementById('tip').innerHTML = '定位失败';
}
function onComplete(data) {
    document.getElementById('tip').innerHTML = '定位失败';
}
