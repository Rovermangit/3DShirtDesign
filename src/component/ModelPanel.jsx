import * as THREE from 'three';
import React from 'react';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { ChangePart } from './ChangePart';
import { EditPanel } from './EditPanel';
import { fabric } from 'fabric';
import { Select,message,Dropdown,Rate,Divider, Button,Modal,Form,Input,Space,Switch,InputNumber,notification } from 'antd';
import { debounce } from 'lodash';
import { nanoid } from 'nanoid';
import { picData } from '../data/picData';
// import { connect} from 'react-redux';
// import Stats from 'stats-js';
import "../css/ModelPanel.css";
import { ColorPanel } from './ColorPanel';
import TreeComponent from './TreeComponent';
import PatternPanel from './PatternPanel';
import axios from 'axios';
import { Link } from 'react-router-dom';
const host = 'http://localhost:4444'
const { Option } = Select;
//在保存为json格式时仍然包含的属性并不包含一些需要包含的关键属性，故需要进行拓展
fabric.Object.prototype.toObject = (function (toObject) {
    return function () {
        return fabric.util.object.extend(toObject.call(this), {
            id:this.id,
            _myType:this._myType,
            selectable:this.selectable,
            key:this.key,
            _myPrice:this._myPrice,
            text:this.text,
            fontFamily:this.fontFamily,
            fontWeight:this.fontWeight,
            fontStyle:this.fontStyle,
            underline:this.underline,
            linethrough:this.linethrough,
        });
    };
})(fabric.Object.prototype.toObject);

