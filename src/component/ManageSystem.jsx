import React from "react";
import { Link,useLocation,useNavigate } from "react-router-dom";
import "../css/ManageSystem.css";
import { connect } from "react-redux";
import {MenuFoldOutlined,MenuUnfoldOutlined,UserOutlined,PlusCircleFilled,DeleteFilled,EditFilled,ShopOutlined,SendOutlined,SmileOutlined,LoadingOutlined} from '@ant-design/icons';
import { Rate,InputNumber,Radio,message,Menu,Input,Popover,Badge,Avatar,Tabs, Table, Button,Tag,Dropdown,Modal,Form,Cascader,Select,Upload, Space,Card,Steps } from "antd";
import axios from "axios";
import {cityData} from "../data/cityData";
import {updateUserData} from"../redux/actions.js";
import { nanoid } from "nanoid";
export function withRouter(Child){
    return (Props)=>{
        const location = useLocation();
        const navigate = useNavigate();
        return <Child {...Props} location = {location} navigate = {navigate}/>
    }
}
const {Search} = Input;
const {Option} = Select;
const host = "http://localhost:4444"
class ManageSystem extends React.Component{
    state={
        userData:{},
        curSystemPath:'首页',
        msgCount:2,
        menuItems:[
            {label:'基本信息管理',key:'menuItem_1',icon:(<img alt="" className="managesystem_panel_icon" src={require("../pic/ManageSystem/basicdata.svg").default}/>),children:[
                {label:'用户信息管理',showcomponent:<UserDataOpe/>,key:'menuItem_1_1',icon:(<img alt="" className="managesystem_panel_icon" src={require("../pic/ManageSystem/userdata.svg").default}/>)},
                {label:'衣衫信息管理',showcomponent:<ShirtDataOpe/>,key:'menuItem_1_2',icon:(<img alt="" className="managesystem_panel_icon" src={require("../pic/ManageSystem/T-shirt.svg").default}/>)}
            ]},
            {label:'版权信息管理',key:'menuItem_2',icon:(<img alt="" className="managesystem_panel_icon" src={require("../pic/ManageSystem/orderdata.svg").default}/>),children:[
                {label:'所有版权管理',showcomponent:<AllCopyright/>,key:'menuItem_2_1',icon:(<img alt="" className="managesystem_panel_icon" src={require("../pic/ManageSystem/orderitemdata.svg").default}/>)},
                {label:'版权申请管理',showcomponent:<ApplyRecord/>,key:'menuItem_2_2',icon:(<img alt="" className="managesystem_panel_icon" src={require("../pic/ManageSystem/tortdata.svg").default}/>)},
                {label:'版权交易管理',showcomponent:<DealRecord/>,key:'menuItem_2_3',icon:(<img alt="" className="managesystem_panel_icon" src={require("../pic/ManageSystem/valueadddata.svg").default}/>)}
            ]},
            {label:'衣衫订单管理',key:'menuItem_3',showcomponent:<ShirtOrderPanel/>,icon:(<img alt="" className="managesystem_panel_icon" src={require("../pic/ManageSystem/appealdata.svg").default}/>)},
            // {label:'侵权审查管理',key:'menuItem_4',icon:(<img alt="" className="managesystem_panel_icon" src={require("../pic/ManageSystem/tortdata.svg").default}/>)},
            // {label:'增值服务管理',key:'menuItem_5',icon:(<img alt="" className="managesystem_panel_icon" src={require("../pic/ManageSystem/valueadddata.svg").default}/>)}
        ],
        tabItems:[
            {label:'首页',key:'systemidx',children:<SystemIndex getPropsData={(key)=>this.getStateData(key)}/>,curpath:'首页'},
            //测试
            {label:'衣衫信息管理',key:'menuItem_1_2',children:<ShirtDataOpe getPropsData={(key)=>this.getStateData(key)}/>,curpath:'首页 | 基本信息管理 | 衣衫信息管理'},
            // {label:'用户信息管理',key:'menuItem_1_1',children:<UserDataOpe getPropsData={(key)=>this.getStateData(key)}/>,curpath:'首页 | 基本信息管理 | 用户信息管理'}
        ],
        activeTab:'menuItem_1_2',
        menuSelectedKeys:[],
        dropDownItems:[
            {key:'my_mission',label:(<div>我的任务</div>)},
            {type:'divider'},
            {key:'psd_change',label:(<div>修改密码</div>)},
            {key:'data_change',label:(<div>修改个人信息</div>)},
            {key:'login_out',label:(<div onClick={()=>this.loginOutFn()}>退出登录</div>)},
        ]
    }
    //退出当前账号登录
    loginOutFn = ()=>{
        let userData = {};
        localStorage.removeItem("userData");
        this.setState({userData},()=>{
            this.jumpLink.click();
        })
    }
    //检查当前是否已经登录，且能正常获取用户信息，否则跳转到登录页面
    checkLogin = ()=>{
        let userData = localStorage.getItem('userData');
        if(!userData){
            message.error("当前未登录，即将为您跳转到登录界面");
            if(this.jumpLink)setTimeout(()=>this.jumpLink.click(),3000);
        }else{
            this.setState({userData:JSON.parse(userData)});
            this.props.updateUserData(JSON.parse(userData));
        }
    }
    componentDidMount(){
        this.checkLogin();
    }
    //点击搜索后执行的回调函数
    onFuncSearch = (value)=>{
        console.log(value);
    }
    //切换标签时执行的回调函数
    onTabChange = (value)=>{
        let menuSelectedKeys = [value];
        let {tabItems} = this.state;
        let curSystemPath;
        for(let perItem of tabItems){
            if(perItem.key === value){
                curSystemPath = perItem.curpath;
                break;
            }
        }
        this.setState({activeTab:value,menuSelectedKeys,curSystemPath});
    }
    //Menu选项选中时触发
    onMenuSelect = (item)=>{
        let {tabItems,activeTab,menuItems,curSystemPath} = this.state;
        let {keyPath,key} = item;
        let checkFlag = false;
        //强转为数组，防止数据更新不及时
        tabItems = Array.from(tabItems);
        //循环遍历已有tab，若有符合项则显示已有项
        for(let pertab of tabItems){
            if(pertab.key === key){
                curSystemPath = pertab.curpath;
                checkFlag = true;
            }
        }
        //如果不存在，则根据keyPath获取数据并添加到指定tab中
        if(!checkFlag){
            let searchArray = menuItems;
            let path = '首页';
            while(keyPath.length){
                //从根目录到子目录为从后往前的顺序，故应使用pop
                let curKey = keyPath.pop();
                for(let perItem of searchArray){
                    if(perItem.key === curKey){
                        searchArray = perItem;
                        path += ' | '+perItem.label;
                        break;
                    }
                }
                //若不为目标节点，则根据其children继续寻找
                if(keyPath.length !== 0){
                    searchArray = searchArray.children;
                }
            }
            //找到后即可展示内容，展示内容为数据中的showcomponent属性
            tabItems.push({label:searchArray.label,key:searchArray.key,children:searchArray.showcomponent,curpath:path})
            curSystemPath = path;
        }
        activeTab = key;
        //设置menu选中的item
        let menuSelectedKeys = [key];
        this.setState({activeTab,tabItems,menuSelectedKeys,curSystemPath});
    }
    //对tab标签操作执行后的回调，取消新增操作，故只进行删除
    onTabEdit = (target)=>{
        if(target === 'systemidx'){
            message.info("首页标签页无法删除哦~");
            return;
        }
        let {tabItems,activeTab,curSystemPath} = this.state;
        tabItems = Array.from(tabItems);
        //删除后需要注意删除位置带来的影响，即删除后显示面板的处理
        for(let idx in tabItems){
            if(tabItems[idx].key === target){
                tabItems.splice(idx,1);  
                //设置删除后的显示面板与面板路径
                if(activeTab === target){
                    activeTab = +idx === tabItems.length?tabItems[idx-1].key:tabItems[idx].key;  
                    curSystemPath = +idx === tabItems.length?tabItems[idx-1].curpath:tabItems[idx].curpath;  
                }
                break;
            }
        }
        this.setState({tabItems,activeTab,curSystemPath});
    }
    //获取state数据
    getStateData = (key)=>{
        return this.state[key];
    }
    render(){
        let {menuCollapsed,curSystemPath,msgCount,userData,menuItems,tabItems,activeTab,menuSelectedKeys,dropDownItems} = this.state;
        let msgContent = (
            <div>测试</div>
        )
        return(
            <div id="managesystem_panel">
                <Link to={{pathname:'/systemlogin'}} ref={(elem)=>this.jumpLink = elem} style={{display:'none'}}/>
                <div id="managesystem_panel_left">
                    <div id="managesystem_panel_title">
                        <svg className='icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80.01 100"><g fillRule="evenodd"><path d="M80 3.77C59.39 19.79 5.22 27 0 46.84v31.38c0 8.5 2.88 15.55 10.74 21.78C.7 68.08 77.26 73.05 80 45.87z" fill="#114fee" /><path d="M51.69 17.48L51.59 0C29.1 15.36 2 18.09 0 46.84v31.38a27 27 0 0 0 2.39 11.67c-.34-34.1 49.56-20.5 49.4-52.8z" fill="#2ddaff" opacity=".8" /></g></svg>
                        易纹创后台管理系统
                    </div>
                    <Menu defaultOpenKeys={['menuItem_1','menuItem_2']} inlineCollapsed={menuCollapsed} selectedKeys={menuSelectedKeys} onSelect={this.onMenuSelect} mode="inline" items={menuItems} className="managesystem_panel_menu"/>
                </div>
                <div id="managesystem_panel_right">
                    <div className="managesystem_panel_right_nav">
                        <div className="menu_collapse_icon">
                            {menuCollapsed?<MenuUnfoldOutlined/>:<MenuFoldOutlined/>}
                        </div>
                        <div className="managesystem_panel_path">{curSystemPath}</div>
                        <Search className="managesystem_panel_searchbox" placeholder="请输入想搜索的功能模块" allowClear onSearch={this.onFuncSearch}/>
                        <div className="managesystem_panel_welcome">欢迎您！{JSON.stringify(userData) !== '{}'?userData.username?userData.username:`手机用户${userData.phone.slice(7)}`:''}</div>
                        <Avatar icon={userData.avatar && userData.avatar.length !== 0?<img alt="" src={`${host}/getStaSource?sourceUrl=${userData.avatar}`}/>:<UserOutlined />}/>
                        <Popover content={msgContent} placement="bottom" title={`消息中心`} trigger={'click'}>
                            <Badge count={msgCount}>
                                <img alt="" className="managesystem_panel_icon" src={require("../pic/ManageSystem/message.svg").default}/>
                            </Badge>
                        </Popover>
                        <Dropdown menu={{items:dropDownItems}} trigger={['click']}>
                            <img alt="" className="managesystem_panel_icon" src={require("../pic/ManageSystem/setting.svg").default}/>
                        </Dropdown>
                    </div>
                    <div className="managesystem_panel_right_content">
                        <Tabs onEdit={this.onTabEdit} type="editable-card" hideAdd onChange={this.onTabChange} items={tabItems} activeKey={activeTab}/>
                    </div>
                </div>
            </div>
        )
    }
}
//系统首页面板
class SystemIndex extends React.Component{
    state = {}
    render(){
        return(
            <div className="system_tab_detail_panel">
                系统首页界面
            </div>
        )
    }
}
//用户信息操作面板
class UserDataOpe extends React.Component{
    state={
        columns:[
            {title:'用户ID',width:100,dataIndex:'userid',key:'userid',fixed:'left',align:'center',filterDropdown:()=>this.setColumnDropdown()},
            {title:'用户名称',width:150,dataIndex:'username',key:'username',fixed:'left',align:'center',filterDropdown:()=>this.setColumnDropdown()},
            {title:'地址',width:180,dataIndex:'address',key:'address',align:'center',filterDropdown:()=>this.setColumnDropdown()},
            {title:'电话',width:120,dataIndex:'phone',key:'phone',align:'center',filterDropdown:()=>this.setColumnDropdown()},
            {title:'邮箱',width:170,dataIndex:'email',key:'email',align:'center',filterDropdown:()=>this.setColumnDropdown()},
            {title:'头像地址',width:120,key:'avatar',align:'center',render:(_,record)=><div>{record.avatar?<img className="avatar" alt="" src={`${host}/getStaSource?sourceUrl=${record.avatar}`}/>:"暂无头像"}</div>},
            {title:'性别',width:80,dataIndex:'gender',key:'gender',render:(record)=>record === 1?<Tag color="blue">男</Tag>:<Tag color="red">女</Tag>,align:'center'},
            {title:'密码',width:120,dataIndex:'password',key:'password',align:'center'},
            {title:'账户余额',width:120,dataIndex:'account',key:'account',align:'center'},
            {title:'信用等级',width:120,dataIndex:'credit',key:'credit',render:(record)=>record === 1?<Tag color="volcano">差</Tag>:record === 2?<Tag color="orange">较差</Tag>:record === 3?<Tag color="gold">一般</Tag>:record === 4?<Tag color="lime">较好</Tag>:<Tag color="green">好</Tag>,align:'center'},
            {title:'身份证号码',width:170,dataIndex:'idcode',key:'idcode',align:'center'},
            {title:'权限',width:90,dataIndex:'authority',key:'authority',render:(record)=>record === 1?<Tag color="cyan">管理员</Tag>:<Tag color="purple">普通用户</Tag>,align:'center'},
            {title:'操作栏',width:200,key:'operation',render:(_,record)=>(<div className="userdata_row_ope" style={{display:'flex'}}><Button className="system_edit_button" onClick={()=>this.openModal('edit',record)} icon={<EditFilled />} >修改</Button><Button  icon={<DeleteFilled/>} danger onClick={()=>this.deleteUserData(record.key)}>删除</Button></div>),fixed:'right',align:'center'}
        ],
        rowSelection:{
            onChange: (selectedRowKeys) => {
                this.setState({selectedKeys:[].concat(selectedRowKeys)});
            }
        },
        selectedKeys:[],
        userData:[],
        curPanelState:'add',
        curModalOpened:false,
        uploadFile:[],
        curUser:{}
    }
    setColumnDropdown = ()=>{
        return(
            <div className="filter_panel">
                <Search className="search_box" allowClear/>
                <div className="ope_box">
                    <Button>重置</Button>
                    <Button type="primary">关闭</Button>
                </div>
            </div>
        )
    }
    //获取用户信息数据
    getUserData = ()=>{
        let {userData} = this.state;
        if(userData && userData.length !== 0)return;
        else{
            axios.get(`${host}/getUserData`,{}).then((res)=>{
                let {data} = res;
                data.map(item=>item.key = item.userid);
                userData = [].concat(data);
                this.setState({userData});
            })
        }
    }
    //切换模态框状态，使其处于打开状态
    openModal = (value,record)=>{
        let curUser;
        if(value === 'add'){
            curUser = {};
            if(this.editForm)this.editForm.resetFields();
        }else{
            curUser = {...record};
            if(this.editForm)this.editForm.setFieldsValue({...record,'re_password':record.password,address:record.address.split(" ")});
        }
        this.setState({curModalOpened:true,curPanelState:value,curUser});
    }
    //关闭模态框
    closeModal = ()=>{
        this.setState({curModalOpened:false});
    }
    //上传前检查数据
    checkCurStatus = ()=>{
        let {curUser} = this.state;
        let phone = this.editForm.getFieldValue("phone");
        console.log(phone)
        if(phone.length !== 11){
            message.error("请先输入手机号！");
            return false;
        }
        curUser.userid  = 'nid_'+phone.slice(7);
        this.setState({curUser});
        return true;
    }
    //将头像图片上传到后台服务器
    uploadToServer = (values)=>{
        let {file} = values;
        let myformData = new FormData();
        let {curUser} = this.state;
        //进行数据绑定，同时上传头像，并将头像地址返回前端
        myformData.append('fileid',curUser.userid);
        myformData.append('file',file);
        axios.post(`${host}/upload`,
            myformData
        ).then((res)=>{
            let uploadFile = [];
            uploadFile.push({
                status:'done',
                uid:nanoid(),
                url:`${host}/getStaSource?sourceUrl=${res.data.url}`,
                name:file.name
            })
            curUser.avatar = res.data.url;
            this.setState({uploadFile,curUser});
        })
    }
    //表单重置无法重置上传头像，故需要额外绑定按钮
    clearUploadFile = ()=>{
        this.setState({uploadFile:[]})
    }
    //提交用户数据
    submitUserData = (values)=>{
        let {curPanelState,curUser,userData} = this.state;
        values.userid = JSON.stringify(curUser) === '{}'? 'nid_' + values.phone.slice(7):curUser.userid;
        values.address = values.address.join(" ");
        values.type = curPanelState;
        values.avatar = curUser.avatar;
        values.copyright = "";
        axios.get(`${host}/editUserData`,{
            params:{...values}
        }).then((res)=>{
            let {data} = res;
            if(data === 'success'){
                message.success("新增/修改成功了！");
                let xflag = true;
                for(let idx in userData){
                    if(userData[idx].userid === values.userid){
                        xflag = false;
                        userData[idx] = {...values,key:values.userid+new Date().getTime()}
                    }
                }
                if(xflag){
                    userData.unshift({...values,key:values.userid+new Date().getTime()})
                }
                this.setState({userData:JSON.parse(JSON.stringify(userData))});
                this.closeModal();
            }else{
                message.error("出错了，错误信息为"+data);
            }
        })
    }
    componentDidMount(){
        this.getUserData();
    }
    //删除选中项
    deleteUserData = (value)=>{
        let {selectedKeys,userData} = this.state;
        userData = Array.from(userData);
        if(value)
            value = [value]
        else
            value = [].concat(selectedKeys)
        if(value.length === 0){
            message.error("请选中项后进行删除！");
            return;
        }
        if(value.length >= 20){
            message.error("存在大批量删改数据行为，系统已默认禁止该种行为!");
            return;
        }
        let userid = [];
        for(let perValue of value){
            for(let idx in userData){
                if(userData[idx].key === perValue){
                    userData.splice(idx,1);
                    userid.push("'"+userData[idx].userid+"'");
                    break;
                }
            }
        }
        userid = userid.join(',');
        axios.get(`${host}/deleteUserData`,{
            params:{
                userid
            }
        }).then((res)=>{
            this.setState({userData});
        })
    }
    render(){
        let {userData,columns,rowSelection,curPanelState,curModalOpened,uploadFile} = this.state;
        return(
            <div className="system_tab_detail_panel">
                <div id="userdata_ope_bar">
                    <Button className="system_add_button" onClick={()=>this.openModal('add')} icon={<PlusCircleFilled />}>新增</Button>
                    <Button icon={<DeleteFilled />} onClick={()=>this.deleteUserData()} danger>删除</Button>
                </div>
                <Modal destroyOnClose forceRender style={{marginTop:'-50px'}} onCancel={this.closeModal} footer={null} okText={curPanelState === 'add'?'新增':'修改'} open={curModalOpened} title={curPanelState === 'add'?'新增用户信息面板':'修改用户信息面板'}>
                    <Form onFinish={this.submitUserData} ref={(elem)=>this.editForm = elem} labelCol={{ span: 6 }} wrapperCol={{ span: 14 }} style={{ width: '100%' }}>
                        <Form.Item className="edit_form" name="username" label="用户名称" required>
                            <Input allowClear placeholder="请输入您的用户名" />
                        </Form.Item>
                        <Form.Item className="edit_form" name="phone" label="手机号码" hasFeedback rules={[{ pattern: new RegExp(/^[0-9]\d*/g), message: '请输入有效数字' }, { min: 11, message: '请输入有效手机号' }, { max: 11, message: '请输入有效手机号' }, { required: true, message: '此为必填字段' }]}>
                            <Input placeholder="请输入手机号码" allowClear addonBefore={<Select defaultValue={'+86'} style={{ width: 70, }}><Option value="86">+86</Option><Option value="87">+87</Option></Select>} />
                        </Form.Item>
                        <Form.Item className="edit_form" name="password" hasFeedback label="密码" rules={[{required:true,message:'请输入您的密码'},{max:16,min:8,message:'密码应为8-16位'}]}>
                            <Input.Password allowClear placeholder="请输入密码"/>
                        </Form.Item>
                        <Form.Item className="edit_form" name="re_password" hasFeedback dependencies={['password']} label="确认密码" rules={[{required:true,message:'请确认您的密码'},({getFieldValue})=>({validator(_,value){if(!value || getFieldValue('password') === value)return Promise.resolve();return Promise.reject("两次密码输入不相同")}})]}>
                            <Input.Password allowClear placeholder="请重复密码" />
                        </Form.Item>
                        <Form.Item className="edit_form" name="address" label="地 址" rules={[{ type: 'array', message: '请输入您的住址!', },]}>
                            <Cascader placeholder="请输入您的地址" options={cityData} />
                        </Form.Item>
                        <Form.Item className="edit_form" name="email" label="邮箱" hasFeedback rules={[{ type: 'email', message: '请输入有效的邮箱' }]}>
                            <Input placeholder="请输入邮箱" />
                        </Form.Item>
                        <Form.Item className="edit_form" name="avatar" label="头像">
                            <Upload listType="picture-card" name='file' fileList={uploadFile} customRequest={this.uploadToServer} beforeUpload={this.checkCurStatus}>
                                {uploadFile.length === 1 ? null : <div className="drag_panel"><UserOutlined /><div style={{ marginTop: 8, width: '100%', textAlign: 'center' }}>上传</div></div>}
                            </Upload>
                        </Form.Item>
                        <Form.Item className="edit_form" name="gender" label="性别">
                            <Radio.Group>
                                <Radio.Button value={1}>男</Radio.Button>
                                <Radio.Button value={0}>女</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item className="edit_form" name="account" label="账户余额">
                            <InputNumber prefix={"￥"}/>
                        </Form.Item>
                        <Form.Item className="edit_form" name="credit" label="信用等级">
                            <Rate/>
                        </Form.Item>
                        <Form.Item className="edit_form" name="idcode" label="身份证号码">
                            <Input/>
                        </Form.Item>
                        <Form.Item className="edit_form" name="authority" label="用户权限">
                            <Radio.Group>
                                <Radio value={0}>普通用户</Radio>
                                <Radio value={1}>管理员</Radio>
                            </Radio.Group>
                        </Form.Item>
                        <Form.Item className="edit_form" style={{textAlign:'right',marginLeft:'30%'}}>
                            <Space>
                                <Button onClick={this.clearUploadFile} htmlType="reset">重置</Button>
                                <Button type="primary" htmlType="submit">提交</Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>
                <Table rowSelection={rowSelection} id="userdata_ope_table" columns={columns} dataSource={userData} scroll={{x:500,y:520}}/>
            </div>
        )
    }
}
//衣衫信息操作面板
class ShirtDataOpe extends React.Component{
    state={
        shirtTypeData: [
            { src: 'picForModel/polo_shirt.svg', title: 'POLO衫', hoverIfo: 'Polo衫', userType: 0, value: 'poloshirt' },
            { src: 'picForModel/T-shirt.svg', title: 'T恤', hoverIfo: 'T恤', userType: 0, value: 'T_shirt' },
            { src: 'picForModel/sweater.svg', title: '卫衣', hoverIfo: '卫衣', userType: 0, value: 'sweater' },
            { src: 'picForModel/overcoat.svg', title: '外套', hoverIfo: '外套', userType: 0, value: 'overcoat' },
            { src: 'picForModel/pants.svg', title: '休闲裤', hoverIfo: '休闲裤', userType: 0, value: 'pant' },
            { src: 'picForModel/socks.svg', title: '袜子', hoverIfo: '袜子', userType: 0, value: 'socks' },
            { src: 'picForModel/hat.svg', title: '帽子', hoverIfo: '帽子', userType: 0, value: 'hat' },
            { src: 'picForModel/gloves.svg', title: '手套', hoverIfo: '手套', userType: 0, value: 'golves' },
        ],
        curSelectedType:'poloshirt',
        shirtData:[],
        curCategoryData:[]
    }
    changeSelectedType = (value)=>{
        this.setState({curSelectedType:value},()=>{
            this.getShirtData();
            this.clearCategoryData();
        })
    }
    //获取指定衣衫类别数据
    getShirtData = ()=>{
        let {shirtData,curSelectedType} = this.state;
        let type = 'poloshirt';
        if(curSelectedType === "T_shirt"){
            type = "tshirt";
        }else if(curSelectedType === "sweater_01"){
            type = "sweater_01";
        }else if(curSelectedType === "sweater_02"){
            type = "sweater_02";
        }else if(curSelectedType === "overcoat"){
            type = 'suit';
        }else if(curSelectedType === 'socks' || curSelectedType === 'hat' || curSelectedType === "golves"){
            type = 'others';
        }
        //判断数据是否已经获取过，若已存在则无需重复发送axios请求获取数据
        if(!shirtData[curSelectedType]){
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
                shirtData[curSelectedType] = tempObj;
                this.setState({shirtData});
            })
        }
    }
    //设置衣衫详情数据面板
    setCategoryData = (value)=>{
        this.setState({curCategoryData:[].concat(value)})
    }
    //清空数据
    clearCategoryData = ()=>{
        this.setState({curCategoryData:[]});
    }
    componentDidMount(){
        this.getShirtData();
    }
    render(){
        let {shirtTypeData,curSelectedType,shirtData,curCategoryData} = this.state;
        return(
            <div className="system_tab_detail_panel shirt_data_panel">
                <Card type="inner" title="衣衫类型选择" id="shirtdata_panel_left">
                    <ul id="shirtdata_type_panel">
                        {shirtTypeData && shirtTypeData.map((item)=>(
                            <li onClick={()=>this.changeSelectedType(item.value)} key={item.value} className={item.value === curSelectedType?'cur_selected_li':''}>
                                <img src={require(`../pic/ModelPanel/${item.src}`)} alt=""/>
                                <div>{item.title}</div>
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card type="inner" title="衣衫详情删改" id="shirtdata_panel_right">
                    <ul id="shirtdata_data_panel">
                        {shirtData[curSelectedType] && shirtData[curSelectedType].length !== 0?shirtData[curSelectedType].map((item,idx)=>
                            <li key={new Date().getTime()+idx} onClick={()=>this.setCategoryData(item.data)}>
                                <img src={require(`../pic/ManageSystem/folder.svg`).default} alt=""/>
                                <div>{item.categoryname}</div>
                            </li>
                        ):
                        <div className="show_panel_nodata">
                            <img alt=""  src={require("../pic/ManageSystem/no_content.svg").default}/>
                            <div>当前暂无该类衣衫数据~</div>
                        </div>}
                    </ul>
                </Card>
                <Card type="inner" title="衣衫详情删改" extra={<span onClick={this.clearCategoryData} style={{color:'red',cursor:'pointer'}}>关闭</span>} id="shirtdata_panel_detail" style={{display:curCategoryData.length?'block':'none'}}>
                    <ul id="shirtdata_data_detail_panel">
                        {curCategoryData.map(item=>
                            <li key={item.shirtid}>
                                <div className="img_box" style={{background:`url(${host}/getStaSource?sourceUrl=${item.prepic})`}}/>
                                <div className="content_box">
                                    <div>衣衫名称：{item.shirtname}</div>
                                    <div className="price">衣衫价格：<span>￥{item.price}</span></div>
                                    <div>尺寸范围：{item.size}</div>
                                    <div>衣衫面料：{item.materialname}</div>
                                    <div>面料说明：{item.ma_description}</div>
                                    <div>衣衫材质：
                                        <Tag color="gold">
                                            {+item.typography === 1 ? '宽松' : +item.typography === 2 ? '常规' : +item.typography === 3 ? '修身' : '紧身'}
                                        </Tag>
                                        <Tag color="green">
                                            {+item.thickness === 1 ? '偏薄' : +item.thickness === 2 ? '薄' : +item.thickness === 3 ? '适中' : +item.thickness === 4 ? '厚' : '偏厚'}
                                        </Tag>
                                        <Tag color="geekblue">
                                            {+item.elasticity === 1 ? '无弹' : +item.elasticity === 2 ? '微弹' : +item.elasticity === 3 ? '适中' : '超弹'}
                                        </Tag>
                                    </div>
                                    <div>衣衫卖点：{item.sellingpoint}</div>
                                    <div>附带说明：{item.us_description}</div>
                                </div>
                                <div className="ope_box">
                                    <div className="ope_box_detail">
                                        <img alt="" src={require("../pic/ManageSystem/data_edit.svg").default}/>
                                    </div>
                                    <div className="ope_box_detail">
                                        <img alt="" src={require("../pic/ManageSystem/data_delete.svg").default}/>
                                    </div>
                                </div>
                            </li>
                        )}
                    </ul>
                </Card>
            </div>
        )
    }
}
//所有版权信息操作面板
class AllCopyright extends React.Component{
    state = {
        allcopyrightColumn:[
            {title:'版权名称',key:"copyrightname",align:'center',dataIndex:'copyrightname'},
            {title:'版权所有人',key:"username",align:'center',dataIndex:'username'},
            {title:'版权说明',key:"description",align:'center',dataIndex:'description'},
            {title:'NTFID号',key:"blockchaintokenid",align:'center',dataIndex:'blockchaintokenid'},
            {title:'版权内容',key:"copyrighturl",align:'center',width:'200px',render:(_,record)=><div className="img_box" style={{background:`url(${host}/getStaSource?sourceUrl=${record.copyrighturl})`}}/>},
            {title:'买入价格',key:"buyinprice",render:(_,record)=><div>￥{record.buyinprice}</div>},
            {title:'创建时间',key:"createdate",render:(_,record)=><div>{new Date(+record.createdate).toLocaleDateString()}</div>},
            {title:'当前状态',key:"isallowshop",render:(_,record)=><Tag color={record.isallowshop?'green':'red'}>{record.isallowshop?'在售':'未售'}</Tag>},
            {title:'售出操作',key:"createdate",align:"center",render:(_,record)=>
                <div className="ope_box">
                    <div>当前的售卖价格：<InputNumber onBlur={(value)=>this.getCurPrice(record,value)} onPressEnter={(value)=>this.getCurPrice(record,value)} min={0.5} prefix={"￥"} defaultValue={+record.buyoutprice === 0?0.5:record.buyoutprice} disabled={true}/></div>
                    <div style={{display:record.isallowshop?'block':'none'}}>交易成交后预计收益为<span style={{color:record.buyoutprice-record.buyinprice>0?'green':'red',fontSize:'14px',fontWeight:'bold',margin:'0px 5px'}}>{record.buyoutprice-record.buyinprice}</span>元</div>
                </div>
            },
        ],
        allcopyright:[]
    }
    getCurData =()=>{
        axios.get(`${host}/allcopyright`,{}).then((res)=>{
            let {data} = res;
            for(let perData of data){
                perData.key = perData.copyrightid;
            }
            let allcopyright = [].concat(data);
            this.setState({allcopyright});
        })
    }
    componentDidMount(){
        this.getCurData();
    }
    render(){
        let {allcopyrightColumn,allcopyright} = this.state;
        return(
            <div>
                <Table className="copyright_table" dataSource={allcopyright} columns={allcopyrightColumn}/>
            </div>
        )
    }
}
//版权申请信息操作面板
class ApplyRecord extends React.Component{
    state = {
        applyrecordColumn:[
            {title:'申请单号',align:"center",dataIndex:'recordid',key:'recordid'},
            {title:'申请人',key:"username",align:'center',dataIndex:'username'},
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
        applyrecord:[]
    }
    getCurData =()=>{
        axios.get(`${host}/applyrecord`,{}).then((res)=>{
            let {data} = res;
            for(let perData of data){
                perData.key = perData.recordid;
            }
            let applyrecord = [].concat(data);
            this.setState({applyrecord});
        })
    }
    componentDidMount(){
        this.getCurData();
    }
    render(){
        let {applyrecordColumn,applyrecord} = this.state;
        return(
            <div>
                <Table className="copyright_table" dataSource={applyrecord} columns={applyrecordColumn}/>
            </div>
        )
    }
}
//版权交易信息操作面板
class DealRecord extends React.Component{
    state = {
        dealrecordColumn:[
            {title:'交易单号',key:'dealid',align:'center',dataIndex:'dealid'},
            {title:'NTFID号',key:'blockchaintokenid',align:'center',dataIndex:'blockchaintokenid'},
            {title:'销售方',key:'sellername',align:'center',dataIndex:'sellername'},
            {title:'购买方',key:'buyername',align:'center',dataIndex:'buyername'},
            {title:'交易时间',key:'dealdate',align:'center',render:(_,record)=>
                <div>{new Date(+record.dealdate).toLocaleString()}</div>
            },
            {title:'交易金额(单位为￥)',key:'dealprice',align:'center',dataIndex:'dealprice'},
        ],
        dealrecord:[]
    }
    getCurData =()=>{
        axios.get(`${host}/dealrecord`,{}).then((res)=>{
            let {data} = res;
            for(let perData of data){
                perData.key = perData.dealid;
            }
            let dealrecord = [].concat(data);
            this.setState({dealrecord});
        })
    }
    componentDidMount(){
        this.getCurData();
    }
    render(){
        let {dealrecordColumn,dealrecord} = this.state;
        return(
            <div>
                <Table className="copyright_table" dataSource={dealrecord} columns={dealrecordColumn}/>
            </div>
        )
    }
}
//衣衫订单信息操作面板
class ShirtOrderPanel extends React.Component{
    state = {
        columns:[
            {title:'产品图',key:'projectimgurl',dataIndex:'projectimgurl',align:'center' ,width:200,render:(_,record)=><div className="order_detail_img" style={{background:`url(${host}/getStaSource?sourceUrl=${record.projectimgurl})`}}/>},
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
            {title:'下单用户',key:'username',align:'center',dataIndex:'username'},
            {title:'产品单价',key:'unitprice',align:'center',render:(_,record)=><span>￥{record.unitprice}</span>},
            {title:'产品总数',key:'quantity',align:'center',dataIndex:'quantity'},
            {title:'实付款',key:'totalprice',align:'center',render:(_,record)=><span>￥{(record.amount)}<p>（含运费：￥0.00）</p><div style={{display:record.orderstatus === 1?'block':'none'}} className="small_description">注：此时进行退换货</div><div style={{display:record.orderstatus === 1?'block':'none'}} className="small_description">买方将担负按总金额的10%运费</div></span>},
            // {title:'交易操作',key:'orderope',align:'center',render:(_,record)=><div className="order_ope_box">
            //     <div className={record.orderstatus === 2?'disabled':''}>退款/退换货</div>
            //     <div onClick={()=>record.orderstatus === 0 && this.changeAddress(record)} className={record.orderstatus !== 0?'disabled':''}>修改地址</div>
            //     <div>申请开票</div>
            // </div>}
        ],
        shirtorderdata:[]
    }
    getCurData = () => {
        axios.get(`${host}/shirtorder`, {}).then((res) => {
            let { data } = res;
            for (let perData of data) {
                perData.key = perData.orderid;
                perData.isEditing = false;
                perData.ordercontent = JSON.parse(perData.ordercontent);
            }
            let shirtorderdata = [].concat(data);
            this.setState({ shirtorderdata });
        })
    }
    //设置行扩展面板内容
    getTableExpandPanel = (record) => {
        let items = [
            {
                title: '待发货',
                status: 'wait',
                icon: <SendOutlined />
            },
            {
                title: '待收货',
                status: 'wait',
                icon: <ShopOutlined />
            },
            {
                title: '订单完成',
                status: 'wait',
                icon: <SmileOutlined />
            }
        ]
        for (let idx in items) {
            if (+idx === record.orderstatus && +idx !== items.length - 1) {
                items[idx].icon = <LoadingOutlined />
                items[idx].status = 'process';
                break;
            }
            items[idx].status = 'finish';
        }
        return (
            <div className="order_detail_expand_panel">
                <div className="title">当前订单状态：</div>
                <Steps items={items} />
            </div>
        )
    }
    componentDidMount() {
        this.getCurData();
    }
    render(){
        let {columns,shirtorderdata} = this.state;
        return(
            <div>
                <Table key={shirtorderdata} dataSource={shirtorderdata} columns={columns} expandable={{expandedRowRender:(record)=>this.getTableExpandPanel(record),defaultExpandAllRows:true}} scroll={{y:540}}/>
            </div>
        )
    }
}
//使用react-redux进行组件间维护
const mapStateToProps = (state)=>({
    userData:state.userData
})
const mapDispatchToProps = (dispatch)=>{
    return{
        updateUserData:(data)=>dispatch(updateUserData(data))
    }
}
export default connect(mapStateToProps,mapDispatchToProps)(withRouter(ManageSystem));