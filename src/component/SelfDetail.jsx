import React from "react";
import "../css/SelfDetail.css";
import {DeleteOutlined,ShoppingOutlined,LoadingOutlined,ShopOutlined,SendOutlined,SmileOutlined } from '@ant-design/icons';
import {Menu,message,Divider,Button,Input,Cascader,Card,Modal, Tag,Form,InputNumber, Space,Badge,Tabs,Table,Steps,Switch} from 'antd';
import { Link } from "react-router-dom";
import {cityData} from "../data/cityData";
import axios from "axios";
import { throttle } from "lodash";
import {blockChain,_ntfMarket,ntfMarketAbi,_ntfContract,ntfContractAbi} from "../data/blockData.js";
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider(blockChain));
const ntfMarket = new web3.eth.Contract(JSON.parse(ntfMarketAbi),_ntfMarket);
const ntfContract = new web3.eth.Contract(JSON.parse(ntfContractAbi),_ntfContract);
const host = "http://localhost:4444"
const {Meta} = Card;
export default class SelfDetail extends React.Component{
    state={
        user:{},
        menuItems:[
            {key:'self_detail',label:'个人信息',icon:<img className="self_detail_img" alt="" src={require("../pic/ModelPanel/self_detail.svg").default}/>},
            {key:'message_detail',label:'我的消息',icon:<img className="self_detail_img" alt="" src={require("../pic/ModelPanel/message_detail.svg").default}/>},
            {key:'project_detail',label:'我的项目',icon:<img className="self_detail_img" alt="" src={require("../pic/ModelPanel/project_detail.svg").default}/>},
            {key:'collect_detail',label:'我的收藏',icon:<img className="self_detail_img" alt="" src={require("../pic/ModelPanel/collect_detail.svg").default}/>},
            {key:'tab_5',label:<Divider/>,disabled:true},
            {key:'order_all',label:'我的订单',icon:<img className="self_detail_img" alt="" src={require("../pic/ModelPanel/order_all.svg").default}/>},
            {key:'copyright_all',label:'我的版权',icon:<img className="self_detail_img" alt="" src={require("../pic/ModelPanel/copyright_all.svg").default}/>},
        ],
        curOpenPanel:'self_detail',
    }
    componentDidMount(){
        this.checkLoginStatus();
    }
    //检查用户登录状态，未登录直接跳转登录界面
    checkLoginStatus = ()=>{
        let userData = localStorage.getItem("commonUserData");
        if(!userData){
            message.error("当前未登录，即将为您跳转到登录界面");
            if(this.jumpLink)setTimeout(()=>this.jumpLink.click(),3000);
        }else{
            this.setState({user:JSON.parse(userData)});
        }
    }
    //切换当前menu显示的item项
    onSelectItem = (values)=>{
        this.setState({curOpenPanel:values.key});
    }
    render(){
        const {menuItems,user,curOpenPanel} = this.state;
        return(
            <div id="self_detail_panel">
                <Link to={{pathname:'/commonlogin'}} style={{display:'none'}} ref={(elem)=>this.jumpLink = elem}/>
                <div id="self_detail_panel_left">
                    <div className="self_detail_panel_title">
                        <img src={user.avatar?`${host}/getStaSource?sourceUrl=${user.avatar}`:require('../pic/ModelPanel/user_temp_avatar.png')} alt="暂时无法显示" />
                        <span>{user.username}</span>
                    </div>
                    <Menu mode="inline" items={menuItems} onSelect={this.onSelectItem} selectedKeys={[curOpenPanel]}/>
                </div>
                <div id="self_detail_panel_right">
                    {/* 中间切换组件 */}
                    <MatchComponent user={user} curOpenPanel={curOpenPanel}/>
                </div>
            </div>
        )
    }
}
//中间切换显示界面组件
class MatchComponent extends React.Component{
    render(){
        let matchComponent;
        let {curOpenPanel} = this.props;
        switch(curOpenPanel){
            case 'self_detail':
                matchComponent = <ShowPanel1 {...this.props}/>
                break;
            case 'message_detail':
                matchComponent = <ShowPanel2 {...this.props}/>
                break;
            case 'project_detail':
                matchComponent = <ShowPanel3 {...this.props}/>
                break;
            case 'collect_detail':
                matchComponent = <ShowPanel4 {...this.props}/>
                break;
            case 'order_all':
                matchComponent = <ShowPanel5 {...this.props}/>
                break;
            case 'copyright_all':
                matchComponent = <ShowPanel6 {...this.props}/>
                break;
            default:
                break;
        }
        return(
            <>{matchComponent}</>
        )
    }
}
//个人信息界面
class ShowPanel1 extends React.Component{
    state = {}
    render(){
        const {user} = this.props;
        return(
            <div id="show_panel_1">
                <div className="show_panel_title">您的账户</div>
                <ul className="show_panel_content">
                    <Divider/>
                    <li>
                        <div>您的头像</div>
                        <div className="show_panel_content_detail">
                            <img src={user.avatar?`${host}/getStaSource?sourceUrl=${user.avatar}`:require('../pic/ModelPanel/user_temp_avatar.png')} alt="暂时无法显示" />
                            <Button>上传头像</Button>
                        </div>
                    </li>
                    <Divider/>
                    <li>
                        <div>您的名称</div>
                        <div className="show_panel_content_detail">
                            <Input style={{width:'60%'}} value ={user.username} disabled/>
                            <Button>点击编辑</Button>
                        </div>
                    </li>
                    <Divider/>
                    <li>
                        <div>您的邮件地址</div>
                        <div className="show_panel_content_detail">
                            <Input style={{width:'60%'}} value={user.email?user.email:''} placeholder={"请添加您的邮箱"} disabled={user.email?true:false}/>
                            <Button>点击添加</Button>
                        </div>
                    </li>
                    <Divider/>
                    <li>
                        <div>您的实体地址</div>
                        <div className="show_panel_content_detail">
                            <Cascader style={{width:'60%'}} placeholder="请输入您的地址" options={cityData} />
                            <Button>点击添加</Button>
                        </div>
                    </li>
                    <Divider/>
                    <li>
                        <div>密码</div>
                        <div className="show_panel_content_detail" style={{display:user.email?'block':'none'}}>
                            <Input.Password style={{width:'60%'}} value={user.password} disabled/>
                            <Button>点击修改</Button>
                        </div>
                        <div className="show_panel_content_detail2" style={{display:user.email?'none':'block'}}>
                            请先添加您的邮箱以便信息验证等操作
                        </div>
                    </li>
                    <Divider/>
                    <li>
                        <div>删除账户</div>
                        <div className="show_panel_content_detail" >
                            <span>请谨慎考虑删除账户，删除后将失去所有权益与信息！</span>
                            <Button danger>删除您的账户</Button>
                        </div>
                    </li>
                </ul>
            </div>
        )
    }
}
//个人消息界面
class ShowPanel2 extends React.Component{
    state = {
        curMessage:[],
        curUser:''
    }
    //获取当前用户的所有消息
    checkCurMessage = (userid)=>{
        let {curUser,curMessage} = this.state;
        if(curUser === userid || curMessage.length)return;
        axios.get(`${host}/getUserMessage`,{params:{userid}}).then((res)=>{
            let {data} = res;
            if(data.length === 0)return;
            else{
                this.setState({curMessage:[].concat(data)});
            }                
        })
    }
    computeDate = (date)=>{
        let minute = parseInt((new Date().getTime() - date) / (1000 * 60));
        if(minute<60)return minute+'分钟前';
        let hour = parseInt(minute/60);
        if(hour<24)return hour+'小时前';
        let day = parseInt(hour/24);
        return day+'天前';
    }
    render(){
        let {user} = this.props;
        let {curMessage} = this.state;
        this.checkCurMessage(user.userid);
        return(
            <div id="show_panel_2">
                <div className="show_panel_title">消息中心</div>
                <Divider/>
                <div className="show_panel_nodata" style={{display:curMessage.length === 0?'block':'none'}}>
                    <img alt=""  src={require("../pic/WebIndex/selfdetail_message.svg").default}/>
                    <div>当前暂无消息哦~</div>
                </div>
                <ul id="show_panel_2_message_panel"  style={{display:curMessage.length !== 0?'block':'none'}}>
                    {curMessage.map((item)=>(
                        <li key={item.logid}>
                            <svg className='icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80.01 100"><g fillRule="evenodd"><path d="M80 3.77C59.39 19.79 5.22 27 0 46.84v31.38c0 8.5 2.88 15.55 10.74 21.78C.7 68.08 77.26 73.05 80 45.87z" fill="#114fee" /><path d="M51.69 17.48L51.59 0C29.1 15.36 2 18.09 0 46.84v31.38a27 27 0 0 0 2.39 11.67c-.34-34.1 49.56-20.5 49.4-52.8z" fill="#2ddaff" opacity=".8" /></g></svg>
                            <div>
                                <div className="show_panel_2_message_panel_content" style={{display:item.result?'block':'none'}}>亲爱的<u>{user.username}</u>，恭喜您在易纹创平台完成<u>{item.event}</u>，更多详情请点击<u>相关页</u>，感谢您的使用！</div>
                                <div className="show_panel_2_message_panel_content" style={{display:item.result?'none':'block'}}>不好意思呀~亲爱的<u>{user.username}</u>，你所发起的<u>{item.event}</u>的事务失败了，请仔细审查后重新发起哦，感谢您的体谅！</div>
                                <div>{this.computeDate(item.date)}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        )
    }
}
//所有项目界面
class ShowPanel3 extends React.Component{
    state = {
        user:{},
        projectData:[],
        curModalProject:{},
        shopModalOpenStatus:false,
        totalPrice:0,
    }
    componentDidMount(){
        this.setState({user:this.props.user},()=>{
            this.getProjectData(this.props.user.userid);
        })
    }
    //获取时间节点
    computeDate = (date)=>{
        let minute = parseInt((new Date().getTime() - date) / (1000 * 60));
        if(minute<60)return minute+'分钟前';
        let hour = parseInt(minute/60);
        if(hour<24)return hour+'小时前';
        let day = parseInt(hour/24);
        return day+'天前';
    }
    //初始获取我的项目所有数据
    getProjectData = (userid)=>{
        axios.get(`${host}/getUserProject`,{
            params:{
                userid
            }
        }).then((res)=>{
            let {data} = res;
            this.setState({projectData:[].concat(data)});
        })
    }
    //打开购物界面
    openShopModal = (values)=>{
        this.setState({curModalProject:JSON.parse(values)},()=>{
            this.setState({shopModalOpenStatus:true});
        })
    }
    //关闭购物页面
    closeShopModal = ()=>{
        this.setState({shopModalOpenStatus:false});
    }
    //获取当前价格
    getTotalPrice = (values,allvalues)=>{
        let {s,l,m} = allvalues;
        let {curModalProject} = this.state;
        this.setState({totalPrice:(s+l+m)*curModalProject.totalprice})
    }
    //提交订单
    onSubmitOrder = (values)=>{
        //let {userid,projectid,shirtid,unitprice,totalprice,quantity,address,ordercontent} = req.body.postData;
        let {totalPrice,user,curModalProject} = this.state;
        let {s,l,m,address,detailAddress} = values;
        let postData = {
            userid:user.userid,
            projectid:curModalProject.projectid,
            shirtid:curModalProject.shirtid,
            unitprice:curModalProject.totalprice,
            totalprice:totalPrice,
            quantity:s+l+m,
            address:address.join("") + detailAddress,
            ordercontent:{
                sizeS:s,
                sizeL:l,
                sizeM:m
            }
        };
        axios.post(`${host}/addUserOrders`,{
            postData
        }).then((res)=>{
            this.closeShopModal();
            this.editForm.resetFields();
            this.setState({totalPrice:0});
            message.success("提交订单成功了！");
        })
    }
    render(){
        let {projectData,shopModalOpenStatus,curModalProject,totalPrice} = this.state;
        return(
            <div id="show_panel_3">
                <div className="show_panel_title">我的项目</div>
                <Divider></Divider>
                <div className="project_container_box">
                    {projectData.length?projectData.map((item)=>
                        <Card className="project_card" key={item.projectid} cover={
                            <div className="project_card_cover" style={{background:`url(${host}/getStaSource?sourceUrl=${item.projectimgurl})`}}/>
                        } actions={[<ShoppingOutlined onClick={()=>{this.openShopModal(JSON.stringify(item))}} key="shop" />,<DeleteOutlined key="delete"/>]}>
                            <Meta title={item.projectname} description={item.description}/>
                            <div className="project_card_date">
                                <span>创建时间：<p>{this.computeDate(item.createdate)}</p></span>
                                <span>更新时间：<p>{this.computeDate(item.updatedate)}</p></span>
                            </div>
                        </Card>
                    ):<div className="show_panel_nodata">
                        <img alt=""  src={require("../pic/WebIndex/selfdetail_project.svg").default}/>
                        <div>当前暂无项目哦~</div>
                      </div>
                    }
                </div>
                <Modal className="shirt_detail_panel order_detail_panel" open={shopModalOpenStatus} footer={null} title="订购界面" onCancel={this.closeShopModal}>
                    <div className="shirt_detail_panel_top">
                        <div className="shirt_detail_panel_bg" style={{background:`url(${host}/getStaSource?sourceUrl=${curModalProject.projectimgurl})`}}/>
                        <div style={{ width: '100%' }}>
                            <span>{curModalProject.projectname}</span>
                            <span className="description">项目说明：{curModalProject.description}</span>
                            <span className="description">当前底衫：{curModalProject.shirtname}</span>
                            <span className="description">底衫卖点：{curModalProject.sellingpoint}</span>
                            <div className="price_part">
                                <span>价格：<span>￥{curModalProject.totalprice}</span>(涵盖图案)</span>
                                <span>服务：七个工作日发货 可加急/免费看样</span>
                                <span>运费：全场包邮！</span>
                            </div>
                            <span className="description">
                                <span>
                                    版型：{+curModalProject.typography === 1 ? '宽松' : +curModalProject.typography === 2 ? '常规' : +curModalProject.typography === 3 ? '修身' : '紧身'}
                                </span>
                                <span>
                                    厚度：{+curModalProject.thickness === 1 ? '偏薄' : +curModalProject.thickness === 2 ? '薄' : +curModalProject.thickness === 3 ? '适中' : +curModalProject.thickness === 4 ? '厚' : '偏厚'}
                                </span>
                                <span>
                                    弹性：{+curModalProject.elasticity === 1 ? '无弹' : +curModalProject.elasticity === 2 ? '微弹' : +curModalProject.elasticity === 3 ? '适中' : '超弹'}
                                </span>
                            </span>
                            <Form ref={(elem)=>this.editForm = elem} name="order_detail" labelCol={{ span: 3 }} wrapperCol={{span:20}} onValuesChange={this.getTotalPrice} onFinish={this.onSubmitOrder}>
                                <Form.Item label='地址：'  >
                                    <Space style={{width:'100%'}}>
                                        <Form.Item style={{width:'40% !important'}} name={'address'}><Cascader placeholder="请输入地址" options={cityData}/></Form.Item>
                                        <Form.Item style={{width:'40% !important'}} name='detailAddress'><Input placeholder="请输入详细地址"/></Form.Item>
                                    </Space>
                                </Form.Item>
                                <div style={{margin:"14px 0px"}}>尺码：</div>
                                <div className="order_detail_size">
                                    <span>S码</span><span>{curModalProject.totalprice+'元'}</span>
                                    <Form.Item name="s" labelCol={{span:0}} style={{width:'40%'}} initialValue={0}>
                                        <InputNumber min={0}/>
                                    </Form.Item>
                                    <span>件</span>
                                </div>
                                <div className="order_detail_size">
                                    <span>M码</span><span>{curModalProject.totalprice+'元'}</span>
                                    <Form.Item name="m" labelCol={{span:0}} style={{width:'40%'}} initialValue={0}>
                                        <InputNumber min={0}/>
                                    </Form.Item>
                                    <span>件</span>
                                </div>
                                <div className="order_detail_size">
                                    <span>L码</span><span>{curModalProject.totalprice+'元'}</span>
                                    <Form.Item name="l" labelCol={{span:0}} style={{width:'40%'}} initialValue={0}>
                                        <InputNumber min={0}/>
                                    </Form.Item>
                                    <span>件</span>
                                </div>
                                <div className="order_detail_button_panel">
                                    <div>当前总价为：<u>￥{totalPrice}</u></div>
                                </div>
                                <Form.Item className="order_detail_button">
                                    <Button htmlType="submit" className="shirt_detail_panel_button">立即订购</Button>
                                </Form.Item>
                            </Form>
                        </div>
                    </div>
                </Modal>
            </div>
        )
    }
}
//我的收藏界面
class ShowPanel4 extends React.Component{
    state = {
        user:{},
        collectionData:[]
    }
    //获取收藏数据
    getCollectionData = ()=>{
        let {user} = this.props;
        this.setState({user},()=>{
            axios.get(`${host}/getUserCollection`,{
                params:{
                    userid:user.userid
                }
            }).then((res)=>{
                this.setState({collectionData:[].concat(res.data)});
            })
        })
    }
    componentDidMount(){
        this.getCollectionData();
    }
    //获取时间节点
    computeDate = (date) => {
        let minute = parseInt((new Date().getTime() - date) / (1000 * 60));
        if (minute < 60) return minute + '分钟前';
        let hour = parseInt(minute / 60);
        if (hour < 24) return hour + '小时前';
        let day = parseInt(hour / 24);
        return day + '天前';
    }
    render(){
        let {collectionData} = this.state;
        return(
            <div id="show_panel_4">
                <div className="show_panel_title">我的收藏</div>
                <Divider></Divider>
                <ul id="collection_panel_container">
                    {collectionData.length !== 0?collectionData.map((item)=>(
                        <Badge.Ribbon  key={item.collectionid}  color={item.ownerid === item.userid?'green':'red'} text={item.ownerid === item.userid?'已购买':'未拥有'}>
                            <li className="collection_panel_badge">
                                <div className="collection_img_box" style={{background:`url(${host}/getStaSource?sourceUrl=${item.collectionurl})`}}/>
                                <div className="title">{item.collectionname}<span>收藏时间：{this.computeDate(item.collectdate)}</span></div>
                                <div className="description">{item.description}</div>
                                <div className="hover_download_box">
                                    <img alt="" src={require("../pic/WebIndex/download_pic.png")}/>
                                </div>
                            </li>
                        </Badge.Ribbon>
                    )):<div className="show_panel_nodata">
                    <img alt=""  src={require("../pic/WebIndex/selfdetail_project.svg").default}/>
                    <div>当前暂无收藏哦~</div>
                  </div>
                    }
                </ul>
            </div>
        )
    }
}

//我的订单界面
class ShowPanel5 extends React.Component{
    state = {
        tabItems:[
            {key:'allorders',label:"全部订单"},
            {key:'waitpost',label:"待发货"},
            {key:'waitreceive',label:'待收货'},
            {key:'already',label:'已完成'},
        ],
        orderData:[],
        filterData:[],
        user:{},
        columns:[
            {title:'产品图',key:'projectimgurl',dataIndex:'projectimgurl',align:'center' ,width:180,render:(_,record)=><div className="order_detail_img" style={{background:`url(${host}/getStaSource?sourceUrl=${record.projectimgurl})`}}/>},
            {title:'产品详情',key:'orderdetail',width:450,render:(_,record)=>
                <div className="order_detail_cell">
                    <div className="title">产品名称：{record.projectname}</div>
                    <div className="description">产品简述：{record.description}</div>
                    <div className="description">底衫名称：{record.shirtname}</div>
                    <div className="tags_box">产品材质：
                        <Tag color="gold">
                            {+record.typography === 1 ? '宽松' : +record.typography === 2 ? '常规' : +record.typography === 3 ? '修身' : '紧身'}
                        </Tag>
                        <Tag color="green">
                            {+record.thickness === 1 ? '偏薄' : +record.thickness === 2 ? '薄' : +record.thickness === 3 ? '适中' : +record.thickness === 4 ? '厚' : '偏厚'}
                        </Tag>
                        <Tag color="geekblue">
                            {+record.elasticity === 1 ? '无弹' : +record.elasticity === 2 ? '微弹' : +record.elasticity === 3 ? '适中' : '超弹'}
                        </Tag>
                    </div>
                    <div className="tags_box">运单内容：<Tag>S码：{record.ordercontent.sizeS}件</Tag><Tag>M码：{record.ordercontent.sizeM}件</Tag><Tag>L码：{record.ordercontent.sizeL}件</Tag></div>
                    <div className="description">收货地址：{record.isEditing?<Input autoFocus onBlur={(e)=>this.getAddressChange(e,record.orderid)} onPressEnter={(e)=>this.getAddressChange(e,record.orderid)} className="address_input" placeholder={record.address}/>:record.address}</div>
                    <div className="order_date"><span>下单时间：{new Date(+record.orderdate).toLocaleDateString()}</span><span>发货时间：{new Date(+record.shipdate).toLocaleDateString()}前发货</span></div>
                </div>
            },
            {title:'产品单价',key:'unitprice',align:'center',render:(_,record)=><span>￥{record.unitprice}</span>},
            {title:'产品总数',key:'quantity',align:'center',dataIndex:'quantity'},
            {title:'实付款',key:'totalprice',align:'center',render:(_,record)=><span>￥{(record.amount)}<p>（含运费：￥0.00）</p><div style={{display:record.orderstatus === 1?'block':'none'}} className="small_description">注：此时进行退换货</div><div style={{display:record.orderstatus === 1?'block':'none'}} className="small_description">买方将担负按总金额的10%运费</div></span>},
            {title:'交易操作',key:'orderope',align:'center',render:(_,record)=><div className="order_ope_box">
                <div className={record.orderstatus === 2?'disabled':''}>退款/退换货</div>
                <div onClick={()=>record.orderstatus === 0 && this.changeAddress(record)} className={record.orderstatus !== 0?'disabled':''}>修改地址</div>
                <div>申请开票</div>
            </div>}
        ],
    }
    componentDidMount(){
        this.setState({user:this.props.user},()=>{
            let {orderData} = this.state;
            if(orderData.length === 0)this.getUserOrderData();
        })
    }
    //获取当前所有订单数据
    getUserOrderData = ()=>{
        let {user} = this.state;
        axios.get(`${host}/getUserOrders`,{
            params:{
                userid:user.userid
            }
        }).then((res)=>{
            let {data} = res;
            for(let obj of data){
                obj.key = obj.orderid;
                obj.isEditing = false;
                obj.ordercontent = JSON.parse(obj.ordercontent);
            }
            this.setState({orderData:[].concat(data),filterData:[].concat(data)});
        })
    }
    //更改地址
    changeAddress = (record)=>{
        let {filterData} = this.state;
        for(let obj of filterData){
            if(obj.orderid === record.orderid)
                obj.isEditing = true;
        }
        this.setState({filterData:JSON.parse(JSON.stringify(filterData))});
    }
    //监听地址输入
    getAddressChange = (e,orderid)=>{
        let curAddress = e.target.value;
        let {filterData} = this.state;
        for(let obj of filterData){
            if(obj.orderid === orderid){
                obj.isEditing = false;
                if(curAddress.length !== 0)obj.address = curAddress;
            }
        }
        if(curAddress.length === 0){
            message.error("修改地址不能为空");
        }else{
            axios.get(`${host}/updateOrderAddress`,{
                params:{
                    orderid,
                    address:curAddress
                }
            }).then((res)=>{
                let {data} = res;
                if(data === 'success'){
                    message.success("修改成功！");
                }
            })
        }
        this.setState({filterData:JSON.parse(JSON.stringify(filterData))});
    }
    //标签页修改
    onTabChange = (value)=>{
        let {orderData} = this.state;
        if(value === 'allorders'){
            this.setState({filterData:[].concat(orderData)});
            return;
        }
        let filterValue;
        switch(value){
            case 'waitpost':
                filterValue = 0;
                break;
            case 'waitreceive':
                filterValue = 1;
                break;
            case 'already':
                filterValue = 2;
                break;
            default:
                break;
        }
        let filterData = [];
        for(let perObj of orderData){
            if(perObj.orderstatus === filterValue){
                filterData.push(perObj);
            }
        }
        this.setState({filterData});
    }
    //设置行扩展面板内容
    getTableExpandPanel = (record)=>{
        let items = [
            {
                title: '待发货',
                status: 'wait', 
                icon: <SendOutlined/>
            },
            {
                title: '待收货',
                status: 'wait',
                icon:<ShopOutlined/>              
            },
            {
                title: '订单完成',
                status: 'wait',
                icon:<SmileOutlined/>             
            }
        ]
        for(let idx in items){
            if(+idx === record.orderstatus && +idx !== items.length-1){
                items[idx].icon = <LoadingOutlined/>
                items[idx].status = 'process';
                break;
            }
            items[idx].status = 'finish';
        }
        return (
            <div className="order_detail_expand_panel">
                <div className="title">当前订单状态：</div>
                <Steps items={items}/>
            </div>
        )
    }
    render(){
        const {tabItems,filterData,columns} = this.state;
        return(
            <div id="show_panel_5">
                <div className="show_panel_title">我的订单</div>
                <Divider></Divider>
                <Tabs className="my_order_tab" items={tabItems} onChange={this.onTabChange}></Tabs>
                <Table key={filterData} dataSource={filterData} columns={columns} expandable={{expandedRowRender:(record)=>this.getTableExpandPanel(record),defaultExpandAllRows:true}}/>
            </div>
        )
    }
}

//我的版权界面
class ShowPanel6 extends React.Component{
    state = {
        tabItems:[
            {key:'allcopyright',label:"我的版权"},
            {key:'applyrecord',label:"申请记录"},
            {key:'dealrecord',label:'交易记录'}
        ],
        filterColumns:[],
        allcopyrightColumn:[
            {title:'版权名称',key:"copyrightname",align:'center',dataIndex:'copyrightname'},
            {title:'版权说明',key:"description",align:'center',dataIndex:'description'},
            {title:'NTFID号',key:"blockchaintokenid",align:'center',dataIndex:'blockchaintokenid'},
            {title:'版权内容',key:"copyrighturl",align:'center',width:'200px',render:(_,record)=><div className="img_box" style={{background:`url(${host}/getStaSource?sourceUrl=${record.copyrighturl})`}}/>},
            {title:'买入价格',key:"buyinprice",render:(_,record)=><div>￥{record.buyinprice}</div>},
            {title:'创建时间',key:"createdate",render:(_,record)=><div>{new Date(+record.createdate).toLocaleDateString()}</div>},
            {title:'当前状态',key:"isallowshop",render:(_,record)=><Tag color={record.isallowshop?'green':'red'}>{record.isallowshop?'在售':'未售'}</Tag>},
            {title:'售出操作',key:"createdate",align:"center",render:(_,record)=>
                <div className="ope_box">
                    <div>是否加入图片市场：<Switch onChange={(value)=>this.changeCopyrightStatus(record,value)} checkedChildren="确认" unCheckedChildren="取消" defaultChecked={record.isallowshop} /></div>
                    <div>当前的售卖价格：<InputNumber onBlur={(value)=>this.getCurPrice(record,value)} onPressEnter={(value)=>this.getCurPrice(record,value)} min={0.5} prefix={"￥"} defaultValue={+record.buyoutprice === 0?0.5:record.buyoutprice} disabled={record.isallowshop?false:true}/></div>
                    <div style={{display:record.isallowshop?'block':'none'}}>交易成交后预计收益为<span style={{color:record.buyoutprice-record.buyinprice>0?'green':'red',fontSize:'14px',fontWeight:'bold',margin:'0px 5px'}}>{record.buyoutprice-record.buyinprice}</span>元</div>
                </div>
            },
        ],
        applyrecordColumn:[
            {title:'申请单号',align:"center",dataIndex:'recordid',key:'recordid'},
            {title:'申请内容',align:"center",key:'sourcepic',width:'200px',render:(_,record)=>
                <div className="img_box" style={{background:`url(${host}/getStaSource?sourceUrl=${record.sourcepic})`}}/>
            },
            {title:'疑似内容',align:"center",key:'relativepic',width:'200px',render:(_,record)=>
                <div>{record.relativepic?<div className="img_box" style={{background:`url(${host}/getStaSource?sourceUrl=${record.relativepic})`}}/>:"暂无"}</div>
            },
            {title:'最高疑似度',key:'confidence',render:(_,record)=>
                <span style={{color:+(record.confidence.substring(0,record.confidence.indexOf("%")))>80?'red':'green',fontSize:'16px',fontWeight:'bold'}}>{record.confidence}</span>
            },
            {title:'申请日期',key:'applydate',render:(_,record)=>
                <div>{new Date(+record.applydate).toLocaleDateString()}</div>
            },
            {title:'申请状态',key:'result',render:(_,record)=>
                <Tag color={record.result?'green':'red'}>{record.result?'申请成功':'申请失败'}</Tag>
            },
        ],
        dealrecordColumn:[
            {title:'交易单号',key:'dealid',align:'center',dataIndex:'dealid'},
            {title:'NTFID号',key:'blockchaintokenid',align:'center',dataIndex:'blockchaintokenid'},
            {title:'销售方',key:'sellername',align:'center',render:(_,record)=>
                <div style={{textDecoration:this.state && this.state.user.userid === record.fromuserid?'underline':'none',color:this.state && this.state.user.userid === record.fromuserid?'#7C9BF0':'black'}}>{record.sellername}</div>
            },
            {title:'购买方',key:'buyername',align:'center',render:(_,record)=>
                <div style={{textDecoration:this.state && this.state.user.userid === record.touserid?'underline':'none',color:this.state && this.state.user.userid === record.touserid?'#7C9BF0':'black'}}>{record.sellername}</div>
            },
            {title:'交易时间',key:'dealdate',align:'center',render:(_,record)=>
                <div>{new Date(+record.dealdate).toLocaleString()}</div>
            },
            {title:'收支情况(单位为￥)',key:'dealprice',align:'center',render:(_,record)=>
                <div style={{color:this.state && this.state.user.userid === record.fromuserid?'green':'red',fontSize:'16px',fontWeight:'bold'}}>{this.state && this.state.user.userid === record.fromuserid?record.dealprice:0-record.dealprice}</div>
            },
        ],
        curTab:'allcopyright',
        allData:{

        },
        user:{},
        filterData:[]
    }
    //获取当前标签数据
    getCurTabData =()=>{
        let {curTab,allData,user} = this.state;
        let filterColumns = [].concat(this.state[`${curTab}Column`]);
        if(!allData[curTab]){
            let url;
            if(curTab === 'allcopyright'){
                url = 'getAllCopyright';
            }else if(curTab === 'applyrecord'){
                url = 'getApplyRecord';
            }else{
                url = 'getDealRecord';
            }
            axios.get(`${host}/${url}`,{
                params:{
                    userid:user.userid
                }
            }).then((res)=>{
                let {data} = res;
                for(let perData of data){
                    if(curTab === 'allcopyright')perData.key = perData.copyrightid;
                    else if(curTab === 'applyrecord')perData.key = perData.recordid;
                    else perData.key = perData.dealid;
                }
                allData[curTab] = [].concat(data);
                this.setState({allData,filterData:[].concat(allData[curTab]),filterColumns});
            })
        }else{
            this.setState({filterData:[].concat(allData[curTab]),filterColumns})
        }
    }
    //获取当前价格
    getCurPrice = async(record,e)=>{
        let value = e.target.value;
        let {allData,curTab,user} = this.state;
        for(let perData of allData[curTab]){
            if(perData.copyrightid === record.copyrightid){
                perData.buyoutprice = +value;
            }
        }
        let PRICE = web3.utils.toWei(value+'','ether');
        //变动价格
        await ntfMarket.methods.updateListing(_ntfContract,record.blockchaintokenid,PRICE).send({from:user.accountaddress,gas:'1000000'});
        axios.get(`${host}/changeCopyrightStatus`,{
            params:{
                type:'price',
                buyoutprice:+value,
                copyrightid:record.copyrightid
            }
        }).then((res)=>{
            if(res.data === 'success')
                this.setState({filterData:JSON.parse(JSON.stringify([].concat(allData[curTab])))})
            else
                message.error("出错了，错误信息为"+res.data);
        })
    }
    //切换标签页执行的函数
    onTabChange = (value)=>{
        this.setState({curTab:value},()=>{
            this.getCurTabData();
        });
    }
    //切换单元格中当前版权状态
    changeCopyrightStatus = async(record,value)=>{
        let {allData,curTab,user} = this.state;
        for(let perData of allData[curTab]){
            if(perData.copyrightid === record.copyrightid){
                perData.isallowshop = value;
            }
        }
        record.buyoutprice = record.buyoutprice === 0?0.5:record.buyoutprice;
        //为交易市场提供nft凭证，同时设定当前价格
        await ntfContract.methods.approve(_ntfMarket,record.blockchaintokenid).send({from:user.accountaddress,gas:'1000000'});
        let PRICE = web3.utils.toWei(record.buyoutprice+'','ether');
        await ntfMarket.methods.listItem(_ntfContract, record.blockchaintokenid,PRICE).send({from:user.accountaddress,gas:'1000000'});
        axios.get(`${host}/changeCopyrightStatus`,{
            params:{
                type:'status',
                isallowshop:+value,
                copyrightid:record.copyrightid
            }
        }).then((res)=>{
            if(res.data === 'success')
                this.setState({filterData:JSON.parse(JSON.stringify([].concat(allData[curTab])))})
            else
                message.error("出错了，错误信息为"+res.data);
        })  
    }
    componentDidMount(){
        this.setState({user:this.props.user},()=>{
            this.getCurTabData();
        })
        this.getCurPrice = throttle(this.getCurPrice,3000);
        this.changeCopyrightStatus = throttle(this.changeCopyrightStatus,3000);
    }
    render(){
        const {tabItems,filterColumns,filterData} = this.state;
        return(
            <div id="show_panel_6">
                <div className="show_panel_title">我的版权</div>
                <Divider></Divider>
                <Tabs className="my_copyright_tab" items={tabItems} onChange={this.onTabChange}></Tabs>
                <Table className="copyright_table" dataSource={filterData} columns={filterColumns}/>
            </div>
        )
    }
}