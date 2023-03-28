import React from "react";
import "../css/WebIndex.css";
import {Button,Dropdown,Carousel,Collapse,Modal,Tabs,Pagination,Tag,Input,message,Drawer,Rate,Divider,Card} from 'antd';
import {Link,useLocation,useNavigate} from 'react-router-dom';
import axios from "axios";
import SelfDetail from "./SelfDetail";
import {blockChain,_ntfMarket,ntfMarketAbi,_ntfContract} from "../data/blockData.js";
const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider(blockChain));
const ntfMarket = new web3.eth.Contract(JSON.parse(ntfMarketAbi),_ntfMarket);
//由于已经移除了withRouter，故需要自行封装withRouter
//此处可用于直接修改页面路由的跳转
export function withRouter(Child){
    return (Props)=>{
        const location = useLocation();
        const navigate = useNavigate();
        return <Child {...Props} location = {location} navigate = {navigate}/>
    }
}
const {Panel} = Collapse;
const {Search} = Input;
const host = "http://localhost:4444";
class WebIndex extends React.Component{
    state = {
        shirtBottomMenu:[
            {key:'bottom_shirt_1',label:(<div onClick={()=>this.changePath('/webindex/shirtbottom/tshirt')}>T恤定制</div>)},
            {key:'bottom_shirt_2',label:(<div onClick={()=>this.changePath('/webindex/shirtbottom/poloshirt')}>Polo衫定制</div>)},
            {key:'bottom_shirt_3',label:(<div onClick={()=>this.changePath('/webindex/shirtbottom/sweater_01')}>薄款卫衣</div>)},
            {key:'bottom_shirt_4',label:(<div onClick={()=>this.changePath('/webindex/shirtbottom/sweater_02')}>厚款卫衣</div>)},
            {key:'bottom_shirt_5',label:(<div onClick={()=>this.changePath('/webindex/shirtbottom/suit')}>外套定制</div>)},
            {key:'bottom_shirt_6',label:(<div onClick={()=>this.changePath('/webindex/shirtbottom/others')}>周边定制</div>)}
        ],
        // printMenu:[
        //     {key:'print_1',label:(<Link to={{pathname:'/modelcontrol'}}>特殊手感</Link>)},
        //     {key:'print_2',label:(<Link to={{pathname:'/modelcontrol'}}>特殊变化</Link>)},
        //     {key:'print_3',label:(<Link to={{pathname:'/modelcontrol'}}>炫酷效果</Link>)},
        //     {key:'print_4',label:(<Link to={{pathname:'/modelcontrol'}}>刺绣效果</Link>)}
        // ],
        questionMenu:[
            {key:'question_1',label:(<div onClick={()=>this.changePath('/webindex/serviceprocedure/service')}>服务流程</div>)},
            {key:'question_2',label:(<div onClick={()=>this.changePath('/webindex/serviceprocedure/question')}>常见问题</div>)},
            {key:'question_3',label:(<div onClick={()=>this.changePath('/webindex/serviceprocedure/ensure')}>售后保障和投诉</div>)},
        ],
        strategyMenu:[
            {key:'strategy_1',label:(<div onClick={()=>this.changePath('/webindex/sketchdetail/knowledge')}>底衫知识</div>)},
            {key:'strategy_2',label:(<div onClick={()=>this.changePath('/webindex/sketchdetail/technology')}>工艺知识</div>)},
            // {key:'strategy_3',label:(<div onClick={()=>this.changePath('/webindex/sketchdetail/QA')}>定制问答</div>)},
        ],
        curPath:undefined,
        user:{},
        jumpPath:'',
        drawerOpenState:false,
        dropDownItems:[
            {key:'dropItem_1',src:require("../pic/ModelPanel/self_detail.svg").default,title:'个人信息',onclick:()=>this.changePath("/webindex/selfdetail")},
            {key:'dropItem_2',src:require("../pic/ModelPanel/message_detail.svg").default,title:'我的消息',onclick:()=>this.changePath("/webindex/selfdetail")},
            {key:'dropItem_3',src:require("../pic/ModelPanel/project_detail.svg").default,title:'我的项目',onclick:()=>this.changePath("/webindex/selfdetail")},
            {key:'dropItem_4',src:require("../pic/ModelPanel/collect_detail.svg").default,title:'我的收藏',onclick:()=>this.changePath("/webindex/selfdetail")},
            {key:'dropItem_6',src:require("../pic/ModelPanel/login_out.svg").default,title:'退出登录',onclick:()=>this.loginOutFn()},
        ]
    }
    //首次进入时获取当前路由地址
    componentDidMount(){
        let {curPath} = this.state;
        let {pathname} = this.props.location;
        curPath = pathname;
        this.setState({curPath});
        this.checkLoginStatus();
    }
    //切换路径函数，包括页面目录显示与子内容的显示
    changePath = (path)=>{
        this.closeSelfDraw();
        let {curPath} = this.state;
        curPath = path;
        //在赋值结束后执行回调进行切换
        this.setState({curPath},()=>{
            //实现网页不刷新修改url
            window.history.pushState({}, 0, curPath);
        });
        window.scrollTo({
            top:0,
            behavior:'smooth'
        })
        
    }
    //检测当前是否有用户登录
    checkLoginStatus = ()=>{
        let userData = localStorage.getItem("commonUserData");
        if(userData){
            this.setState({user:JSON.parse(userData)});
        }
    }
    //跳转到登录界面
    goToLogin =()=>{
        let jumpPath = '/commonlogin';
        this.setState({jumpPath},()=>{
            message.info("当前未登录，即将为您跳转至登录界面");
            setTimeout(()=>this.jumpLink.click(),3000);
        })
    }
    //打开个人信息抽屉界面
    openSelfDraw = ()=>{
        this.setState({drawerOpenState:true});
    }
    //关闭个人信息抽屉界面
    closeSelfDraw = ()=>{
        this.setState({drawerOpenState:false});
    }
    //退出当前账号登录
    loginOutFn = () => {
        let user = {};
        this.closeSelfDraw();
        localStorage.removeItem("commonUserData");
        this.setState({ user }, () => {
            this.goToLogin();
        })
    }
    //测试调用区块链
    // testBlockChain = ()=>{
    //     let web3 = new Web3(new Web3.providers.HttpProvider(blockChain));
    //     web3.eth.getAccounts(async (err,result)=>{
    //         //获取临时测试账户
    //         let testUsers = result.slice(6,8);
    //         //获取智能合约实例，包括图片市场与图片转ntf合约
    //         let ntfMarket = new web3.eth.Contract(JSON.parse(ntfMarketAbi),_ntfMarket);
    //         let ntfContract = new web3.eth.Contract(JSON.parse(ntfContractAbi),_ntfContract);
            //图片存储地址
            // let token_url = "http://localhost:4444/getStaSource?sourceUrl=pic/picCopyRight/nid_9655_2023030620133639_copyright.png"
            // //建立图片NFT，获取建立所建立的NFTid，需要注意强转为数字
            // let token_id = await ntfContract.methods.mintNFT(testUsers[0],token_url).send({from:'0xF7E434dAC1eeCf66F009fE8339F441B9cc7fEc46',gas:'1000000'});
            // token_id = +token_id.events.NFTMinted.returnValues.tokenId;
            // //调取合约事件授权于图片市场，否则将无法交易
            // await ntfContract.methods.approve(_ntfMarket,token_id).send({from:testUsers[0],gas:'1000000'});
            // //设置图片价格（输入为eth，即以太币，需要转为wei，区块链最小单位，用于浮点数的表达）
            // let PRICE = web3.utils.toWei("10",'ether');
            // //添加图片NFT至图片市场
            // await ntfMarket.methods.listItem(_ntfContract, token_id,PRICE).send({from:testUsers[0],gas:'1000000'});
            // //从图片市场购买图片NFT
            // await ntfMarket.methods.buyItem(_ntfContract,token_id).send({from:testUsers[1],gas:'1000000',value:PRICE})
            // //被购方从图片市场获取所得收益
            // await ntfMarket.methods.withdrawProceeds().send({from:testUsers[0]});
            // //获取当前账户存在图片市场还有多少钱
            // console.log(await ntfMarket.methods.getProceeds(testUsers[0]).call());
    //     })
    // }


