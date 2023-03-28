import React from "react";
import "../css/SystemLogin.css";
import { Button, Input,Form,message,Tooltip } from "antd";
import { Link } from "react-router-dom";
import axios from "axios";
const host = "http://localhost:4444";
export default class SystemLogin extends React.Component{
    state={
        curState:'login',
        reg_psd:'',
        reg_psd_re:'',
        reg_tooltip:false
    }
    //监听注册密码输入
    watchRegPassword = (e)=>{
        this.setState({reg_psd:e.target.value});
    }
    //监听注册重复密码输入
    watchRegRePassword = (e)=>{
        let {reg_psd,reg_tooltip} = this.state;
        reg_tooltip = false;
        if(reg_psd !== e.target.value)reg_tooltip = true;
        if(e.target.value.trim().length === 0)reg_tooltip = false;
        this.setState({reg_psd_re:e.target.value,reg_tooltip});
    }
    //修改当前页面展示板块
    changeState = (value)=>{
        this.setState({curState:value});
    }
    //点击登录以后触发的回调函数
    onLoginConfirm = (values)=>{
        axios.get(`${host}/getLoginData`,{
            params:{
                ...values
            }
        }).then((res)=>{
            let {data} = res;
            if(data.msg){
                message.error(data.msg);
                this.loginForm.resetFields();
            }else{
                message.success(`登录成功，即将为您跳转至管理系统界面`);
                localStorage.setItem('userData',JSON.stringify(data.data[0]));
                if(this.jumpLink)setTimeout(()=>this.jumpLink.click(),3000);
            }
        })
    }
    //点击注册以后触发的回调函数
    onRegisterConfirm = (values)=>{
        let {phone} = values;
        let {reg_psd_re,reg_psd} = this.state;
        if(phone.length !== 11)message.error("手机号不符合规则，请重新输入");
        else if(reg_psd_re !== reg_psd)message.error("两次输入密码不一致");
        else if(reg_psd.length < 8)message.error("请输入8-16位密码！！！");
        else{
            values.userid = 'nid_'+phone.slice(7);
            axios.get(`${host}/addLoginData`,{
                params:{
                    ...values
                }
            }).then((res)=>{
                let {data} = res;
                if(data.msg){
                    message.error(data.msg);
                }else{
                    if(this.jumpLink)setTimeout(()=>this.jumpLink.click(),3000);
                    localStorage.setItem('userData',JSON.stringify({...values}));
                    message.success("注册成功，即将为您跳转至管理系统界面");
                }
            })
        }
    }
    render(){
        let {curState,reg_tooltip,reg_psd,reg_psd_re} = this.state;
        return(
        <div id="systemlogin_panel">
            <Link to={{pathname:'/managesystem'}} ref={(elem)=>this.jumpLink = elem} style={{display:'none'}}/>
            <div id="systemlogin_panel_title" className={curState === 'login'?'title_active':'title_inactive'}>
                <svg className='icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80.01 100"><g fillRule="evenodd"><path d="M80 3.77C59.39 19.79 5.22 27 0 46.84v31.38c0 8.5 2.88 15.55 10.74 21.78C.7 68.08 77.26 73.05 80 45.87z" fill="#114fee" /><path d="M51.69 17.48L51.59 0C29.1 15.36 2 18.09 0 46.84v31.38a27 27 0 0 0 2.39 11.67c-.34-34.1 49.56-20.5 49.4-52.8z" fill="#2ddaff" opacity=".8" /></g></svg>
                易纹创后台管理系统
            </div>
            <div id="background_ball" className={curState === 'login'?'login_ball':'register_ball'}>
            </div>
            <div className={curState === 'login'?'tipbox1_active re_tipbox':'tipbox1_inactive re_tipbox'}>
                <div>还没有账号？</div>
                <div>点击下方即可快速注册</div>
                <Button onClick={()=>this.changeState("register")} type="default" className="tipbox_button">注册</Button>
            </div>
            <div  className={curState === 'register'?'tipbox2_active re_tipbox':'tipbox2_inactive re_tipbox'}>
                <div>已有账号？</div>
                <div>快速输入即可登录系统</div>
                <Button onClick={()=>this.changeState("login")} type="default" className="tipbox_button">登录</Button>
            </div>
            <div id="systemlogin_register" className={curState === 'register'?'systemlogin_register_active':'systemlogin_register_inactive'}>
                <span>注册</span>
                <Form ref={(elem)=>this.registerForm = elem} name="register" onFinish={this.onRegisterConfirm}>
                    <Form.Item required name={'phone'}>
                        <Input maxLength={11} className="systemlogin_input" placeholder="手机号" type="text" prefix={<img alt="" src={require("../pic/ManageSystem/user.svg").default}/>}/>
                    </Form.Item>
                    <Form.Item name={'password'}>
                        <Input.Password maxLength={16} value={reg_psd} onChange={this.watchRegPassword} className="systemlogin_input" placeholder="请输入8-16位密码" prefix={<img alt="" src={require("../pic/ManageSystem/password.svg").default}/>}/>
                    </Form.Item>
                    <Form.Item name={'re_password'}>
                        <Tooltip open={reg_tooltip} color={'red'} title="两次输入密码不一致" placement="right">
                            <Input.Password maxLength={16} value={reg_psd_re} onChange={this.watchRegRePassword} className="systemlogin_input" placeholder="请确认密码" prefix={<img alt="" src={require("../pic/ManageSystem/password.svg").default}/>}/>
                        </Tooltip>
                    </Form.Item>
                    <Form.Item>
                        <button className="systemlogin_confirm" type="submit">注册</button>
                    </Form.Item>
                </Form>
            </div>
            <div id="systemlogin_login" className={curState === 'login'?'systemlogin_login_active':'systemlogin_login_inactive'}>
                <span>登录</span>
                <Form name="login" ref={(elem)=>this.loginForm = elem} onFinish={this.onLoginConfirm}>
                    <Form.Item name='phone'>
                        <Input className="systemlogin_input" placeholder="用户名" type="text" prefix={<img alt="" src={require("../pic/ManageSystem/user.svg").default}/>}/>
                    </Form.Item>
                    <Form.Item name={'password'}>
                        <Input.Password className="systemlogin_input" placeholder="密码" prefix={<img alt="" src={require("../pic/ManageSystem/password.svg").default}/>}/>
                    </Form.Item>
                    <Form.Item>
                        <button className="systemlogin_confirm" type="submit">登录</button>
                    </Form.Item>
                </Form>
            </div>
        </div>
        )
    }
}