//设置选框样式
fabric.Object.prototype.cornerStyle = 'circle';
fabric.Object.prototype.cornerColor = 'white';
fabric.Object.prototype.cornerSize = 10;
//！！！当前仅限根目录节点选择操作！！！
export default class ModelControl extends React.Component {
    init3DScene = () => {
        //初始化场景
        this.scene = new THREE.Scene();
        //初始化相机
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 5000);
        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.camera.position.z = 200;
        this.camera.lookAt(this.scene.position);
        //初始化状态管理器
        // this.stats = new Stats();
        // document.body.appendChild(this.stats['dom']);
        this.textureloader = new THREE.TextureLoader();
        //初始化时钟工具
        this.clock = new THREE.Clock();
        //初始化显示模型
        this.scene.clear();
        this.gltfLoader = new GLTFLoader();
        this.dracoLoader = new DRACOLoader();
        this.dracoLoader.setPath('./draco-master');
        this.gltfLoader.setDRACOLoader(this.dracoLoader);
        this.gltfLoader.load('static/formal2.gltf', (gltf) => {
            gltf.scene.position.set(0, 0, 0);
            gltf.scene.scale.set(75, 75, 75);
            gltf.scene.traverse(function (child) {
                if (child.isMesh) {
                    return;
                }
            })
            this.shirt = new THREE.Group();
            this.shirt.castShadow = true;
            this.shirt.receiveShadow = true;
            this.shirt.add(gltf.scene);
            this.scene.add(this.shirt);
            //初始化模型图案
            this.setShirtTexture();
        })
        //初始化基础灯源
        this.scene.add(new THREE.AmbientLight(0xdddddd));
        //添加聚光灯光源
        const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, .7);
        hemisphereLight.position.set(0, 0, 750);
        this.scene.add(hemisphereLight);
        //初始化渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true,preserveDrawingBuffer: true });
        const renderer = this.renderer;
        renderer.setSize(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
        //设置渲染器阴影效果
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        //设置背景色
        renderer.setClearColor(new THREE.Color('rgb(242,242,242)'))
        document.querySelector("#right_ope_box").appendChild(renderer.domElement);
        //初始化轨迹球控制器
        this.trackballcontrols = new TrackballControls(this.camera, renderer.domElement);
        const trackballControls = this.trackballcontrols;
        trackballControls.rotateSpeed = 3.0;
        trackballControls.zoomSpeed = 1;
        trackballControls.panSpeed = 1;
        trackballControls.noZoom = false;
        trackballControls.noPan = false;
        trackballControls.dynamicDampingFactor = 0.3
        trackballControls.keys = [65, 83, 68];
    }
    //3d场景渲染函数
    myRender = () => {
        this.trackballcontrols.update(this.clock.getDelta())
        // this.stats.update();
        let {isRotatingModel} = this.state;
        if(isRotatingModel) this.shirt && this.shirt.rotateY(0.01);
        requestAnimationFrame(this.myRender);
        this.renderer.render(this.scene, this.camera);
    }
    //监听窗口变化函数
    onWindowResize = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
    }
    //组件挂载完成执行的回调函数
    async componentDidMount() {
        //设置随机初始卫衣
        let shirts = ['SWBLJYL','SWHOSLJ','SWBQMLJ','SWBZXDM'];
        this.setState({shirtid:shirts[parseInt(Math.random()*4)]},()=>{
            this.setInitialPrice();
            this.init3DScene();
            this.myRender();
            document.addEventListener('resize', this.onWindowResize, false);
            this.create2dEditPanel();
            this.setShirtTexture = debounce(this.setShirtTexture,100);
            this.addTextContent = debounce(this.addTextContent,400);
            this.addShirtPattern = debounce(this.addShirtPattern,400);
            this.inputChangeElemPos = debounce(this.inputChangeElemPos,100);
        })
    }
    //组件卸载前执行的回调函数
    componentWillUnmount() {
        document.removeEventListener('resize', this.onWindowResize);
    }
    //获取当前用户所有购买的图片，并加入至用户已购图片中
    getCurUserImgs =()=>{
        let {user,oDataForPicChg} = this.state;
        axios.get(`${host}/getUserImgsData`,{
            params:{
                userid:user.userid
            }
        }).then((res)=>{
            let {data} = res;
            data = data.map(item=>{
                item.tempUpload = true;
                item.hoverIfo = item.imgname;
                item.title = item.imgname;
                item.userType = 1;
                item.src = `${host}/getStaSource?sourceUrl=${item.imgurl}`;
                item.value = item.src;
                item.isOriginImg = true;
                return item;
            });
            let newPicData =  data.concat(picData);
            this.setState({oDataForPicChg:{...oDataForPicChg,data:newPicData}});
        })
    }
    state = {
        leftExpandIcon: 'left_panel_close.svg',
        leftExpandState: true,
        user: {},
        oDataForViewChg: {
            showType: 0,
            itemsPerRow: 4,
            onlyOfficial: true,
            canBeUpload: false,
            data: [
                { src: 'picForDirection/front_view.svg', title: '正视图', hoverIfo: '正视图', userType: 0, value: 'front' },
                { src: 'picForDirection/back_view.svg', title: '后视图', hoverIfo: '后视图', userType: 0, value: 'back' },
                { src: 'picForDirection/left_view.svg', title: '左视图', hoverIfo: '左视图', userType: 0, value: 'left' },
                { src: 'picForDirection/right_view.svg', title: '右视图', hoverIfo: '右视图', userType: 0, value: 'right' },
            ]
        },
        oDataForModelChg: {
            showType: 0,
            itemsPerRow: 4,
            onlyOfficial: true,
            canBeUpload: false,
            onClickFn: (values)=>{this.openEditPanel(values)},
            data: [
                { src: 'picForModel/polo_shirt.svg', title: 'POLO衫', hoverIfo: 'Polo衫', userType: 0, value: 'polo_shirt' },
                { src: 'picForModel/T-shirt.svg', title: 'T恤', hoverIfo: 'T恤', userType: 0, value: 'T_shirt' },
                { src: 'picForModel/sweater.svg', title: '卫衣', hoverIfo: '卫衣', userType: 0, value: 'sweater' },
                { src: 'picForModel/overcoat.svg', title: '外套', hoverIfo: '外套', userType: 0, value: 'overcoat' },
                { src: 'picForModel/pants.svg', title: '休闲裤', hoverIfo: '休闲裤', userType: 0, value: 'pant' },
                { src: 'picForModel/socks.svg', title: '袜子', hoverIfo: '袜子', userType: 0, value: 'socks' },
                { src: 'picForModel/hat.svg', title: '帽子', hoverIfo: '帽子', userType: 0, value: 'hat' },
                { src: 'picForModel/gloves.svg', title: '手套', hoverIfo: '手套', userType: 0, value: 'golves' },
            ]
        },
        oDataForPicChg: {
            showType: 0,
            itemsPerRow: 4,
            onlyOfficial: false,
            canBeUpload: true,
            onClickFn: (values)=>{this.addShirtPattern(values)},
            uploadSource: 'image',
            data: picData
        },
        oDataForTextAdd: {
            showType: 0,
            itemsPerRow: 0,
            onlyOfficial: true,
            canBeUpload: false,
            onClickFn: (values)=>this.addTextContent(values),
            isOddContent: true
        },
        oDataForMyProject: {
            showType: 0,
            itemsPerRow: 4,
            onlyOfficial: false,
            canBeUpload: true,
            uploadSource: 'json',
            data:[],
            onClickFn: (values)=>this.openExistsProject(values),
        },
        myData: [],
        cancelSelectedType:'canvas',
        clipBoard: [],
        oddEditOptions:[
            { title: '合成', onPressKey: 'Ctrl + M', key: 'KeyM', info: '合并当前所选节点及其子节点图层',onClickFn:'combineCurPic'},
            { title: '隐藏/显示', onPressKey: 'Ctrl + H', key: 'KeyH', info: '隐藏/显示当前所选节点及其子节点图层',onClickFn:'hideCurPic'},
            { title: '导出', onPressKey: 'Ctrl + E', key: 'KeyE', info: '导出时默认合并所有未隐藏图层进行导出',onClickFn:'exportCurPic'},
            { title: '申请专利', onPressKey: 'Ctrl + T', key: 'KeyT', info: '请合并为同一图案后再申请专利',onClickFn:'applyCurPic'},
            { title: '保存项目', onPressKey: 'Ctrl + S', key: 'KeyS', info: '保存当前项目',onClickFn:'saveCurProject'},
        ],
        //创建图案或文字元素后的索引值
        imgIdx:0,
        textIdx:0,
        //选择框选项设置
        curElementOptions:[
            { title:'颜色',value:'color'},
            { title:'图案(仅文本)',value:'pattern'}
        ],
        curElementBgType:{ title:'颜色',value:'color'},
        curElementPic:null,
        curElementColor:'#000',
        curElementData:{x:0,y:0,angle:0,sizeX:0,sizeY:0},
        //点击用户头像后显示的内容块
        dropDownItems:[
            {key:'dropItem_1',src:require("../pic/ModelPanel/self_detail.svg").default,title:'个人信息',onclick:()=>this.jumpLink2.click()},
            {key:'dropItem_2',src:require("../pic/ModelPanel/message_detail.svg").default,title:'我的消息',onclick:()=>this.jumpLink2.click()},
            {key:'dropItem_3',src:require("../pic/ModelPanel/project_detail.svg").default,title:'我的项目',onclick:()=>this.jumpLink2.click()},
            {key:'dropItem_4',src:require("../pic/ModelPanel/collect_detail.svg").default,title:'我的收藏',onclick:()=>this.jumpLink2.click()},
            {key:'dropItem_5',src:require("../pic/ModelPanel/selfdetail_imgs.svg").default,title:'我的图案',onclick:()=>this.jumpLink2.click()},
            {key:'dropItem_6',src:require("../pic/ModelPanel/login_out.svg").default,title:'退出登录',onclick:()=>this.loginOutFn()},
        ],
        //项目保存面板状态
        saveModalOpenStatus:false,
        //保存面板中预览图片数据
        curProjectPreImg:'',
        //当前操作的项目
        curOpeObject:{},
        //仅选用一个模型，故默认设置T恤为定值
        shirtid:'',
        //当前项目总价格
        curPrice:0.00,
        //版权审核通过后打开的面板状态与成功的数据
        applyPicModalOpenStatus:false,
        curApplyPic:{},
        web3:{},
        isRotatingModel:false,
        cameraTargetPos: {
            front: {
                x: 0, z: 200, y: 0
            },
            left: {
                x: -200, z: 0, y: 0
            },
            right: {
                x: 200, z: 0, y: 0
            },
            back: {
                x: 0, z: -200, y: 0
            }
        },
    }
    //移动镜头到指定位置
    animateCamera = (direction)=>{
        let {cameraTargetPos} = this.state;
        this.camera.position.x = cameraTargetPos[direction].x;
        this.camera.position.y = cameraTargetPos[direction].y;
        this.camera.position.z = cameraTargetPos[direction].z;
        this.camera.lookAt(this.scene.position);
        this.trackballcontrols.update();
    }
    //改变模型旋转状态
    changeModelRotating = ()=>{
        let {isRotatingModel} = this.state;
        this.setState({isRotatingModel:!isRotatingModel});
    }
    //初始获取当前用户所有项目数据
    getCurUserProjectData = ()=>{
        let {user,oDataForMyProject} = this.state;
        if(JSON.stringify(user) === '{}')return;
        else
            axios.get(`${host}/getUserProject`,{
                params:{userid:user.userid}
            }).then((res)=>{
                let {data} = res;
                if(data.length === 0)return;
                for(let perObj of data){
                    oDataForMyProject.data.push({src:'project.svg',title:perObj.projectname,hoverIfo:perObj.projectname,userType:0,value:JSON.stringify(perObj)});
                }
                this.setState({oDataForMyProject});
            })
    }
    //设置初始价格
    setInitialPrice = ()=>{
        let {shirtid} = this.state;
        axios.get(`${host}/getSomeShirt`,{
            params:{
                shirtid
            }
        }).then((res)=>{
            this.setState({curPrice:res.data[0].price});
        })
    }
    //退出当前账号登录
    loginOutFn = () => {
        let user = {};
        localStorage.removeItem("commonUserData");
        this.setState({ user }, () => {
            this.jumpLink.click();
        })
    }
    //切换左部操作栏显示状态
    changeLeftPanel = () => {
        this.setState(state => {
            this.canvas.renderAndReset();
            
            state.leftExpandState = !state.leftExpandState;
            if (state.leftExpandState) state.leftExpandIcon = 'left_panel_close.svg';
            else state.leftExpandIcon = 'left_panel_open.svg';
            return state;
        })
    }
    //打开切换衣衫样式框
    openEditPanel = () => {
        const editPanel = this.editPanel;
        editPanel.showModal();
    }
    //创建2d编辑画布栏
    create2dEditPanel = () => {
        //初始化画布加载图片
        if (!this.canvas) this.canvas = new fabric.Canvas("modal_canvas", {
            width: 620,
            height: 620,
        });
        fabric.Object.prototype.transparentCorners = false;
        let canvas = this.canvas;
        //模拟当前衣衫的部分图导入
        this.modelParts = [
            { src: "front_body.png", key: 'front_body', title: "衣衫前身" },
            { src: "back_body.png", key: 'back_body', title: "衣衫后背" },
            { src: "left_arm.png", key: 'left_arm', title: "衣衫左臂" },
            { src: "right_arm.png", key: 'right_arm', title: "衣衫右臂" },
            { src: "front_body_pocket.png", key: 'front_body_pocket', title: "衣衫前胸口袋" },
        ]
        //重置当前选中部分为模拟数据第一项
        this.setState(state => {
            state.curShirtPartInput = this.modelParts[0].title;
            state.curShirtPart = this.modelParts[0];
            return state;
        })
        //获取临时颜色
        for (let picItem of this.modelParts) {
            fabric.Image.fromURL(require(`../modal/${picItem.src}`), function (newImg) {
                //以2k图像导出后以0.302尺寸缩放处理图像较为准确
                newImg.scale(0.303);
                newImg.id = picItem.key;
                newImg._myType = 'modelPart';
                newImg.set('selectable', false);
                newImg.filters = [new fabric.Image.filters.BlendColor({
                    color:"#9d9d9d",
                    mode: 'tint',
                })]
                newImg.applyFilters();
                canvas.add(newImg);
            })
        }
        //取消所有选择后触发
        //存在快速操作的bug
        canvas.on("selection:cleared", _ => {
            let {cancelSelectedType,curElementData} = this.state;
            if(cancelSelectedType !== 'tree'){
                this.setShirtTexture();
                this.treeComponent.setSelectedData([]);
            }else{
                cancelSelectedType = 'canvas';
                this.setState({cancelSelectedType});
            }
            curElementData = {x:0,y:0,angle:0,sizeX:0,sizeY:0}
            this.setState({curElementData});
        })
        const updateSelectedData = ()=>{
            let objects = canvas.getActiveObjects();
            //若此时仅选中一个元素才进行背景颜色缩略框重新调整
            if(objects.length === 1){
                let {curElementColor} = this.state;
                let object = objects[0];
                //若当前元素类别为图片或者为组的话，且存在filters（即变换过颜色），则赋值为当前元素的filters的颜色
                if((object._myType === 'pattern' || object._myType === 'group') && object.filters && object.filters.length !== 0)
                    curElementColor = object.filters[0].color;
                //若为文本类别为文本，则直接获取它的fill属性
                else if(object._myType === 'text')
                    curElementColor = object.fillType === 'color'?object.fill:'#000000';
                //其他情况默认为黑色
                else
                    curElementColor = '#000000';
                //选择元素改变后，缩略框颜色的调整需重新反馈要颜色组件上
                let color = curElementColor;
                let colorInput = color;
                this.elemBgColorPanel.setState({color,colorInput});
                this.setState({curElementColor});
            }
            //获取当前选中元素的属性值赋值到左侧内容显示框
            let object = canvas.getActiveObject();
            let {curElementData} = this.state;
            let {angle,x,y,sizeX,sizeY} = curElementData;
            angle = object.angle.toFixed(1);
            x = object.left.toFixed(2);
            y = object.top.toFixed(2);
            sizeX = (object.width * object.scaleX).toFixed(2);
            sizeY = (object.height * object.scaleY).toFixed(2);
            curElementData = {x,y,angle,sizeX,sizeY};
            this.setState({curElementData});

            let data = [];
            for(let object of objects){
                if(object.key)data.push(object.key);
            }
            this.treeComponent.setSelectedData(data);
        }
        //监听选中元素变形时的函数
        canvas.on("object:scaling",_=>{
            let {curElementData} = this.state;
            let object = canvas.getActiveObject();
            curElementData.x = object.left.toFixed(2);
            curElementData.y = object.top.toFixed(2);
            curElementData.sizeX = (object.width * object.scaleX).toFixed(2);
            curElementData.sizeY = (object.height * object.scaleY).toFixed(2);
            this.setState({curElementData});
        })
        //监听选中元素旋转时的函数
        canvas.on("object:rotating",_=>{
            let {curElementData} = this.state;
            let object = canvas.getActiveObject();
            curElementData.x = object.left.toFixed(2);
            curElementData.y = object.top.toFixed(2);
            curElementData.angle = object.angle.toFixed(1);
            this.setState({curElementData});
        })
        //监听选中元素移动时的函数
        canvas.on("object:moving",_=>{
            let {curElementData} = this.state;
            let object = canvas.getActiveObject();
            curElementData.x = object.left.toFixed(2);
            curElementData.y = object.top.toFixed(2);
            this.setState({curElementData});
        })
        //切换选中项后的数据更新
        canvas.on("selection:updated",_=>updateSelectedData())
        //最初选中时的seleted数据更新
        canvas.on("selection:created",_=>updateSelectedData())
        
    }
    //重新将贴图渲染到模型上
    setShirtTexture = () => {
        let canvas = document.getElementById("modal_canvas");
        //取消当前所选项
        this.canvas.discardActiveObject()
        let texture = this.textureloader.load(canvas.toDataURL("image/png"));
        //阻止图片加载后进行Y轴翻转
        texture.flipY = false;
        this.shirt.traverse(function (child) {
            if (child.material) {
                child.material.map = texture;
            }
        })
    }
    //添加贴图到模型上
    addShirtPattern = (imgData) => {
        const canvas = this.canvas;
        let {imgIdx,curPrice} = this.state;
        let {dataSrc,isOfficial,isOriginImg} = imgData;
        new Promise(resolve=>{
            if(isOfficial){
                dataSrc = require(`../pic/ModelPanel/${dataSrc}`);
                resolve(dataSrc);
            }else if(isOriginImg){
                axios.get(dataSrc.substring(3),{responseType:'blob'}).then(res=>{
                    let tempReader = new FileReader();
                    tempReader.readAsDataURL(res.data);
                    tempReader.onload = (e)=>{
                        dataSrc = e.target.result;
                        resolve(dataSrc);
                    }
                })
            }else{
                dataSrc = dataSrc.substring(3);
                resolve(dataSrc);
            }
        }).then(()=>{
            //判别当前图片数据是网站自带图片数据还是用户临时自上传图片，若为自上传则已在图片数据最开始处增加了@@@字符串
            fabric.Image.fromURL((dataSrc), (img)=>{
                if (img.width > 50 || img.height > 50) img.scale(0.5);
                curPrice += 5.5;
                img._myPrice = 5.5;
                //设置img的key为唯一标识
                img.key = nanoid();
                imgIdx += 1;
                img.title = '图案_'+imgIdx;
                img._myType = 'pattern';
                canvas.add(img);
                canvas.centerObject(img);
                canvas.setActiveObject(img);
                let object = {key:img.key,title:img.title,isLeaf:true};
                this.treeComponent.addTreeData((object));
                this.setState({imgIdx,curPrice});
            })
            canvas.renderAll();
        })
    }
    //切换图案的颜色
    changeTextureColor = (value) => {
        const canvas = this.canvas;
        //获取当前选中图层
        let selectObjs = canvas.getActiveObjects();
        //循环遍历对象更改图层颜色
        //后期还需要判断对象是否为img还是canvas对象
        selectObjs.forEach((obj) => {
            obj.filters = [];
            obj.filters.push(new fabric.Image.filters.BlendColor({
                color: value,
                mode: 'tint',
            }))
            obj.applyFilters();
            canvas.renderAll();
        })
    }
    //修改衣衫部分颜色函数
    changeShirtPartColor = (value) => {
        let {curShirtPart} = this.state;
        let color = value;
        const canvas = this.canvas;
        let objects = canvas.getObjects();
        //对于img元素，改变颜色需遍历画布所有元素
        //查找符合key（或id）的元素后在filters层上进行颜色的添加
        let curPart;
        for (let object of objects) {
            if (object.id === curShirtPart.key) {
                curPart = object;
                break;
            }
        }
        if(curPart.filters.length !== 0){
            curPart.filters[0].color = color;
        }else{
            curPart.filters = [];
            curPart.filters.push(new fabric.Image.filters.BlendColor({
                color: color,
                mode: 'tint',
            }))
        }
        
        //modalParts数据的color属性的增改,否则之后select切换后所传递的数据将不包含color属性
        let modelParts = this.modelParts;
        for(let idx in modelParts){
            if(modelParts[idx].key === curShirtPart.key){
                modelParts[idx].color = color;
                break;
            }
        }
        curShirtPart = {...curShirtPart,color};
        //同时需对当前的curShirtPart进行颜色的更改，触发页面更新
        this.setState({curShirtPart});
        curPart.applyFilters();
        canvas.renderAll();
        this.setShirtTexture();
    }
    //处理切换选中衣衫部分后的内容显示
    handleSelectChange = (value) => {
        //由于所传数据为json所转stringify数据，故需要转为对象后再进行赋值
        value = JSON.parse(value);
        //各个部分的衣衫颜色都不相同，所以在切换时应根据当前所选部分进行颜色重赋值
        const that = this.colorPanel;
        this.setState(state => {
            state.curShirtPartInput = value.title;
            //赋值为当前选中衣衫部分
            state.curShirtPart = value;
            that.setState(state=>{
                state.color = value.color?value.color:'#000000';
                state.colorInput = state.color;
                return state;
            })
            return state;
        })
    }
    //添加文本内容块
    addTextContent = (text) => {
        //接受子组件传递的iText对象，根据画布需进行重新调整
        const canvas = this.canvas;
        let {textIdx,curPrice} = this.state;
        //克隆元素的正确方法，利用clone方法后得到cloned进行克隆
        curPrice += 4;
        let Text = new fabric.IText(text.text,{
            fontFamily:text.fontFamily,
            fontWeight:text.fontWeight,
            fontStyle:text.fontStyle,
            underline:text.underline,
            linethrough:text.linethrough,
            selectable:true,
            fill:text.fill,
            scaleX:1,
            scaleY:1
        })
        Text._myType = 'text';
        Text._myPrice = 4;
        Text.key = nanoid();
        textIdx += 1;
        canvas.add(Text);
        //中心化元素，并选中该元素
        canvas.centerObject(Text);
        canvas.setActiveObject(Text);
        canvas.renderAll();
        //添加到树结构数据中
        let object = {key:Text.key,title:'文本_'+textIdx,isLeaf:true};
        this.treeComponent.addTreeData((object));
        this.setState({textIdx,curPrice});
    }
    //选中节点后图层也选中的操作
    selectedFn = (data)=>{
        let canvas = this.canvas;
        //仅在根目录下寻找节点
        let allObjects = canvas.getObjects();
        let objects = [];
        for(let object of allObjects){
            for(let idx in data){
                if(object.key === data[idx]){
                    data.splice(idx,1);
                    objects.push(object);
                    break;
                }
            }
        }
        //此处存在bug
        //（暂无良好的解决方法，仅以cancelSelectedType作为状态标记，记录当前选中为树节点
        //点击后所遍历的新节点要清空原节点才可添加，否则将出现图层选择范围混乱的严重错误
        //而清空所选项将触发canvas的cleared事件，此事件中绑定了将UV图渲染到模型的函数
        //此时清空后会两次触发该函数
        let {cancelSelectedType} = this.state;
        cancelSelectedType = 'tree';
        this.setState({cancelSelectedType});
        if(objects.length !== 0){
            //清空已有节点，防止节点选择混乱
            canvas.discardActiveObject();
            //添加新选中项
            let object = new fabric.ActiveSelection((objects),{canvas:canvas})
            canvas.setActiveObject(object).renderAll();
        }
    }
    //树操作后的数据回调
    treeEditCallBack = (data)=>{
        //树结构的所有调整将通过该函数重新反馈到图层数据中
        //复制数据
        const {type,targetKeys,copyKeys,myData} = data;
        let canvas = this.canvas;
        let {clipBoard,curPrice} = this.state;
        switch(type){
            case 'clipNode':
                if(!targetKeys || targetKeys.length === 0)return;
                //获取当前选中图层
                let {objects,parentNodes} = this.loopCheckCanvas(targetKeys);
                //移除图层，并加入到粘贴板中
                for(let idx in objects){
                    clipBoard.push(objects[idx]);
                    if(parentNodes[idx]) parentNodes[idx].removeWithUpdate(objects[idx]);
                    else canvas.remove(objects[idx]);
                }
                //清空当前所选项
                canvas.discardActiveObject();
                break;
            case 'pasteNode':
                let pasteObjects = null;
                let clipFlag = false;
                //判断粘贴板是否为空，若为空，则为复制
                if(clipBoard.length === 0){
                    pasteObjects = this.loopCheckCanvas(copyKeys).objects;
                }else{
                    pasteObjects = clipBoard;
                    clipFlag = true;
                }
                //循环遍历重新赋key，用于与树数据对接
                const loop = (data,copy)=>{
                    if(!data)return;
                    for(let idx in data){
                        //存在组复制bug，暂无法修复
                        //原因：若使用js深拷贝所生成的对象不为fabric特有的klass对象，将无法被识别
                        //若不进行深拷贝。所克隆的对象反馈的key变换将反馈到原对象上
                        data[idx] = fabric.util.object.clone(data[idx]);
                        data[idx].key = copy[idx].key;
                        loop(data[idx]._objects,copy[idx].children);
                    }
                }
                //targetKeys存储当前到复制到的目标路径，可进行多选
                for(let idx1 in targetKeys){
                    let parentNode = null;
                    let isRoot = false;
                    if(targetKeys[idx1] === '__root__'){
                        isRoot = true;
                        parentNode = canvas;
                    }else{
                        parentNode = this.loopCheckCanvas([targetKeys[idx1]]).objects[0];
                    }
                    //查看是否为剪切，且若存在多选情况，则第一个为剪切内容（key不变）
                    //第二项开始即为复制内容（key根据树数据进行重新赋值）
                    if(!clipFlag){
                        //循环遍历重置key
                        loop(pasteObjects,myData[idx1]);
                    }
                    //将新增节点添加到目标节点，同时添加新增标记
                    //设置临时价格标记，用于与初始价格相加得出当前价格
                    for(let object of pasteObjects){
                        object.isNew = true;
                        curPrice += object._myPrice;
                        if(isRoot)parentNode.add(object);
                        else parentNode.addWithUpdate(object);
                    }
                    clipFlag = false;
                }
                //遍历所有元素，根据新增标记居中显示新增节点
                let allObjects = canvas.getObjects();
                for(let object of allObjects){
                    if(object.isNew){
                        object.isNew = false;
                        canvas.centerObject(object);
                    }
                }
                //清空剪切板，防止剪切一次后粘贴两次而出现重复key现象
                clipBoard = [];
                canvas.renderAll();
                break;
            case 'deleteNode':
                let delData = this.loopCheckCanvas(targetKeys);
                let delObjects = delData.objects;
                let delParents = delData.parentNodes;
                for(let idx in delObjects){
                    if(!delParents[idx])canvas.remove(delObjects[idx]);
                    else{
                        delParents[idx].removeWithUpdate(delObjects[idx]);
                    }
                    curPrice -= delObjects[idx]._myPrice;
                }
                canvas.discardActiveObject();
                canvas.renderAll();
                break;
            case 'reGroupNode':
                let {parentKey} = data;
                let reGroupObjects = clipBoard;
                let groupPrice = 0.00;
                for(let object of reGroupObjects){
                    groupPrice += object._myPrice;
                }
                let newGroup = new fabric.Group(reGroupObjects,{canvas:canvas,key:parentKey});
                newGroup._myType = 'group';
                newGroup._myPrice = groupPrice;
                //仅在根目录添加（后续可进行进一步改动）
                canvas.add(newGroup);
                canvas.setActiveObject(newGroup);
                canvas.centerObject(newGroup);
                canvas.renderAll();
                clipBoard = [];
                break;
            default:
                return;
        }
        this.setState({clipBoard,curPrice});
    }
    //循环遍历查找节点
    loopCheckCanvas = (data)=>{
        let objects = [];
        let parentNodes = [];
        let len = data.length;
        let allObjects = this.canvas.getObjects();
        const loop = (allObjects,parentNode)=>{
        if(objects.length === len || !allObjects)return ;
            for(let curNode of allObjects){
                for(let idx in data){
                    if(data[idx] === curNode.key){
                        //当找到符合条件的数据后，同时删除data中符合的数据，减少遍历过程
                        data.splice(idx,1);
                        objects.push(curNode);
                        parentNodes.push(parentNode);
                        break;
                    }else{
                        loop(curNode._objects,curNode);
                    }
                }
            }
        }
        loop(allObjects,null);
        return {objects,parentNodes};
    }
    //用于解决右键菜单点击后触发传入TreePanel中的右键函数
    switchExecuteOddFn = (value)=>{
        switch(value){
            case 'combineCurPic':
                this.combineCurPic();
                break;
            case 'hideCurPic':
                this.hideCurPic();
                break;
            case 'exportCurPic':
                this.exportCurPic();
                break;
            case 'applyCurPic':
                // this.applyCurPic();
                break;
            case 'saveCurProject':
                this.saveCurProject();
                break;
            default:
                return;
        }
        //操作完成后统一
        this.treeComponent.closeTreeEdit();
        this.canvas.renderAll();
    }
    //合并图层
    combineCurPic = ()=>{
        const canvas = this.canvas;
        //获取当前选中项，获取指定项合并后添加到根目录下
        let objects = canvas.getActiveObjects();
        //获取可合并节点key（若不存在子节点则不予以合并）
        let selectKeys = [];
        for(let object of objects){
            if(object._objects && object._objects.length !== 0){
                //合并图层并将其添加到节点树与canvas中
                let imgSrc = '@@@'+object.toDataURL("image/png");
                selectKeys.push(object.key);
                this.addShirtPattern(imgSrc);
            }
        }
        //删除合并节点
        this.treeComponent.deleteCurNode(selectKeys);
    }
    //显示/隐藏元素
    hideCurPic = ()=>{
        const canvas = this.canvas;
        let objects = canvas.getActiveObjects();
        let hideFlag = true;
        //遍历所选节点，查看所选节点是否存在已隐藏元素，若存在则触发该函数时将默认先显示所有图层
        //若不存在则所有元素透明度设置为0
        for(let object of objects){
            if(object.opacity !== 1){
                hideFlag = false;
                break;
            }
        }
        objects.map(item=>{
            item.opacity = hideFlag?0:1;
            return item;
        })
        //取消当前所选元素
        canvas.discardActiveObject();
        canvas.renderAll();
    }
    //导出图层函数
    exportCurPic = (flag)=>{
        let canvas = this.canvas;
        let visPics = [];
        let objects = canvas.getObjects();
        let pos = [];
        let selections = [];
        let picData;
        for(let object of objects){
            //遍历所有图层元素，获取当前显示且不为底层元素为导出图层
            if(object.key && object.opacity === 1){
                visPics.push(object);
                //由于添加到Group中时会因Group的位置致使位置进行相对偏移
                //故需要先行存储原有位置
                pos.push({left:object.left,top:object.top});
            }
        }
        //将导出图层以二进制流形式导入临时a标签中，并点击以进行下载
        picData = canvas.toDataURL("image/jpeg");
        this.getBlob(picData).then(blob=>{
            if(!flag)this.saveAs(blob,'未命名导出图层');
        });
        //将位置数据赋回原有元素
        for(let idx in visPics){
            visPics[idx].set('top',pos[idx].top);
            visPics[idx].set('left',pos[idx].left);
            selections.push(visPics[idx]);
        }
        //!!!关键：导出后需默认选中导出元素一次，否则元素无法框选
        canvas.setActiveObject(new fabric.ActiveSelection(visPics,{canvas:canvas}));
        canvas.renderAll();
        return picData;
    }
    //获取img二进制流
    //通过传输文件的blob对象（二进制流）解决由跨域请求导致a标签download标签失效的问题
    getBlob = (url)=>{
        return new Promise(resolve=>{
            const xhr = new XMLHttpRequest()
            xhr.open('GET',url,true);
            xhr.responseType = 'blob'
            xhr.onload=(()=>{
                if(xhr.status === 200){
                    resolve(xhr.response);
                }else{
                    console.log("当前网络繁忙，请稍后再试哦~~");
                }
            })
            xhr.send()
        })
    }
    //下载img文件，格式为png
    saveAs = (blob,filename)=>{
        let tmp = document.createElement('a');
        tmp.href = window.URL.createObjectURL(blob);
        tmp.download = filename;
        tmp.click();
    }
    //申请专利函数
    // applyCurPic = ()=>{
    //     let applyForCopyRightPic = this.exportCurPic(true);
    //     let {user} = this.state;
    //     notification.info({placement:'top',description:'申请中！请稍后~',message:'版权申请提醒',duration:1})
    //     //通过后端开启子线程调用python文件进行图片筛查
    //     axios.post(`${host}/picSearch`,{
    //         imgData:applyForCopyRightPic,
    //         userid:user.userid       
    //     }).then(async (res)=>{
    //         let {data} = res;
    //         if(!data.result){
    //             message.error(`当前所申请图案存在疑似雷同图，疑似度为${data.confidence}，请在冷却期过后重新上传或申请人工复核`)
    //         }else{
    //             let token_id = await ntfContract.methods.mintNFT(user.accountaddress,data.sourcepic).send({from:chainDeployer,gas:'1000000'});
    //             token_id = +token_id.events.NFTMinted.returnValues.tokenId;
    //             this.setState({applyPicModalOpenStatus:true,curApplyPic:{...data,token_id}})
    //             message.success(`申请成功！请问您是否要加入到平台图片市场以获取额外收益呢？`);
    //         }
    //     })
    // }
    //关闭版权申请详情面板
    closeApplyCopyrightModal = ()=>{
        this.setState({applyPicModalOpenStatus:false});
    }
    //点击提交版权详情
    submitCopyrightDetail = async(values)=>{
        // //提交时默认值设置
        // values.isallowshop = values.isallowshop === undefined || values.isallowshop === true?1:0;
        // values.description = values.description.length === 0?"暂无描述":values.description;
        // values.copyrightname = values.copyrightname.length === 0?"未命名图像版权":values.copyrightname;
        // values.buyoutprice = values.isallowshop?values.price:0;
        // let {user,curApplyPic} = this.state;
        // try{
        //     if(values.isallowshop){
        //         //判断是否加入图片市场进行售卖，若加入则需要交易认证，同时设置价格并添加到市场中
        //         await ntfContract.methods.approve(_ntfMarket,curApplyPic.token_id).send({from:user.accountaddress,gas:'1000000'});
        //         let PRICE = web3.utils.toWei(values.price+'','ether');
        //         await ntfMarket.methods.listItem(_ntfContract, curApplyPic.token_id,PRICE).send({from:user.accountaddress,gas:'1000000'});
        //     }
        //     axios.get(`${host}/addUserCopyright`,{
        //         params:{
        //             ...values,
        //             userid:user.userid,
        //             copyrighturl:curApplyPic.sourcepic
        //         }
        //     }).then((res)=>{
        //         let {data}  = res;
        //         if(data === 'success'){
        //             message.success("新增成功！请到个人中心查看详情。");
        //             this.applyCopyrightForm.resetFields();
                    this.closeApplyCopyrightModal();
        //         }
        //     })
        // }catch(err){
        //     message.error("加入市场时价格不可低于0元！给予警告一次！");
        // }
    }
    //确认当前选中图案，将把图案用于元素样式进行直接覆盖,当前仅适用于文字元素
    confirmBgCurPattern = (value)=>{
        if(!value)return;
        let {curElementPic} = this.state;
        let canvas = this.canvas;
        let objects = canvas.getActiveObjects();
        if(!objects || objects.length === 0)return;
        fabric.util.loadImage(value.url,(img)=>{
            for(let object of objects){
                if(object._myType === 'text'){   
                    object.fillType = 'pattern';    
                    object.set('fill',new fabric.Pattern({
                        source:img,
                        repeat:'repeat',
                        offset: new fabric.Point(0, 0)
                    }))
                }
            }
            canvas.renderAll();
        })
        curElementPic = value;
        this.setState({curElementPic});
    }
    //监听元素背景填充色选择框
    handleElemBgChange = (value)=>{
        let {curElementBgType,curElementColor,curElementPic} = this.state;
        //判断当前颜色选取框与图案框的开启状态，若开启则执行关闭函数
        if(this.elemBgColorPanel.getCurColorPanelState())this.elemBgColorPanel.changeColorPanelState();
        if(this.elemBgPatternPanel.getCurPatternPanelState())this.elemBgPatternPanel.changePatternPanelState();
        curElementBgType = JSON.parse(value);
        //切换时根据当前选中类（是颜色还是图案）执行相应函数进行内容填充
        if(curElementBgType.value === 'color'){
            this.applyColorToElem(curElementColor);
        }else{
            if(curElementPic)this.confirmBgCurPattern(curElementPic);
        }
        this.setState({curElementBgType});
    }
    //根据当前所选项进行点击内容的判断，根据判断打开不同栏
    openElemBgPanel = ()=>{
        let {curElementBgType} = this.state;
        curElementBgType.value === 'color'?this.elemBgColorPanel.changeColorPanelState():this.elemBgPatternPanel.changePatternPanelState();
    }
    //颜色组件进行颜色切换后所进行的回调函数，用于对选中元素的颜色设置
    applyColorToElem = (color)=>{
        let canvas = this.canvas;
        let {curElementColor} = this.state;
        //获取当前选中元素
        let objects = canvas.getActiveObjects();
        //若不存在所选元素则直接返回
        if(!objects || objects.length === 0)return;
        const loopColor = (data,color)=>{
            //由于Group中不可直接添加颜色到元素上，需要对子元素循环遍历，挨个赋值
            if(!data || data.length === 0)return;
            for(let object of data){
                if(!object._objects){
                    //如果为图片元素，则为其添加filter进而实现颜色改变
                    if(object._myType === 'pattern'){
                        object.filters = [];
                        object.filters.push(new fabric.Image.filters.BlendColor({
                            color,
                            mode: 'tint',
                        }))
                        object.applyFilters();
                    //如果为文字元素，则直接改变其fill元素即可实现颜色改变
                    }else{
                        object.set('fill',color);
                    }
                }else{
                    //此处为Group元素添加filter属性是为了切换元素选择时缩略框的颜色能够正常显示
                    object.filters = [{color}];
                    loopColor(object._objects,color);
                }
            }
        }
        //将当前改变元素赋值到背景颜色缩略框上
        curElementColor = color;
        loopColor(objects,color);
        this.setState({curElementColor});
        canvas.renderAll();
    }
    //遍历翻转选定元素
    flipElem = (pos)=>{
        //确定翻转方向
        pos = 'flip'+pos;
        let canvas = this.canvas;
        let object = canvas.getActiveObject();
        if(!object)return;
        object.set(pos,!object[pos]);
        //画布重渲染
        canvas.renderAll();
    }
    //遍历缩放选定元素
    opeElemScale = (type)=>{
        let canvas = this.canvas;
        let object = canvas.getActiveObject();
        if(!object)return;
        let {curElementData} = this.state;
        let diff = (type === 'narrow'?-0.1:0.1);
        object.set('scaleX',object.scaleX + diff);
        object.set('scaleY',object.scaleY + diff);
        curElementData.sizeX = (object.width * object.scaleX).toFixed(2);
        curElementData.sizeY = (object.height * object.scaleY).toFixed(2);
        this.setState({curElementData});
        object.setCoords();
        canvas.renderAll();
    }
    //改变元素位置操作函数
    changeElemPos = (data)=>{
        let {direction} = data;
        let {curElementData} = this.state;
        let canvas = this.canvas;
        let object = canvas.getActiveObject();
        if(!object)return;
        //根据位置进行元素微调
        if(direction){
            switch(direction){
                case 'topLeft':
                    object.set('left',object.left - 5);
                    object.set('top',object.top - 5);
                    break;
                case 'top':
                    object.set('top',object.top - 5);
                    break;
                case 'topRight':
                    object.set('left',object.left + 5);
                    object.set('top',object.top - 5);
                    break;
                case 'left':
                    object.set('left',object.left - 5);
                    break;
                case 'right':
                    object.set('left',object.left + 5);
                    break;
                case 'bottomLeft':
                    object.set('left',object.left - 5);
                    object.set('top',object.top + 5);
                    break;
                case 'bottom':
                    object.set('top',object.top + 5);
                    break;
                case 'bottomRight':
                    object.set('left',object.left + 5);
                    object.set('top',object.top + 5);
                    break;
                default:
                    break;
            }
            curElementData.y = object.top.toFixed(2);
            curElementData.x = object.left.toFixed(2);
            this.setState({curElementData});
        }
        object.setCoords();
        canvas.renderAll();
    }
    //监听输入框内容，对元素进行更改
    inputChangeElemPos = (e,type)=>{
        //暂不加对输入的内容进行截取判断
        let param = (+e.target.value);
        //若转化为数字为NaN，则取值为0
        param = isNaN(param)?0:param;
        let canvas = this.canvas;
        let {curElementData} = this.state;
        let activeType = 'angle';
        let object = canvas.getActiveObject();
        if(!object)return;
        //判断当前焦点在输入框的位置
        switch(type){
            case 'x':
                activeType = 'left';
                break;
            case 'y':
                activeType = 'top';
                break;
            case 'sizeX':
                //元素的宽高设置是需要通过设置scale实现，通过计算当前输入量与原始宽度即可获得尺寸比例
                activeType = 'scaleX';
                param = param/object.width;
                break;
            case 'sizeY':
                activeType = 'scaleY';
                param = param/object.height;
                break;
            default:
                ;
        }
        curElementData[type] = param;
        object.set(activeType,+param);  
        this.setState({curElementData});
        canvas.renderAll();
    }
    //移动图层
    moveCurLevel = (pos)=>{
        let canvas = this.canvas;
        let object = canvas.getActiveObject();
        switch(pos){
            case 'upper':
                canvas.bringForward(object);
                break;
            case 'downer':
                canvas.sendBackwards(object);
                break;
            case 'uppest':
                canvas.bringToFront(object);
                break;
            case 'downest':
                canvas.sendToBack(object);
                break;
            default:
                break;
        }
        let objects = canvas.getObjects();
        //保证衣服部件图始终为最底层
        for(let object of objects){
            if(object._myType === 'modelPart'){
                canvas.sendToBack(object);
            }
        }
        canvas.discardActiveObject();
        canvas.renderAll();
    }
    //打开保存项目界面
    openSaveModal = ()=>{
        let renderer = this.renderer;
        let curProjectPreImg = renderer.domElement.toDataURL("image/jpeg");
        this.setState({saveModalOpenStatus:true,curProjectPreImg});
    }
    //关闭保存项目界面
    closeSaveModal = ()=>{
        this.editForm.resetFields();
        this.setState({saveModalOpenStatus:false})
    }
    //保存项目！！暂不考虑修改项目
    saveCurProject = (values)=>{
        let {projectname,description} = values;
        let {oDataForMyProject,shirtid,curPrice} = this.state;
        let {user} = this.state;
        let canvas = this.canvas;
        //树组件获取当前所有节点数据
        let curLayerData = this.treeComponent.getAllData();
        //设置保存时的默认参数
        if(!projectname)projectname = "未命名项目";
        if(!description)description = '';
        //设置post的参数值，包括canvas的json数据与所有图层数据
        let obj = {projectname,description,jsondata:JSON.stringify(canvas.toJSON()),userid:user.userid,layerdata:JSON.stringify(curLayerData),preImg:this.renderer.domElement.toDataURL("image/jpeg"),shirtid,curPrice};
        //此处都为新增项目
        axios.post(`${host}/saveModelProject`,obj).then(res=>{
            let {data} = res;
            let newObj = {projectname:obj.projectname,projecturl:data.fileUrl};
            //新增到数据库表的同时新增到我的项目中
            oDataForMyProject.data.unshift({src:'project.svg',title:newObj.projectname,hoverIfo:newObj.projectname,userType:0,value:JSON.stringify(newObj)});
            message.success("项目新增成功了！可在我的项目中进行查看");
            this.setState({oDataForMyProject});
        })
        this.closeSaveModal();
    }
    //打开我的项目
    openExistsProject = (values)=>{
        values = values.dataSrc;
        let obj = JSON.parse(values);
        let canvas = this.canvas;
        message.info("数据即将更换，请注意保存内容！");
        let type = obj.tempUpload;
        //读取服务器端存储的json数据内容，返回前端进行重新读取
        if (type) {
            let data = obj;
            //重新设置底衫尺寸
            for (let perObj of data.canvasData.objects) {
                if (perObj._myType === 'modelPart') {
                    perObj.scaleX = "0.303";
                    perObj.scaleY = "0.303";
                }
            }
            //canvas与树组件重新加载数据
            canvas.loadFromJSON(data.canvasData);
            this.treeComponent.setInitialData(data.layerData);
            this.setState({ curPrice: data.curPrice });
            setTimeout(() => this.setShirtTexture(), 100);
        } else {
            axios.get(`${host}/readStaSource`,{
                params:{
                    fileUrl:obj.projecturl
                }
            }).then((res)=>{
                let {data} = res;
                data = JSON.parse(data);
                //重新设置底衫尺寸
                for(let perObj of data.canvasData.objects){
                    if(perObj._myType === 'modelPart'){
                        perObj.scaleX = "0.303";
                        perObj.scaleY = "0.303";
                    }
                }
                //canvas与树组件重新加载数据
                canvas.loadFromJSON(data.canvasData);
                this.treeComponent.setInitialData(data.layerData);
                this.setState({curPrice:data.curPrice});
                setTimeout(()=>this.setShirtTexture(),100);
            })
        }
    }
    //组件挂载渲染函数
    render() {
        const { user, leftExpandState, leftExpandIcon,oDataForViewChg, oDataForMyProject, oDataForTextAdd, oDataForModelChg, oDataForPicChg, curShirtPartInput, curShirtPart, oddEditOptions,curElementBgType,curElementOptions,curElementPic,curElementColor,curElementData,dropDownItems,saveModalOpenStatus,curProjectPreImg,curPrice,applyPicModalOpenStatus,curApplyPic} = this.state;
        return (
            <div id="edit_panel">
                <Link to={{pathname:'/commonlogin'}} ref={(elem)=>this.jumpLink = elem} style={{display:'none'}}/>
                <Link to={{pathname:'/webindex/selfdetail'}} ref={(elem)=>this.jumpLink2 = elem} style={{display:'none'}}/>
                <div id="left_ope_box" className={leftExpandState ? 'left_ope_box_open' : 'left_ope_box_close'}>
                    <div id="left_ope_box_title">
                        <div id="left_ope_box_title_left">
                            <svg className='icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80.01 100"><g fillRule="evenodd"><path d="M80 3.77C59.39 19.79 5.22 27 0 46.84v31.38c0 8.5 2.88 15.55 10.74 21.78C.7 68.08 77.26 73.05 80 45.87z" fill="#114fee" /><path d="M51.69 17.48L51.59 0C29.1 15.36 2 18.09 0 46.84v31.38a27 27 0 0 0 2.39 11.67c-.34-34.1 49.56-20.5 49.4-52.8z" fill="#2ddaff" opacity=".8" /></g></svg>
                            易纹创
                        </div>
                        <div id="left_ope_box_title_right">
                            <span style={{ display: user && JSON.stringify(user) !== '{}' ? 'none' : 'block' }}>未登录</span>
                            <Dropdown trigger={['click']} dropdownRender={()=>
                                (
                                    <div id='self_detail_panel_mini'>
                                        <div id='self_detail_mini_top'>
                                            <img src={user.avatar?`${host}/getStaSource?sourceUrl=${user.avatar}`:require('../pic/ModelPanel/user_temp_avatar.png')} alt="暂时无法显示"/>
                                            <div>
                                                <div>{user.username}</div>
                                                <div><span>ID：{user.userid}</span><span>余额：{user.account}元</span></div>
                                            </div>
                                        </div>
                                        <div id="self_detail_mini_rate">
                                            <span>信用评级：</span>
                                            <Rate disabled defaultValue={user.credit} />
                                        </div>
                                        <Divider/>
                                        <div className='self_detail_mini_somedetail'>
                                            <div className='self_detail_mini_title'>我的订单</div>
                                            <div className='self_detail_mini_container'>
                                                <div onClick={()=>this.jumpLink2.click()}><img alt='' src={require("../pic/ModelPanel/wait_pay.svg").default}/><span>待付款</span></div>
                                                <div onClick={()=>this.jumpLink2.click()}><img alt='' src={require("../pic/ModelPanel/wait_post.svg").default}/><span>待发货</span></div>
                                                <div onClick={()=>this.jumpLink2.click()}><img alt='' src={require("../pic/ModelPanel/wait_receive.svg").default}/><span>待收货</span></div>
                                                <div onClick={()=>this.jumpLink2.click()}><img alt='' src={require("../pic/ModelPanel/refund.svg").default}/><span>退款/售后</span></div>
                                            </div>
                                        </div>
                                        <Divider/>
                                        <div className='self_detail_mini_somedetail'>
                                            <div className='self_detail_mini_title'>我的版权</div>
                                            <div className='self_detail_mini_container'>
                                                <div onClick={()=>this.jumpLink2.click()}><img alt='' src={require("../pic/ModelPanel/copyright_all.svg").default}/><span>我的版权</span></div>
                                                <div onClick={()=>this.jumpLink2.click()}><img alt='' src={require("../pic/ModelPanel/apply_all.svg").default}/><span>申请记录</span></div>
                                                <div onClick={()=>this.jumpLink2.click()}><img alt='' src={require("../pic/ModelPanel/deal_all.svg").default}/><span>交易记录</span></div>
                                            </div>
                                        </div>
                                        <Divider/>
                                        <ul className='self_detail_mini_ul'>
                                            {dropDownItems.length !== 0?dropDownItems.map((item)=>
                                            <li key={item.key} onClick={()=>item.onclick()}>
                                                <img alt='' src={item.src}/>
                                                <span>{item.title}</span>
                                            </li>
                                            ):''}
                                        </ul>
                                    </div>
                                )
                            }>
                                <img id="user_avatar" style={{ display: user && JSON.stringify(user) !== '{}' ? 'block' : 'none' }} src={user.avatar?`${host}/getStaSource?sourceUrl=${user.avatar}`:require('../pic/ModelPanel/user_temp_avatar.png')} alt="暂时无法显示"/>
                            </Dropdown>
                        </div>
                    </div>
                    <div id="cur_sum_amount">
                        当前单件预估价格为：￥
                        <input type='text' readOnly value={curPrice.toFixed(2)} style={{textAlign:'center',fontSize:'18px'}}/>
                    </div>
                    <ChangePart svg="user_project.svg" title="我的项目" data={oDataForMyProject} openExistsProject={(values)=>this.openExistsProject(values)}/>
                    <ChangePart svg="change_model.svg" title="底衫切换" data={oDataForModelChg} openEditPanel={() => this.openEditPanel()} />
                    <ChangePart svg="change_pic.svg" title="贴图添加" data={oDataForPicChg} addShirtPattern={(value) => this.addShirtPattern(value)} />
                    <ChangePart svg="add_text.svg" title="文本添加" data={oDataForTextAdd} addTextContent={(value) => this.addTextContent(value)} />
                    {/* <ChangePart svg="change_part.svg" title="配件切换" /> */}
                </div>
                <img id="left_part_expand_button" className={leftExpandState ? 'left_ope_box_button_active' : 'left_ope_box_button_inactive'} onClick={this.changeLeftPanel} src={require(`../pic/ModelPanel/${leftExpandIcon}`)} alt="暂时无法显示" />
                <div id="mid_ope_box" className={leftExpandState?'mid_ope_box_close':'mid_ope_box_open'}>
                    <div id="mid_ope_box_canvas_edit">
                        <div className='mid_ope_box_edit_detail'>
                            <div className='mid_ope_box_edit_title'>
                                衣衫颜色编辑
                                <div className='decoration_line'></div>
                            </div>
                            <div className='mid_ope_box_edit_content'>
                                <div id="cur_selected_part">
                                    当前部位：
                                    <Select value={curShirtPartInput ? curShirtPartInput : ''} filterOption={false} showArrow={false} onChange={this.handleSelectChange} style={{ width: '50%' }}>
                                        {this.modelParts && this.modelParts.map(item =>
                                            <Option value={JSON.stringify(item)} key={item.key}>{item.title}</Option>
                                        )}
                                    </Select>
                                </div>
                                <div id="cur_selected_colorpanel">
                                    当前颜色：
                                    <div id="cur_selected_colorpanel_detail" onClick={this.colorPanel && this.colorPanel.changeColorPanelState}>
                                        {curShirtPart && curShirtPart.color?curShirtPart.color:'#000000'}
                                        <div style={{borderRadius:5,width:45,height:30,background:curShirtPart && curShirtPart.color?curShirtPart.color:'#000000'}}></div>
                                    </div>
                                    <ColorPanel canBeGradient={false} onChangeFn={this.changeShirtPartColor} ref={(elem)=>{this.colorPanel = elem}}/>
                                </div>
                            </div>
                        </div>
                        <div className='mid_ope_box_edit_detail mid_ope_box_edit_treepanel'>
                            <div className='mid_ope_box_edit_title'>
                                画布图层编辑
                                <div className='decoration_line'></div>
                            </div>
                            <div className='mid_ope_box_edit_content'>
                                <TreeComponent leftExpandState={leftExpandState} switchExecuteOddFn={this.switchExecuteOddFn} oddEditOptions={oddEditOptions} treeEditCallBack={(data)=>this.treeEditCallBack(data)} selectedFn={(data)=>this.selectedFn(data)} ref={elem=>this.treeComponent = elem}/>
                            </div>
                        </div>
                        <div className='mid_ope_box_edit_detail'>
                            <div className='mid_ope_box_edit_title'>
                                图层细节编辑
                                <div className='decoration_line'></div>
                            </div>
                            <div className='mid_ope_box_edit_content'>
                                <div className='curelement_selected'>
                                    背景设置：
                                    <Select value={curElementBgType.title} filterOption={false} showArrow={false} onChange={this.handleElemBgChange} style={{ width: '45%' }}>
                                        {curElementOptions && curElementOptions.map(item=>
                                            <Option style={{fontSize:12}} value={JSON.stringify(item)} key={item.value}>{item.title}</Option>
                                        )}
                                    </Select>
                                    <ColorPanel ref={(elem)=>this.elemBgColorPanel = elem} className='elem_colorpanel' style={{display:curElementBgType.value === 'color'?'block':'none'}} onChangeFn={this.applyColorToElem}/>
                                    <PatternPanel ref={(elem)=>this.elemBgPatternPanel = elem} className='elem_patternpanel' style={{display:curElementBgType.value === 'pattern'?'block':'none'}} confirmCallBack={(value)=>this.confirmBgCurPattern(value)}/>
                                    <div className='curelement_effect_show' onClick={this.openElemBgPanel}>
                                        <div style={{display:curElementBgType.value === 'pattern'?'block':'none'}} className='curelement_detail_show'>
                                            <img src={curElementPic?curElementPic.url:require('../pic/ModelPanel/not_add.svg').default} title={curElementPic?curElementPic.name:'暂未添加图片'} alt=''/>
                                        </div>
                                        <div style={{display:curElementBgType.value === 'color'?'block':'none',background:curElementColor}} className='curelement_detail_show'></div>
                                    </div>
                                </div>
                                <div className='curelement_selected curelement_selected2'>
                                    <div className='curelement_selected_title'>
                                        图层操作:
                                    </div>
                                    <ul>
                                        <li className='curelement_selected_item'>
                                            <img onClick={()=>this.flipElem('X')} title='垂直翻转' alt='' src={require('../pic/ModelPanel/flip_y.svg').default}/>
                                            垂直翻转
                                        </li>
                                        <li className='curelement_selected_item'>
                                            <img onClick={()=>this.flipElem('Y')} title='水平翻转' alt='' style={{transform:'rotate(90deg)'}} src={require('../pic/ModelPanel/flip_y.svg').default}/>
                                            水平翻转
                                        </li>
                                        <li className='curelement_selected_item'>
                                            <img onClick={()=>this.opeElemScale('expand')} title='图层放大' alt='' src={require('../pic/ModelPanel/elem_expand.svg').default}/>
                                            图层放大
                                        </li>
                                        <li className='curelement_selected_item'>
                                            <img onClick={()=>this.opeElemScale('narrow')} title='图层缩小' alt='' src={require('../pic/ModelPanel/elem_narrow.svg').default}/>
                                            图层缩小
                                        </li>
                                        <li className='curelement_selected_item'>
                                            <img onClick={()=>this.moveCurLevel('uppest')} title='上移顶层' alt='' src={require('../pic/ModelPanel/move_uppest.svg').default}/>
                                            上移顶层
                                        </li>
                                        <li className='curelement_selected_item'>
                                            <img onClick={()=>this.moveCurLevel('downest')} title='下移底层' alt='' src={require('../pic/ModelPanel/move_downest.svg').default}/>
                                            下移底层
                                        </li>
                                        <li className='curelement_selected_item'>
                                            <img onClick={()=>this.moveCurLevel('upper')} title='上移一层' alt='' src={require('../pic/ModelPanel/move_upper.svg').default}/>
                                            上移一层
                                        </li>
                                        <li className='curelement_selected_item'>
                                            <img onClick={()=>this.moveCurLevel('downer')} title='下移一层' alt='' src={require('../pic/ModelPanel/move_downer.svg').default}/>
                                            下移一层
                                        </li>
                                    </ul>
                                </div>
                                <div className='curelement_selected curelement_selected2'>
                                    <div className='curelement_selected_title'>
                                        微调操作:
                                    </div>
                                    <div className='curelement_selected_box'>
                                        <ul className='curelement_movement_ope'>
                                            <li><img alt='' title='左上' onClick={()=>{this.changeElemPos({direction:'topLeft'})}} src={require('../pic/ModelPanel/elem_pos_ope.svg').default} style={{rotate:'-45deg'}}/></li>
                                            <li><img alt='' title='上' onClick={()=>{this.changeElemPos({direction:'top'})}} src={require('../pic/ModelPanel/elem_pos_ope.svg').default} /></li>
                                            <li><img alt='' title='右上' onClick={()=>{this.changeElemPos({direction:'topRight'})}} src={require('../pic/ModelPanel/elem_pos_ope.svg').default} style={{rotate:'45deg'}}/></li>
                                            <li><img alt='' title='左' onClick={()=>{this.changeElemPos({direction:'left'})}} src={require('../pic/ModelPanel/elem_pos_ope.svg').default} style={{rotate:'-90deg'}}/></li>
                                            <li><img alt='' title='不变' src={require('../pic/ModelPanel/elem_pos_mid.svg').default}/></li>
                                            <li><img alt='' title='右' onClick={()=>{this.changeElemPos({direction:'right'})}} src={require('../pic/ModelPanel/elem_pos_ope.svg').default} style={{rotate:'90deg'}}/></li>
                                            <li><img alt='' title='左下' onClick={()=>{this.changeElemPos({direction:'bottomLeft'})}}src={require('../pic/ModelPanel/elem_pos_ope.svg').default} style={{rotate:'-135deg'}}/></li>
                                            <li><img alt='' title='下' onClick={()=>{this.changeElemPos({direction:'bottom'})}} src={require('../pic/ModelPanel/elem_pos_ope.svg').default} style={{rotate:'180deg'}}/></li>
                                            <li><img alt='' title='右下' onClick={()=>{this.changeElemPos({direction:'bottomRight'})}} src={require('../pic/ModelPanel/elem_pos_ope.svg').default} style={{rotate:'135deg'}}/></li>
                                        </ul>
                                        <ul className='curelement_movement_input'>
                                            <li>X &nbsp;&nbsp;轴：<input style={{width:'40%'}} onChange={(e)=>this.inputChangeElemPos(e,'x')} value={curElementData.x}/></li>
                                            <li>Y &nbsp;&nbsp;轴：<input style={{width:'40%'}} onChange={(e)=>this.inputChangeElemPos(e,'y')} value={curElementData.y}/></li>
                                            <li>角 度：<input style={{width:'40%',marginLeft:'1.5px'}} onChange={(e)=>this.inputChangeElemPos(e,'angle')} value={curElementData.angle}/></li>
                                            <li>大 小：<input style={{width:'25%',marginLeft:'1.5px'}} onChange={(e)=>this.inputChangeElemPos(e,'sizeX')} value={curElementData.sizeX}/>x<input style={{width:'25%'}} value={curElementData.sizeY} onChange={(e)=>this.inputChangeElemPos(e,'sizeY')}/></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <canvas id="modal_canvas" className={leftExpandState?'canvas_box_close':'canvas_box_open'}></canvas>
                </div>
                <div id="right_ope_box">
                    <ul id='right_ope_toolbox'>
                        {oDataForViewChg && oDataForViewChg.data.map((item)=>
                        <li key={item.title} onClick={()=>this.animateCamera(item.value)}>
                            <img alt='' src={require(`../pic/ModelPanel/${item.src}`)} title={item.title}/>
                            <div>{item.title}</div>
                        </li>
                        )}
                        <li key={"model_spin"} onClick={this.changeModelRotating}>
                            <img alt='' src={require(`../pic/ModelPanel/picForDirection/model_spin.svg`).default} title={'模型旋转'}/>
                            <div>3D旋转</div>
                        </li>
                    </ul>
                    <Button danger id='model_end_ope' onClick={this.openSaveModal}>结束定制</Button>
                </div>
                <Modal title={"保存项目"} open={saveModalOpenStatus} footer={null} onCancel={this.closeSaveModal}>
                    <div className='model_project_preimg' style={{background:`url(${curProjectPreImg})`}}/>
                    <div className='model_project_title'>项目预览图</div>
                    <Form onFinish={this.saveCurProject} ref={(elem)=>this.editForm = elem} labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} style={{ width: '100%' }}>
                        <Form.Item className="edit_form" name="projectname" label="项目名称">
                            <Input allowClear placeholder="请输入项目名称" />
                        </Form.Item>
                        <Form.Item className="edit_form" name="description" label="项目描述">
                            <Input.TextArea rows={4} allowClear placeholder="请输入项目相关描述" />
                        </Form.Item>
                        <Form.Item className="edit_form" style={{textAlign:'right',marginLeft:'30%'}}>
                            <Space>
                                <Button onClick={this.closeSaveModal} htmlType="reset" danger>取消</Button>
                                <Button type="primary" htmlType="submit">提交</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>
                <Modal className='apply_copyright_panel' title={"版权申请"} open={applyPicModalOpenStatus} footer={null} onCancel={this.closeApplyCopyrightModal}>
                    <div className='apply_copyright_panel_left'>
                        <div className='apply_copyright_imgBox' style={{background:`url(${host}/getStaSource?sourceUrl=${curApplyPic.sourcepic})`}}/>
                    </div>
                    <div className='apply_copyright_panel_right'>
                        <Form onFinish={this.submitCopyrightDetail} ref={(elem)=>this.applyCopyrightForm = elem} name='apply_copyright_form' labelCol={{span:6}} wrapperCol={{span:14}}>
                            <div className='information'>恭喜您！您的所申请的版权最高疑似度为<span>{curApplyPic.confidence}</span></div>
                            <div className='description'>请填写信息并确认相关事宜。</div>
                            <Form.Item name={"blockchaintokenid"} label={"NFTID号："} initialValue={curApplyPic.token_id}>
                                <Input disabled />
                            </Form.Item>
                            <Form.Item name={"copyrightname"} label={"版权名称："}>
                                <Input allowClear placeholder='请输入您的版权名称'/>
                            </Form.Item>
                            <Form.Item name={"isallowshop"} label={"进行售卖："} valuePropName="checked">
                                <Switch defaultChecked checkedChildren={"是"} unCheckedChildren={"否"}/>
                            </Form.Item>
                            <Form.Item shouldUpdate={(preValues,curValues)=>preValues.isallowshop !== curValues.isallowshop} label={"售卖价格："}>
                                {({getFieldValue})=>{
                                    let value = getFieldValue("isallowshop");
                                    return (
                                        <Form.Item name={"price"} initialValue={["0"]}>
                                            {value || value === undefined ?<InputNumber min={0}  key={"inputbox1"} prefix={"￥"}/>: <InputNumber key={"inputbox2"} min={0} disabled prefix={"￥"}/>}
                                        </Form.Item>
                                    )
                                }}
                            </Form.Item>
                            <div className='description description2'>注：恶意标价引起市场均价波动将予以封号处理</div>
                            <Form.Item name={"description"} label="相关描述">
                                <Input.TextArea rows={4} allowClear placeholder="请输入您所拥有的版权相关描述" />
                            </Form.Item>
                            <Form.Item style={{textAlign:'right',marginLeft:'52%'}}>
                                <Space>
                                    <Button htmlType="reset">重置</Button>
                                    <Button type="primary" htmlType="submit">提交</Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </div>
                </Modal>
                <EditPanel ref={(element) => { this.editPanel = element }} id="my_edit_panel"></EditPanel>
            </div>
        )
    }
}
//暂不使用redux
// const mapStateToProps = (state)=>({
//     shirtColor:state.shirtColor
// })
// const mapDispatchToProps = (dispatch)=>{
//     return {
//         changeShirtScheme:(data) => dispatch(changeShirtScheme(data))
//     }
// }
// export default connect(mapStateToProps)(ModelControl)