    render(){
        let {shirtBottomMenu,questionMenu,strategyMenu,curPath,user,jumpPath,drawerOpenState,dropDownItems} = this.state;
        return (
            <div className="web_panel">
                <div id="web_panel_fixedbar">
                    <div id="web_panel_fixedbar_title">
                        <svg className='icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80.01 100"><g fillRule="evenodd"><path d="M80 3.77C59.39 19.79 5.22 27 0 46.84v31.38c0 8.5 2.88 15.55 10.74 21.78C.7 68.08 77.26 73.05 80 45.87z" fill="#114fee" /><path d="M51.69 17.48L51.59 0C29.1 15.36 2 18.09 0 46.84v31.38a27 27 0 0 0 2.39 11.67c-.34-34.1 49.56-20.5 49.4-52.8z" fill="#2ddaff" opacity=".8" /></g></svg>
                        易纹创
                    </div>
                    <ul id="web_panel_fixedbar_clickBar">
                        {/* <Link to={{pathname:curPath}} ref={(elem)=>this.jumpLink = elem} style={{display:'none'}}></Link> */}
                        <li onClick={()=>this.changePath('/webindex/home')} className={curPath && curPath.indexOf('/home')>=0?'webpanel_active_li':''}>
                            <span>首页</span>
                            <img alt="" src={require("../pic/WebIndex/index_icon.svg").default}/>
                        </li>
                        <Dropdown menu={{items:shirtBottomMenu}}>
                            <li className={curPath && curPath.indexOf('/shirtbottom')>=0?'webpanel_active_li':''}>
                                <span>底衫目录</span>
                                <img alt="" src={require("../pic/WebIndex/shirt_bottom.svg").default}/>
                            </li>
                        </Dropdown>
                        <li onClick={()=>this.changePath('/webindex/picshop')}>
                            <span>图案市场</span>
                            <img alt="" src={require("../pic/WebIndex/shop_icon.svg").default}/>
                        </li>
                        {/* <Dropdown menu={{items:printMenu}}>
                            <li>
                                <span>印花工艺</span>
                                <img alt="" src={require("../pic/WebIndex/print_icon.svg").default}/>
                            </li>
                        </Dropdown> */}
                        <Dropdown menu={{items:questionMenu}}>
                            <li>
                                <span>常见问题</span>
                                <img alt="" src={require("../pic/WebIndex/question_icon.svg").default}/>
                            </li>
                        </Dropdown>
                        <Dropdown menu={{items:strategyMenu}}>
                            <li>
                                <span>定制攻略</span>
                                <img alt="" src={require("../pic/WebIndex/strategy_icon.svg").default}/>
                            </li>
                        </Dropdown>
                        <li onClick={()=>this.changePath("/webindex/about")}>
                            <span>关于平台</span>
                            <img alt="" src={require("../pic/WebIndex/print_icon.svg").default}/>
                        </li>
                    </ul>
                    <Link to={{pathname:'/modelcontrol'}}><Button onClick={()=>this.changePath("/modelcontrol")}>开始定制</Button></Link>
                    {JSON.stringify(user) === '{}'?<div id="web_panel_unlogin_status" onClick={this.goToLogin}>未登录</div>:
                    <img id="web_panel_user_avatar" onClick={this.openSelfDraw} src={user.avatar?`${host}/getStaSource?sourceUrl=${user.avatar}`:require('../pic/ModelPanel/user_temp_avatar.png')} alt="暂时无法显示" />}
                    <Drawer className="web_panel_self_detail" style={{ display: JSON.stringify(user) === '{}' ? 'none' : 'block' }} placement={'right'} closable={false} open={drawerOpenState} onClose={this.closeSelfDraw} title={
                        <div className="selfdraw_title">
                            <img alt="" src={user.avatar?`${host}/getStaSource?sourceUrl=${user.avatar}`:require('../pic/ModelPanel/user_temp_avatar.png')} />
                            <div>
                                <div><span>{user.username}</span></div>
                                <div><span>ID：{user.userid}</span><span>余额：{user.account}元</span></div>
                            </div>
                        </div>
                    }>
                        <div>
                            <span>信用评级：</span>
                            <Rate disabled defaultValue={user.credit} />
                        </div>
                        <Divider />
                        <div className='self_detail_somedetail'>
                            <div className='self_detail_title'>我的订单</div>
                            <div className='self_detail_container'>
                                <div onClick={()=>this.changePath("/webindex/selfdetail")}><img alt='' src={require("../pic/ModelPanel/wait_pay.svg").default} /><span>待付款</span></div>
                                <div onClick={()=>this.changePath("/webindex/selfdetail")}><img alt='' src={require("../pic/ModelPanel/wait_post.svg").default} /><span>待发货</span></div>
                                <div onClick={()=>this.changePath("/webindex/selfdetail")}><img alt='' src={require("../pic/ModelPanel/wait_receive.svg").default} /><span>待收货</span></div>
                                <div onClick={()=>this.changePath("/webindex/selfdetail")}><img alt='' src={require("../pic/ModelPanel/refund.svg").default} /><span>退款/售后</span></div>
                            </div>
                        </div>
                        <Divider />
                        <div className='self_detail_somedetail'>
                            <div className='self_detail_title'>我的版权</div>
                            <div className='self_detail_container'>
                                <div onClick={()=>this.changePath("/webindex/selfdetail")}><img alt='' src={require("../pic/ModelPanel/copyright_all.svg").default} /><span>我的版权</span></div>
                                <div onClick={()=>this.changePath("/webindex/selfdetail")}><img alt='' src={require("../pic/ModelPanel/apply_all.svg").default} /><span>申请记录</span></div>
                                <div onClick={()=>this.changePath("/webindex/selfdetail")}><img alt='' src={require("../pic/ModelPanel/deal_all.svg").default} /><span>交易记录</span></div>
                            </div>
                        </div>
                        <Divider />
                        <ul className='self_detail_ul'>
                            {dropDownItems.length !== 0 ? dropDownItems.map((item) =>
                                <li key={item.key} onClick={()=>item.onclick()}>
                                    <img alt='' src={item.src} />
                                    <span>{item.title}</span>
                                </li>
                            ) : ''}
                        </ul>
                    </Drawer>
                </div>
                <div id="web_panel_content">
                    {curPath?<MatchComponent user={user} onChangePath={(path)=>{this.changePath(path)}} path={curPath}/>:''}
                </div>
                <Link to={{pathname:jumpPath}} ref={(elem)=>this.jumpLink = elem} style={{display:'none'}}/>
            </div>
        )
    }
}
//中间匹配组件，用于判断当前路由以此显示不同内容
class MatchComponent extends React.Component{
    //监听父组件的路由切换函数
    changePath = (path)=>{
        this.props.onChangePath(path);
    }
    render(){
        let {path,user} = this.props;
        let matchComponent;
        if(path.indexOf('/home')>=0){
            matchComponent = <WebIndexHome onChangePath={(path)=>{this.changePath(path)}}/>
        }else if(path.indexOf('/shirtbottom')>=0){
            matchComponent = <ShirtBottomMenu onChangePath={(path)=>{this.changePath(path)}} path={path}/>
        }else if(path.indexOf('/picshop')>=0){
            matchComponent = <PicShopPanel path={path} user={user}/>
        }else if(path.indexOf('/serviceprocedure')>=0){
            matchComponent = <ServiceProcedurePanel onChangePath={(path)=>{this.changePath(path)}} path={path}/>
        }else if(path.indexOf('/sketchdetail')>=0){
            matchComponent = <SketchDetail onChangePath={(path)=>{this.changePath(path)}} path={path}/>
        }else if(path.indexOf('/about')>=0){
            matchComponent = <AboutPlatform />
        }else{
            matchComponent = <SelfDetail onChangePath={(path)=>{this.changePath(path)}}/>
        }
        return(
            <>
                {matchComponent}
            </>
        )
    }
}
//首页内容展现
class WebIndexHome extends React.Component{
    render(){
        return(
            <div id="webindex_home_panel">
                <div className="carousel_panel">
                    <Carousel autoplay>
                        <div><img alt="" className="carousel_img" src={require("../pic/WebIndex/carousel1.jpg")}/></div>
                        <div><img alt="" className="carousel_img" src={require("../pic/WebIndex/carousel2.jpg")}/></div>
                        <div><img alt="" className="carousel_img" src={require("../pic/WebIndex/carousel3.jpg")}/></div>
                    </Carousel>
                </div>
                <div id="tags_panel">
                    <div>
                        <img className="tags_panel_img" alt="" src={require('../pic/WebIndex/tags_order_icon.svg').default}/>
                        <div className="tags_panel_content">
                            <span>50件起订</span>
                            <span>支持底衫看样/工艺看样/打样</span>
                        </div>
                    </div>
                    <div>
                        <img className="tags_panel_img" alt="" src={require('../pic/WebIndex/tags_price_icon.svg').default}/>
                        <div className="tags_panel_content">
                            <span>精细化定价</span>
                            <span>拒绝粗暴一口价，先出图再报价</span>
                        </div>
                    </div>
                    <div>
                        <img className="tags_panel_img" alt="" src={require('../pic/WebIndex/tags_factory_icon.svg').default}/>
                        <div className="tags_panel_content">
                            <span>源头工厂</span>
                            <span>自营印花基地，服务全国可加急</span>
                        </div>
                    </div>
                </div>  
                <div className="showpics_panel">
                    <div className="showpics_title">
                        <div>适合长期穿着的高品质衣衫</div>
                        <div>平台与众多国际品牌共享供应链，提供不同类别、不同价位的高品质底衫供你选择</div>
                    </div>
                    <div className="showpics_content">
                        <div id="showpics_leftpart1">
                            <div id="showpics_leftpart1_top">
                                <img alt="" className="showpics_img" src={require('../pic/WebIndex/showpics_1/Tshirt1.png')}/>
                            </div>
                            <div id="showpics_leftpart1_bottom">
                                <div id="showpics_leftpart1_left">
                                    <img alt="" className="showpics_img" src={require('../pic/WebIndex/showpics_1/Polo1.png')}/>
                                </div>
                                <div id="showpics_leftpart1_right">
                                    <img alt="" className="showpics_img" src={require('../pic/WebIndex/showpics_1/Sweater1.png')}/>
                                </div>
                            </div>
                        </div>
                        <div id="showpics_rightpart1">
                            <div id="showpics_rightpart1_left">
                                <img alt="" className="showpics_img" src={require('../pic/WebIndex/showpics_1/Suit1.jpg')}/>
                            </div>
                            <div id="showpics_rightpart1_right">
                                <div id="showpics_rightpart1_right_top">
                                    <img alt="" className="showpics_img" src={require('../pic/WebIndex/showpics_1/Hat1.jpg')}/>
                                </div>
                                <div id="showpics_rightpart1_right_bottom">
                                    <img alt="" className="showpics_img" src={require('../pic/WebIndex/showpics_1/Bag1.png')}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="showpics_panel">
                    <div className="showpics_title">
                        <div>精美且不易脱落的印花工艺</div>
                        <div>平台拥有业内齐全的印花工艺，通过精湛技术与进口设备，让印花更好的还原您的文化元素</div>
                    </div>
                    <div className="showpics_content showpics_content2">
                        <div id="showpics_leftpart2">
                            <div style={{backgroundImage:`url(${require('../pic/WebIndex/showpics_2/shirt_print1.png')})`}}></div>
                            <div style={{backgroundImage:`url(${require('../pic/WebIndex/showpics_2/shirt_print2.png')})`}}></div>
                            <div style={{backgroundImage:`url(${require('../pic/WebIndex/showpics_2/shirt_print3.png')})`}}></div>
                            <div style={{backgroundImage:`url(${require('../pic/WebIndex/showpics_2/shirt_print4.png')})`}}></div>
                        </div>
                        <div id="showpics_rightpart2">
                            <div id="showpics_rightpart2_top">
                                <div style={{backgroundImage:`url(${require('../pic/WebIndex/showpics_2/shirt_print5.png')})`}}></div>
                                <div style={{backgroundImage:`url(${require('../pic/WebIndex/showpics_2/shirt_print6.png')})`}}></div>
                            </div>
                            <div id="showpics_rightpart2_bottom">
                                <div style={{backgroundImage:`url(${require('../pic/WebIndex/showpics_2/shirt_print7.jpg')})`}}></div>
                                <div style={{backgroundImage:`url(${require('../pic/WebIndex/showpics_2/shirt_print8.jpg')})`}}></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="showpics_panel">
                    <div className="showpics_title">
                        <div>行业领先的卓越服务</div>
                        <div>易纹创精益求精的完善服务，不断引领着行业标准</div>
                    </div>
                    <div className="showpics_content3">
                        <div>
                            <span>1/3/7/45</span>
                            <span>1个工作日安排寄样</span>
                            <span>3个工作日完成打样</span>
                            <span>7个工作日生产发货</span>
                            <span>45天内支持原价加单</span>
                            <img alt="" src={require("../pic/WebIndex/showpics_3/show_pics_calendar.svg").default}/>
                        </div>
                        <div>
                            <span>更适合企业的服务能力</span>
                            <span>精细核算报价</span>
                            <span>权责要求明晰</span>
                            <span>持续服务能力</span>
                            <span>非标产品开发</span>
                            <img alt="" src={require("../pic/WebIndex/showpics_3/show_pics_service.svg").default}/>
                        </div>
                        <div>
                            <span>热情尽责的客户服务</span>
                            <span>我们积极主动且勤奋的</span>
                            <span>专属顾问，将直接与您</span>
                            <span>对接，提供合适、性价</span>
                            <span>比高的方案</span>
                            <img alt="" src={require("../pic/WebIndex/showpics_3/show_pics_client.svg").default}/>
                        </div>
                        <div>                      
                            <span>完善省心的售后保障</span>
                            <span>14天更换准则</span>
                            <span>30天修补服务</span>
                            <span>45天加单服务</span>
                            <span>48小时响应机制</span>
                            <img alt="" src={require("../pic/WebIndex/showpics_3/show_pics_like.svg").default}/>
                        </div>
                    </div>
                </div>
                <div className="customized_process_panel">
                    <div className="showpics_title">
                        <div>定制流程</div>
                    </div>
                    <div className="process_panel_content">
                        <div>
                            <div>
                                <span>01</span>
                                <span>自主设计</span>
                                <div className="process_decoration_line"></div>
                            </div>
                            <span>美好定制，从此开始</span>
                        </div>
                        <img alt="" src={require("../pic/WebIndex/customized_process_arrow.svg").default}/>
                        <div>
                            <div>
                                <span>02</span>
                                <span>获取方案</span>
                                <div className="process_decoration_line"></div>
                            </div>
                            <span>底衫设计、图稿设计、方案报价</span>
                        </div>
                        <img alt="" src={require("../pic/WebIndex/customized_process_arrow.svg").default}/>
                        <div>
                            <div>
                                <span>03</span>
                                <span>下单生产</span>
                                <div className="process_decoration_line"></div>
                            </div>
                            <span>确定尺码、付款生产</span>
                        </div>
                    </div>
                </div>
                <div className="reason_panel">
                    <div className="showpics_title">
                        <div>
                            选择易纹创的六大理由
                        </div>
                    </div>
                    <div className="reason_panel_content">
                        <div>
                            <div style={{backgroundImage:`url(${require('../pic/WebIndex/reason_panel/reason_panel_1.jpg')})`}}>
                                底衫质量好，选择多样
                            </div>
                            <div>八大环节甄选，国际品牌同源供应链</div>
                        </div>
                        <div>
                            <div style={{backgroundImage:`url(${require('../pic/WebIndex/reason_panel/reason_panel_2.jpg')})`}}>
                                工艺选择多，印花牢固
                            </div>
                            <div>进口环保颜料，专业设备，大牌品质</div>
                        </div>
                        <div>
                            <div style={{backgroundImage:`url(${require('../pic/WebIndex/reason_panel/reason_panel_3.jpg')})`}}>
                                品质把控严，专业细节
                            </div>
                            <div>十三道工序控质量，四道品检保品质</div>
                        </div>
                        <div>
                            <div style={{backgroundImage:`url(${require('../pic/WebIndex/reason_panel/reason_panel_4.jpg')})`}}>
                                生产实力强，产能稳定
                            </div>
                            <div>自有工厂，自研信息系统，货期保障</div>
                        </div>
                        <div>
                            <div style={{backgroundImage:`url(${require('../pic/WebIndex/reason_panel/reason_panel_5.jpg')})`}}>
                                服务经验多，企业标准
                            </div>
                            <div>在与高标准的采购方合作中不断成长</div>
                        </div>
                        <div>
                            <div style={{backgroundImage:`url(${require('../pic/WebIndex/reason_panel/reason_panel_6.jpg')})`}}>
                                品牌有保障，资本背书
                            </div>
                            <div>顶级VC机构IDG联合投资</div>
                        </div>
                    </div>
                </div>
                <CommonBottom/>
            </div>
        ) 
    }
}
//底衫页面内容展示
class ShirtBottomMenu extends React.Component{
    state = {
        shirtData:{},
        curModalData:{},
        detailPanelState:false,
        picData:{}
    }
    changePath = (path)=>{
        let detailPanelState = false;
        this.setState({detailPanelState});
        this.props.onChangePath(path);
    }
    //切换当前只显示界面，如仅显示衬衫及其分类等
    getShirtData = (path)=>{
        let {shirtData} = this.state;
        let type = 'tshirt';
        if(path.indexOf("poloshirt")>=0){
            type = "poloshirt";
        }else if(path.indexOf("sweater_01")>=0){
            type = "sweater_01";
        }else if(path.indexOf("sweater_02")>=0){
            type = "sweater_02";
        }else if(path.indexOf("suit")>=0){
            type = 'suit';
        }else if(path.indexOf("others")>=0){
            type = 'others';
        }
        //判断数据是否已经获取过，若已存在则无需重复发送axios请求获取数据
        if(!shirtData[type]){
            axios.get(`${host}/shirtOpe`,{
                params:{
                    type
                }
            }).then((res)=>{
                //遍历数据，将数据转换为树形结构
                let {data} = res;
                let tempObj = [];
                let dict = {};
                let idx = 1;
                for(let perdata of data){
                    if(dict[perdata.categoryid]){
                        tempObj[dict[perdata.categoryid]-1].data.push(perdata);
                    }else{
                        dict[perdata.categoryid] = idx;
                        //以对象形式将数据存入data属性中
                        tempObj[idx-1] = {
                            categoryname:perdata.categoryname,
                            data:[perdata]
                        }
                        idx++;
                    }
                }
                shirtData[type] = tempObj;
                this.setState({shirtData});
            })
        }
    }
    //当前暂行确定以modal展现每个底衫信息
    openShirtDetailData = (data)=>{
        let {picData} = this.state;
        let curModalData = JSON.parse(data);
        if(!picData[curModalData.shirtid]){
            axios.get(`${host}/getStaDir`,{
                params:{
                    reqType:'shirtDetailPic',
                    picDirId:curModalData.shirtid
                }
            }).then((res)=>{
                picData[curModalData.shirtid] = Array.from(res.data);
                this.setState({picData});
            })
        }
        let detailPanelState = true;
        this.setState({curModalData,detailPanelState});
    }
    //关闭modal函数
    closeShirtDetailData = ()=>{
        let detailPanelState = false;
        this.setState({detailPanelState});
    }
    render(){
        let {path} = this.props;
        let {shirtData,detailPanelState,curModalData,picData} = this.state;
        this.getShirtData(path);
        path = path.substring(path.lastIndexOf("/")+1);
        return(
            <div id="shirtbottom_panel">
                <div className="shirtbottom_panel_title">
                    <span>多种定制品类，按需选择</span><br />
                    <span>以下展示价格为底衫价，不包含印花费用</span>
                </div>
                <div className="shirtbottom_panel_select">
                    <div onClick={()=>{this.changePath('/webindex/shirtbottom/tshirt')}} className={path === 'tshirt'? "shirtbottom_panel_select_active" : ''}>
                        <img alt="" src={require('../pic/ModelPanel/picForModel/T-shirt.svg').default} />
                        <span>T恤</span>
                    </div>
                    <div onClick={()=>{this.changePath('/webindex/shirtbottom/poloshirt')}} className={path === 'poloshirt'? "shirtbottom_panel_select_active" : ''}>
                        <img alt="" src={require('../pic/ModelPanel/picForModel/polo_shirt.svg').default} />
                        <span>Polo衫</span>
                    </div>
                    <div onClick={()=>{this.changePath('/webindex/shirtbottom/sweater_01')}} className={path === 'sweater_01'? "shirtbottom_panel_select_active" : ''}>
                        <img alt="" src={require('../pic/ModelPanel/picForModel/sweater.svg').default} />
                        <span>薄款卫衣</span>
                    </div>
                    <div onClick={()=>{this.changePath('/webindex/shirtbottom/sweater_02')}} className={path === 'sweater_02' ? "shirtbottom_panel_select_active" : ''}>
                        <img alt="" src={require('../pic/ModelPanel/picForModel/sweater.svg').default} />
                        <span>厚款卫衣</span>
                    </div>
                    <div onClick={()=>{this.changePath('/webindex/shirtbottom/suit')}} className={path === 'suit' ? "shirtbottom_panel_select_active" : ''}>
                        <img alt="" src={require('../pic/ModelPanel/picForModel/overcoat.svg').default} />
                        <span>外套</span>
                    </div>
                    <div onClick={()=>{this.changePath('/webindex/shirtbottom/others')}} className={path === 'others'? "shirtbottom_panel_select_active" : ''}>
                        <img alt="" src={require('../pic/ModelPanel/picForModel/hat.svg').default} />
                        <span>周边</span>
                    </div>
                </div>
                <div className="shirtbottom_panel_content">
                    {shirtData[path] && shirtData[path].length ?
                        <Collapse
                            bordered={false}
                            defaultActiveKey={shirtData[path].reduce((cur, next, idx) => cur = cur.concat([idx+'']), [])}
                            style={{width:'80%',marginLeft:'10%',marginTop:'50px',marginBottom:'150px'}}
                        >
                            {shirtData[path].map((item, idx) =>
                                <Panel header={item.categoryname} key={idx+''} style={{marginBottom:'25px'}}>
                                    <div className="shirt_pre_panel">
                                        {item.data.map((item)=>
                                            // 每个底衫预览信息展示
                                            <div key={item.shirtid} onClick={()=>this.openShirtDetailData(JSON.stringify(item))}>
                                                <img className="shirt_pre_pic" alt="" src={`${host}/getStaSource?sourceUrl=${item.prepic}`}/>
                                                <div className="shirt_pre_title">
                                                    <span>{item.shirtname}</span>
                                                    <span>￥<p style={{display:'inline-block'}}>{item.price}</p> 起</span>
                                                </div>
                                                <div className="shirt_pre_line"/>
                                                <div className="shirt_pre_content">
                                                    <img alt='' src={require("../pic/WebIndex/shirt_bottom/selling_point.svg").default}/>
                                                    <span>{item.sellingpoint}</span>
                                                </div>
                                                <div className="shirt_pre_content">
                                                    <img alt='' src={require("../pic/WebIndex/shirt_bottom/description.svg").default}/>
                                                    <span>{item.us_description}</span>
                                                </div>
                                            </div>   
                                        )}
                                    </div>
                                </Panel>
                            )}
                        </Collapse>
                        : <div className="shirt_nodata">
                            当前暂无上架相关产品
                        </div>
                    }
                    <CommonBottom/>
                </div>
                <Modal footer={null} className="shirt_detail_panel" open={detailPanelState} onCancel={this.closeShirtDetailData}>
                    <div className="shirt_detail_panel_nav">
                        <span onClick={()=>{this.changePath('/webindex/home')}}>首页</span> | <span onClick={this.closeShirtDetailData}>{curModalData.categoryname}</span> | {curModalData.shirtname}
                    </div>
                    <div className="shirt_detail_panel_top">
                        <img alt="" src={`${host}/getStaSource?sourceUrl=${curModalData.prepic}`}/>
                        <div style={{width:'100%'}}>
                            <span>{curModalData.shirtname}</span>
                            <span className="description">卖点：{curModalData.sellingpoint}</span>
                            <span className="description">说明：{curModalData.us_description}</span>
                            <div className="price_part">
                                <span>价格：<span>￥{curModalData.price}</span>+印花费用</span>
                                <span>材质：{curModalData.materialname}({curModalData.ma_description})</span>
                                <span>服务：全场包邮/七个工作日发货 可加急/免费看样</span>
                                <span>尺寸：{curModalData.size}</span>
                            </div>
                            <span className="description">
                                <span>
                                    版型：{+curModalData.typography === 1?'宽松':+curModalData.typography === 2?'常规':+curModalData.typography === 3?'修身':'紧身'}
                                </span>
                                <span>
                                    厚度：{+curModalData.thickness === 1?'偏薄':+curModalData.thickness === 2?'薄':+curModalData.thickness === 3?'适中':+curModalData.thickness === 4?'厚':'偏厚'}
                                </span>
                                <span>
                                    弹性：{+curModalData.elasticity === 1?'无弹':+curModalData.elasticity === 2?'微弹':+curModalData.elasticity === 3?'适中':'超弹'}
                                </span>
                            </span>
                            <Link to={{pathname:'/modelcontrol'}}><Button className="shirt_detail_panel_button">立即定制</Button></Link>
                            <Link to={{pathname:'/modelcontrol'}}><Button className="shirt_detail_panel_button">免费咨询</Button></Link>
                        </div>
                    </div>
                    <div className="shirt_detail_panel_bottom">
                        {picData[curModalData.shirtid]?picData[curModalData.shirtid].map((item,idx)=>
                            <img alt="" key={idx} src={`${host}/getStaSource?sourceUrl=pic/shirtDetailPic/${curModalData.shirtid}/${item}`}/>
                        ):''}
                    </div>
                </Modal>
            </div>
        )
    }
}
//图片市场内容展示
class PicShopPanel extends React.Component{
    state = {
        tagsData : [
            {title:'文化衫',tags:['热门','广告衫','团建','年会','周年庆','工作服']},
            {title:'行业',tags:['餐饮','汽修','舞蹈培训','门窗','建筑']},
            {title:'班服',tags:['教师节','推荐','班级','专业','个性','高中','大学']},
            {title:'聚会',tags:['最受欢迎','同学聚会','战友聚会','一十周年','二十周年','三十周年']},
            {title:'素材元素',tags:['热门推荐','动物','字母','文字','logo','风格']}
        ],
        tabItems:[
            {key:'product',label:'产品/实物'},
            {key:'effect',label:'装饰/效果'},
            {key:'shape',label:'形状图标'},
            {key:'texture',label:'纹理边框'},
        ],
        curTabData:{},
        curTab:'product',
        officialCur:1,
        curPicDataPanel:false,
        curPicData:'',
        recommandData:[],
        userPicData:[],
        user:{}
    }
    componentDidMount(){
        this.setState({user:this.props.user},async()=>{
            this.getTabPicData();
            this.getUserPic();
            
        })
    }
    //切换标签页后执行的回调
    picShopTabChange = (value)=>{
        let curTab = value;
        let officialCur = 1;
        this.setState({curTab,officialCur},()=>{
            this.getTabPicData();
        });
    }
    //获取标签页的图片资源
    getTabPicData = ()=>{
        let {curTab,curTabData} = this.state;
        //依据数据对象中是否已经存在数据来确定是否要发axios请求
        if(!curTabData[curTab]){
            axios(`${host}/getStaDir`,{
                params:{
                    reqType:'picShop',
                    picDirId:curTab
                }
            }).then((res)=>{
                curTabData[curTab] = res.data;
                this.setState({curTabData});
            })
        }
    }
    //点击换页按钮后执行的
    handleOpicPage = (page)=>{
        let officialCur = page;
        this.setState({officialCur});
        window.scrollTo({
            top:1000,
            behavior:"smooth"
        })
    }
    //关闭图片详情模态框
    closePicDataPanel = ()=>{
        let curPicDataPanel = false;
        this.setState({curPicDataPanel});
    }
    //打开图片详情框函数，在打开后随机获取四张图片作为推荐数据
    openPicDataPanel = (value)=>{
        let curPicData = value;
        this.setState({curPicData},()=>{
            this.getRandomData();
            this.setState({curPicDataPanel:true})
        })
    }
    //获取推荐数据
    getRandomData = ()=>{
        let {curTab,curTabData} = this.state;
        let len = curTabData[curTab].length;
        let recommandData = [];
        for(let i = 0;i<4;i++){
            recommandData.push(curTabData[curTab][parseInt(len*Math.random())]);
        }
        this.setState({recommandData});
    }
    //获取用户图片数据
    getUserPic = ()=>{
        let {userPicData,user} = this.state;
        if(userPicData.length === 0){
            axios.get(`${host}/getUserCopyrightPic`,{
                params:{
                    userid:user.userid
                }
            }).then((res)=>{
                this.setState({userPicData:[].concat(res.data)})
            })
        }
    }
    //购买图片版权，通过区块链操作
    purchaseCopyright = async(tokenId,accountAddress,price,sellerUserid,copyrightid)=>{
        let {user} = this.state;
        let PRICE = web3.utils.toWei(price+'','ether');
        try {
            //买方调用方法获取版权扣取余额，并返回当前余额
            await ntfMarket.methods.buyItem(_ntfContract,tokenId).send({from:user.accountaddress,gas:'1000000',value:PRICE})
            await ntfMarket.methods.withdrawProceeds().send({from:accountAddress,gas:'1000000'});
            let buyerBalance = Number(web3.utils.fromWei(await web3.eth.getBalance(user.accountaddress),"ether")).toFixed(2);
            //卖方调用方法从图片市场取回金额，并返回当前余额
            let sellerBalance = Number(web3.utils.fromWei(await web3.eth.getBalance(accountAddress),"ether")).toFixed(2);
            axios.get(`${host}/updateUserAccount`,{
                params:{
                    buyerUserid:user.userid,
                    sellerUserid,
                    buyerUserBalance:buyerBalance,
                    sellerUserBalance:sellerBalance,
                    buyInPrice:price,
                    copyrightid,
                    blockchaintokenid:tokenId
                }
            }).then((res)=>{
                message.success("购买成功！详情请前往个人中心-我的版权中进行查看！");
                //购买后应该在其他用户版权表中删除
                let {userPicData} = this.state;
                user.account = buyerBalance;
                userPicData = Array.from(userPicData);
                for(let idx in userPicData){
                    if(userPicData[idx].copyrightid === copyrightid){
                        userPicData.splice(idx,1);
                    }
                }
                //更新localStorage数据
                localStorage.setItem('commonUserData', JSON.stringify(user));
                this.setState({userPicData,user});
            })
        } catch (error) {
            console.log(error);
            message.info("余额不足，请及时充值！");
        }
    }
    render(){
        const {tagsData,tabItems,curTab,curTabData,officialCur,curPicDataPanel,curPicData,recommandData,userPicData,user} = this.state;
        return(
            <div id="picshop_panel">
                <div className="carousel_panel">
                    <Carousel autoplay>
                        <div><img alt="" className="carousel_img" src={require("../pic/WebIndex/picshop/banner_1.jpg")}/></div>
                        <div><img alt="" className="carousel_img" src={require("../pic/WebIndex/picshop/banner_2.jpg")}/></div>
                    </Carousel>
                </div>
                <div className="picshop_tags">
                    {tagsData.map((item,idx)=>
                        (
                        <div key={idx}>
                            <img alt="" src={require(`../pic/WebIndex/picshop/pre_show${idx+1}.jpg`)}/>
                            <p>{item.title}</p>
                            {item.tags.map((item,idx)=>
                                <span key={idx} className="picshop_tag_item">{item}</span>
                            )}
                        </div>
                        )
                    )}
                </div>
                <Tabs className="picshop_tabs" defaultActiveKey="product" items={tabItems} onChange={this.picShopTabChange}/>
                <div className="picshop_tabs_content">
                    {curTabData[curTab]?curTabData[curTab].slice((officialCur-1)*20,officialCur*20).map((item,idx)=>
                        <div key={idx} onClick={()=>this.openPicDataPanel(item)}><img alt="" title={item} src={`${host}/getStaSource?sourceUrl=/pic/picShop/officialPic/${curTab}/${item}`}/></div>
                    ):''}
                </div>
                <Pagination defaultPageSize={20} showSizeChanger={false} className="picshop_pagination" defaultCurrent={1} current={officialCur} onChange={this.handleOpicPage} total={curTabData[curTab]?+curTabData[curTab].length:0}/>
                <div className="user_picshop">
                    <div className="title"><img alt="" src={require("../pic/WebIndex/picshop/self_design.svg").default}/>用户自设计项目</div>
                    <div className="content">
                        {userPicData.length?userPicData.map((item)=>
                            <Card key={item.copyrightid} className="user_piccard" cover={
                                <div className="img_box" style={{background:`url(${host}/getStaSource?sourceUrl=${item.copyrighturl})`}}/>
                            }>
                                <div className="card_content">
                                    <div className="leftpart">
                                        <img src={item.avatar?`${host}/getStaSource?sourceUrl=${item.avatar}`:require('../pic/ModelPanel/user_temp_avatar.png')} alt="暂时无法显示" />
                                        <div className="username">{item.username}</div>
                                        <div className="userrate">信用：<Rate disabled defaultValue={user.credit} /></div>
                                    </div>
                                    <div className="rightpart">
                                        <div className="title">图片名称：{item.copyrightname}</div>
                                        <div className="description">图片描述：{item.description}</div>
                                        <div className="price">图片价格：<span>￥{item.buyoutprice}</span></div>
                                    </div>
                                </div>
                                <div className="card_bottom">
                                    <div className="createdate">创建时间：{new Date(+item.createdate).toLocaleDateString()}</div>
                                    <Button className="purchase_button" onClick={()=>this.purchaseCopyright(item.blockchaintokenid,item.accountaddress,item.buyoutprice,item.userid,item.copyrightid)}>立即购买</Button>
                                </div>
                            </Card>
                        ):
                        <div className="show_panel_nodata">
                            <img alt=""  src={require("../pic/WebIndex/picshop/temp_no_result.png")}/>
                            <div>当前暂无交易内容哦~</div>
                        </div>
                        }
                    </div>
                </div>
                <CommonBottom/>
                <Modal className="pic_detail_panel" footer={null} open={curPicDataPanel} onCancel={this.closePicDataPanel}>
                    <div>{`当前位置: 首页 > 图案市场 > ${tabItems.filter(item=>item.key === curTab)[0].label} > ${curPicData}`}</div>
                    <div className="pic_detail_panel_content">
                        <div>
                            <div className="pic_detail_panel_imgBox"><img alt="" title={curPicData} src={`${host}/getStaSource?sourceUrl=/pic/picShop/officialPic/${curTab}/${curPicData}`}/></div>
                            <p>相关推荐</p>
                            <div className="pic_detail_panel_reco">
                                {recommandData && recommandData.length?recommandData.map((item,idx)=>
                                    <div key={idx} onClick={()=>this.openPicDataPanel(item)}>
                                        <img alt="" title={curPicData} src={`${host}/getStaSource?sourceUrl=/pic/picShop/officialPic/${curTab}/${item}`}/>
                                    </div>    
                                ):''}
                            </div>
                        </div>
                        <div>
                            <Button type="primary" className="pic_detail_panel_buy"><img alt="" src={require("../pic/WebIndex/picshop/pic_download.svg").default}/>付费使用</Button>
                            <Button className="pic_detail_panel_more">更多尺寸</Button>
                            <Button className="pic_detail_panel_collect">收藏</Button>
                            <div className="pic_detail_panel_description">
                                <span><p>下载范围：</p>企业商用</span>
                                <span><p>版权范围：</p>可商用 全球范围不限制</span>
                                <span><p>授权范围：</p><Tag color="#7C9BF0">企业</Tag>授权 <a href={'/webindex/picshop'}>下载授权书</a></span>
                                <span><p>版权所有：</p>易纹创</span>
                                <div><Button className="pic_detail_panel_buyal">单张授权购买</Button> <a href={'/webindex/picshop'}>多张折扣</a></div>
                                <span><p>权益范围</p></span>
                                <span className="right_description"><p>网络用途：</p>公众号、微博、网页、微信、电商</span>
                                <span className="right_description"><p>传统媒体：</p>电视、网络视频（直播、短视频、快手、抖音）、电影等媒体播放平台。</span>
                                <span className="right_description"><p>户外广告：</p>楼宇、车身、灯箱、围挡、橱窗、户外广告牌、公共场所陈列。</span>
                                <span className="right_description"><p>线下印刷：</p>宣传册、画册、折页、海报、店头陈设、易拉宝等用于印刷用途。</span>
                                <span className="right_description"><p>图书出版：</p>报纸配图、杂志封面及配图、图书封面及配图等用于出版用途。</span>
                                <span className="right_description"><p>作品转售：</p>如网络课件、教学视频、付费视频等媒体转售形式的作品。</span>
                                <span className="right_description"><p>肖像敏感：</p>肖像权在医疗、生命科学、药物、保健品、养生、美容、化妆品、整形、交友等行业使用，被视为敏感用途。</span>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        )
    }
}
//公共部分底端展示
class CommonBottom extends React.Component{
    render(){
        return(
            <div id="web_panel_bottom">
                <span>易纹创</span>
                <span>工作时间：09:00-18:00(周一至周六)</span>
                <span>联系电话：19858159655</span>
                <span>关于我们 | 用户守则 | 网站地图 | 联系我们</span>
            </div>
        )
    }
}
//服务流程内容展示
class ServiceProcedurePanel extends React.Component{
    state={
        service:[
            {title:'分配顾问',content:'在线客服初步了解您的定制品类、件数、预计使用时间后，为您分配定制顾问进行服务。'},
            {title:'推荐款式',content:'顾问根据您的使用场景及预算情况，为您推荐合适的款式。如有需要可安排产品寄样。'},
            {title:'确认图稿',content:'由于定制的工艺与价格，需结合图案大小、颜色数来进行判断。客户请尽量加快底衫选定与模型设计，平台将根据设计内容提供精准报价。'},
            {title:'方案报价',content:'在客户确认效果图稿后，顾问提供工艺方案及相应件数下的报价单（定制件数影响阶梯定价与工艺价格，所以价格以最终下单件数为准）。'},
            {title:'确认订单',content:'客户确认报价后，提供尺码、数量、地址、开票信息。如有其它如空白包装袋、去吊牌、分地址发货等特殊需求，也一并告知顾问。'},
            {title:'签订合同',content:'易纹创提供完善的定制合同模板供双方确认内容，支持合同盖章扫描提高流程效率。'},
            {title:'订单支付',content:'客户再次确认定制清单，顾问协助客户付款（支持多种付款方式）。'},
            {title:'生产发货',content:`下单付款且确认完图稿与颜色尺码后，次日算起排序生产，常规订单最晚七个工作日发货（打样三个工作日）。由于系统排单，推送生产后不支持修改生产信息，收货信息如需修改请尽早联系顾问。默认使用普快包邮发货，发货时将有短信通知预留手机号。`},
            {title:'寄出发票',content:'财务人员在订单发货后（且无未结清尾款的情况），将及时开票寄出。'},
            {title:'售后服务',content:'客服人员采用电话、在线等方式对成单客户进行售后回访，了解产品/服务满意度及NPS（净推荐值）。'},
        ],
        question:[
            {title:'满足需求多样',content:'易纹创提供不同档位底衫，满足企业客户不同使用场景与预算范围。支持非常规需求，如包装袋设计、领标吊牌等定制。'},
            {title:'满足产品稳定',content:'易纹创产品经历内测、外测、正式发布等一系列流程，稳定性强，员工穿得放心。底衫产品面料及版型的设计开发具有较强适配性，能较好满足大范围员工的穿衣偏好。'},
            {title:'权责要求明晰',content:'针对企业客户我们支持合同签订，明确权利义务，让您定制无忧。',children:[
                {title:'支付问题',content:'定制产品默认全款支付。如有需要可协商预付比例，验货后支付尾款。'},
                {title:'保密问题',content:'对图稿有保密需求，可在合同中补充保密协议，避免泄露。'},
                {title:'延期问题',content:'按合同约定延期交付，将向客户支付指定比例的违约金，让您货期无忧。'},
                {title:'售后问题',content:'针对订单「缺」「损」的处理条款写入合同，支持一定期限内保修处理，让您售后无忧。'},
            ]},
            {title:'财务报销方便',content:'快速开票，支持电子发票。打样款项若由个人垫付，可计入大货，待企业大货支付后，由易纹创返还个人垫款，省却对接人内部报销流程。'},
            {title:'持续服务能力',content:'支持45天内轻松加单，一件起加，原价补单。'}
        ],
        ensure:[
            {title:'14日更换准则',content:'1、遵循行业惯例，服装定制商品不支持“无理由退换”规则。2、如您收到的产品出现质量问题，包括严重褪色、图案掉落、图案错印、衣服非人为破损等，请在物流状态为签收14日内(含14日) 联系我们，问题现象烦请提供实拍照片供我司核实，核实后我们将负责重做或更换；3、若收到产品数量和实际订单存在出入，可直接联系定制顾问，我们将核实情况并及时补足。'},
            {title:'修补服务',content:'由于客户使用不当或其他人为原因而造成的产品损坏，在物流状态为签收之日起30日内（含），易纹创可提供修补和更换服务，所产生的相关费用需由客户承担。具体是否可修补，需根据具体情况进行评估，详询对接顾问。'},
            {title:'加单服务',content:'从确认图稿且付款均完成之日起45天内（含），同款式同设计同工艺（除刺绣）可以下单定价享受加单政策。小于30件仅1次，大于等于30件不限加单次数。'},
            {title:'售后方式',content:'最快的方式是直接与为您服务的易纹创顾问进行售后反馈。也可通过在线客服、400电话、下方投诉通过进行反馈。19858159655'},
            {title:'投诉建议',content:'定制过程中，顾问如有服务不到位的地方，欢迎您通过下方企业微信进行投诉建议，我们会核实具体情况来维护您的正当权益。'},
        ]
    }
    changePath = (path)=>{
        this.props.onChangePath(path);
    }
    render(){
        let {path} = this.props;
        let {service,question,ensure} = this.state;
        path = path.substring(path.lastIndexOf("/")+1);
        return(
            <>
                {path === 'service'?
                    <div id="webindex_serviceprocedure_panel">
                        <div className="serviceprocedure_panel_title">服务流程</div>
                        <div className="serviceprocedure_panel_subtitle">
                            针对企业定制，提供更专业的服务
                            <Search className="serviceprocedure_panel_searchBox" placeholder="输入搜索信息" onSearch={()=>{}} enterButton />
                        </div>
                        {service && service.length?service.map((item,idx)=>
                            <div key={idx} className="serviceprocedure_panel_item">
                                <span>{idx+1 !== 10?'0'+(idx+1):idx+1}</span>
                                <span>{item.title}</span>
                                <span>{item.content}</span>
                            </div>
                        ):''}
                        <Link to={{pathname:'/modelcontrol'}}><Button onClick={()=>this.changePath("/modelcontrol")}>点击开始定制之旅</Button></Link>
                    </div>
                :path === 'question'?
                    <div id="webindex_serviceprocedure_panel">
                        <div className="serviceprocedure_panel_title">常见问题</div>
                        <div className="serviceprocedure_panel_subtitle">
                            针对企业定制，提供更专业的服务
                            <Search className="serviceprocedure_panel_searchBox" placeholder="输入搜索信息" onSearch={()=>{}} enterButton />
                        </div>
                        {question && question.length?question.map((item,idx)=>
                            <div key={idx} className="question_panel_item">
                                <span><span className="question_panel_item_decoration"><div></div></span>{item.title}</span>
                                <span>{item.content}</span>
                                <div className="questoin_panel_item_children">
                                    {item.children && item.children?item.children.map((citem,idx)=>
                                        <div key={idx}>
                                            <span><p>{'0'+(idx+1)}</p>{citem.title}</span>
                                            <span>{citem.content}</span>
                                        </div>
                                    ):''}
                                </div>
                            </div>
                        )
                        :''}
                    </div>
                :
                    <div id="webindex_serviceprocedure_panel">
                        <div className="serviceprocedure_panel_title">售后保障和投诉</div>
                        <div className="serviceprocedure_panel_subtitle">
                            针对企业定制，提供更专业的服务
                            <Search className="serviceprocedure_panel_searchBox" placeholder="输入搜索信息" onSearch={()=>{}} enterButton />
                        </div>
                        {ensure && ensure.length?ensure.map((item,idx)=>
                            <div key={idx} className="question_panel_item">
                                <span><span className="question_panel_item_decoration"><div></div></span>{item.title}</span>
                                <span>{item.content}</span>
                            </div>
                        )
                        :''} 
                        <img alt="" style={{width:'150px',height:'150px',marginTop:'50px'}} src={require("../pic/WebIndex/web_qrcode.png")}/>
                    </div>
                }
                <CommonBottom/>
            </>
        )
    }
}
//定制攻略内容展现
class SketchDetail extends React.Component{
    state = {
        sketchDetailData:{
            knowledge:[
                {title:'秋天的第一件卫衣，大厂企业卫衣「有颜有质」',content:'易纹创精选「大厂卫衣案例」圆领卫衣经典好搭、连帽青春减龄，有卫衣的秋天，才时髦呀~ ',tags:['卫衣定制','团体服装定制','企业定制卫衣']},
                {title:'企业中秋活动&礼品定制没头绪？行政HR们看过来~',content:' 中秋节就要来了…企业中秋活动、定制中秋礼品，就由易纹创承包您的节日仪式感吧',tags:['企业文化衫','文化衫定制','帆布包定制','中秋定制礼品']},
                {title:'2022年易纹创夏季上新：新面料T恤、黑科技面料Polo、新增防晒衣款式',content:'一年一夏季，过不久又将是穿短袖T恤、Polo衫的季节。2022年，易纹创定制夏季上新啦~ ',tags:['T恤定制','企业文化衫','文化衫定制','POLO定制','团体衣衫定制']},
                {title:'易纹创 X LOGO神器，你的T恤只差一个智能LOGO',content:' 定制T恤大多数的人都会选择简单而又能够体现企业最标致的符号——logo，但如何设计出好看的T恤logo也是有方法可以寻找的，从这几种设计logo的方向去找到最适合你的创意logo，让定制T恤的图案设计变得创意非凡。 ',tags:['T恤定制','企业文化衫','文化衫定制']},
                {title:'服装定制,这些都是你应该知道的常识！',content:'企业可以通过服装定制来加强企业员工的精神面貌和完善企业的内部文化。就比如我国的华为和百度，他们都会为员工定制服装来加强员工的精神面貌和团队意识。',tags:['T恤定制','企业文化衫','文化衫定制']},
                {title:'易纹创2022精选企业秋冬服案例',content:' 2022年，易纹创定制7周年啦！易纹创7周年礼盒正好撞上本月7号，如“7”而至~ ',tags:['T恤定制','企业文化衫','文化衫定制']},
                {title:'女生节不止鲜花和巧克力，还有定制文化衫的惊喜等着你',content:' 说到女生节活动新颖的点子，定制文化衫可以为女生节活动增添更多乐趣和纪念价值。 ',tags:['T恤定制','企业文化衫','文化衫定制']},
                {title:'女神节活动主题策划，文化衫展现女性文化魅力',content:' 文化衫是一种以特定文化元素为主题的T恤衫，为女性设计一款文化衫，将是一个非常棒的女神节活动。',tags:['T恤定制','企业文化衫','文化衫定制']},
            ],
            technology:[
                {title:'易纹创定制印花工艺七彩反光，酷炫七彩战袍T恤文化衫',content:' 你见过文化衫上那种七彩炫丽的印花效果吗？在T社，有一种特别炫酷的印花工艺——七彩反光工艺，顾名思义，这种工艺能够让印花实现七彩效果。 ',tags:['T恤印花工艺','七彩反光']},
                {title:'印花镭射银工艺能有多炫酷，易纹创告诉你',content:'  相信一直有在关注易纹创的小伙伴，近期一定看过在我们的合作案例中，有个非常炫酷的印花工艺——镭射银。 ',tags:['企业文化衫','文化衫定制','帆布包定制','镭射银']},
                {title:'衣服印字有几种方式，衣服印字图案工艺',content:' 我们日常生活中看到的衣服上的印字图案，通常是以工艺方式来实现。常见的服装定制工艺可分为丝网印工艺、烫画工艺、刺绣工艺以及数码直喷工艺，其中丝印工艺的运用最广泛，也是印花工艺中最丰富的一种。 ',tags:['印花工艺','衣服印字','衣服印花图案']},
                {title:'T恤印花是贴上去的吗?T恤图案怎么印上去?',content:'  未涉及服装工艺的朋友们可能对于T恤的制作流程并不了解，被一些无良商家的劣质T恤迷惑，误以为这些容易剥落的T恤衫，图案都是贴上去的，其实并不是，T恤印花也有着一门很深的学问，小编来向大家简单的科普一下如何印制图案。  ',tags:['T恤图案','T恤印花','印花工艺']},
                {title:'易纹创文化衫制作工艺详细介绍',content:' 不同的工艺也使得不同的图案有了更特殊的表达，给人带来了更多的感官和触感上的不同，选择更加合适的工艺无疑让定制图案锦上添花。 ',tags:['T恤定制','企业文化衫','文化衫定制']},
                {title:'丝网印刷技术 T恤定制印花工艺首选',content:' 印花工艺，首选丝网印刷。易纹创专业厂家，拥有专业人员把关生产流程，用最大的诚意，为你提供最好的印花。定制热线：19858159655。 ',tags:['T恤定制','企业文化衫','文化衫定制']},
                {title:'工作服定制中印花工艺有哪些?丝网印和数码印花工艺特点',content:'   服装定制行业中，印花工艺是一个固有名词，定制文化衫、工作服印花，印花工艺种类有哪些？今天来给大家介绍丝网印和数码印花工艺特点。  ',tags:['T恤定制','企业文化衫','工作服定制']},
                {title:'有哪些好看的卫衣字母图案，定制卫衣字母图案印制工艺',content:'  卫衣上的字母图案可以定制很好看，像一些潮牌衣服上的图案就是以字母为主，这也深受着很多年轻人的喜爱。定制卫衣上的图案印制工艺有哪些？给大家分享几个好看的卫衣字母图案。 ',tags:['卫衣定制','卫衣图案','卫衣字母']},
                {title:'衣服印字有几种方式，团体服工作服定制印花工艺',content:'   定制团体服工作服，衣服上的logo印字有哪几种方式来实现的呢？  ',tags:['卫衣定制','卫衣图案','卫衣字母']},
            ]
        },
        recommandPic:[]
    }
    //获取随机图片数据
    getRandomPic = ()=>{
        let {recommandPic} = this.state;
        if(recommandPic && recommandPic.length !== 0)return;
        //获取随机图片作为推荐数据
        axios.get(`${host}/getRandomPic`,{
            params:{
                num:4
            }
        }).then((res)=>{
            recommandPic = [].concat(res.data);
            this.setState({recommandPic});
        })
    }
    //初始化图片数据
    resetPicData = (path)=>{
        let {sketchDetailData} = this.state;
        if(path === 'QA')return;
        //若当前子版块无图片属性，说明还未获取图片数据，此时向后端发送请求获取图片数据并赋回当前state数据中
        if(!sketchDetailData[path][0].pic){
            axios.get(`${host}/getStaDir`,{
                params:{
                    reqType:'sketchDetail',
                    picDirId:path
                }
            }).then((res)=>{
                let {data} = res;
                //以子版块数据量为基准进行重赋值
                for(let idx in sketchDetailData[path]){
                    sketchDetailData[path][idx].pic = `${host}/getStaSource?sourceUrl=/pic/sketchDetail/${path}/${data[idx]}`;
                }
                this.setState({sketchDetailData});
            })
        }
    }
    changePath = (path)=>{
        this.props.onChangePath(path);
    }
    render(){
        let {path} = this.props;
        path = path.substring(path.lastIndexOf("/")+1);
        this.resetPicData(path);
        this.getRandomPic();
        let {sketchDetailData,recommandPic} = this.state;
        return(
            <>
            <div id="sketch_detail_panel_nav">{`定制攻略 > ${path === 'knowledge'?'底衫知识':path === 'technology'?'工艺知识':'定制问答'}`}</div>
            {
                path === 'knowledge' || path === 'technology'?
                <div id="sketch_detail_panel">
                    <div id="sketch_detail_panel_left">
                        {sketchDetailData[path].map((item,idx)=>
                            <div key={idx}>
                                <div><img alt="" src={item.pic}/></div>
                                <div className="sketch_detail_panel_detail">
                                    <div>{item.title}</div>
                                    <div>{item.content}</div>
                                    <div>
                                        {item.tags.map((citem,idx)=>
                                        <span key={idx}>{citem}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div id="sketch_detail_panel_right">
                        <div>
                            <span>相关推荐</span>
                            <span onClick={()=>this.changePath("/webindex/shirtbottom/tshirt")}>查看更多</span>
                        </div>
                        {recommandPic && recommandPic.length?recommandPic.map((item)=>
                            <div onClick={()=>this.changePath("/webindex/shirtbottom/tshirt")} className="sketch_detail_panel_recommand" key={item.shirtid}>
                                <img alt="" src={`${host}/getStaSource?sourceUrl=${item.prepic}`}/>
                                <div>{item.shirtname}</div>
                                <div>￥<span>{item.price}</span>起</div>
                            </div>
                        )
                        :''}
                    </div>
                </div>
                :
                <div id="sketch_detail_panel">
                    定制问答
                </div>
            }
            <CommonBottom/>
            </>
        )
    }
}
class AboutPlatform extends React.Component{
    state={}
    render(){
        return(
            <div id="aboutplatform_panel">
                <h2>我们相信，温度是可以传递的</h2>
                <p>企业将温度传递给员工，员工也会传递给客户。</p>
                <p>快乐且满意的员工，才能使客户感到快乐和满意。</p>
                <p>越来越多的企业，致力于成为一家有温度的企业。</p>
                <p>而企业文化衫作为一种传递温度的载体，也受到越来越多优秀企业的重视。</p>
                <div id="aboutplatform_panel_vision">
                    <div>
                        <img alt="" src={require("../pic/WebIndex/about_1.svg").default}/>
                        <span>我们的使命</span>
                        <span>提供高品质的企业文化衫，助力企业更好的传递温度</span>
                    </div>
                    <div>
                        <img alt="" src={require("../pic/WebIndex/about_2.svg").default}/>
                        <span>我们的愿景</span>
                        <span>成为最受企业认可、最受员工喜爱的文化衫定制服务商</span>
                    </div>
                </div>
                <h2>价值观</h2>
                <div id="aboutplatform_panel_value">
                    <div>
                        <img alt="" src={require("../pic/WebIndex/about_1.jpg")}/>
                        <span>成为一名“专家”，首要的是把客户放在第一位。我们各个岗位的伙伴都要具备较强的专业知识和技能，不断创新。制定专业的流程，严格遵守规范，控制情绪并靠理性行动。</span>
                    </div>
                    <div>
                        <img alt="" src={require("../pic/WebIndex/about_2.jpg")}/>
                        <span>我们追求从个人到工作、到交付物的高品质。个人品质，正直坦荡，善于沟通。工作品质，高质量的完成，精益求精。产品品质，对客户的交付追求高品质。</span>
                    </div>
                    <div>
                        <img alt="" src={require("../pic/WebIndex/about_3.jpg")}/>
                        <span>我们希望做到设身处地，发自真心，利他之心。对外服务客户，主动发现并满足客户的需求，为客户创造难忘的体验。对内服务同事，集公司之力传递服务到客户。</span>
                    </div>
                    <div>
                        <img alt="" src={require("../pic/WebIndex/about_4.jpg")}/>
                        <span>我们希望营造温暖、有归属感的文化，鼓励员工的成长与热情。将我们的温度传递给员工、传递给客户、传递给社会。成为一家具有社会责任感的企业。</span>
                    </div>
                </div>
                <CommonBottom/>
            </div>
        )
    }
}
//将withRouter绑定在主页最高层以完成对hook的绑定
export default withRouter(WebIndex);