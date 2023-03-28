import React from "react";
import "../css/CommonLogin.css";
import { Form, Input, Checkbox, Button,message } from "antd";
import axios from "axios";
import { WeiboOutlined, WechatOutlined, QqOutlined, GithubOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
const host = "http://localhost:4444"
export default class Commonlogin extends React.Component {
    state = {
        backgroundImg: [require("../pic/WebIndex/background1.png")],
        curPanelState: 'login'
    }
    changePanelState = (value) => {
        this.setState({ curPanelState: value });
    }
    //点击登录以后触发的回调函数
    onLoginConfirm = (values) => {
        axios.get(`${host}/getLoginData`, {
            params: {
                ...values
            }
        }).then((res) => {
            let { data } = res;
            if (data.msg) {
                message.error(data.msg);
                this.loginForm.resetFields();
            } else {
                message.success(`登录成功，即将为您跳转至上个界面`);
                localStorage.setItem('commonUserData', JSON.stringify(data.data[0]));
                setTimeout(()=>window.history.back(-1),3000);
            }
        })
    }
    //点击注册以后触发的回调函数
    onRegisterConfirm = (values) => {
        let { phone } = values;
        values.userid = 'nid_' + phone.slice(7);
        axios.get(`${host}/addLoginData`, {
            params: {
                ...values
            }
        }).then((res) => {
            let { data } = res;
            if (data.msg) {
                message.error(data.msg);
                this.registerForm.resetFields();
            } else {
                values.username = '新用户'+values.phone.slice(7);
                values.account = 10000.00;
                values.credit = 5;
                setTimeout(()=>window.history.back(-1), 3000);
                localStorage.setItem('commonUserData', JSON.stringify({ ...values }));
                message.success("注册成功，即将为您跳转至上个界面");
            }
        })
    }
    render() {
        let { curPanelState, backgroundImg } = this.state;
        return (
            <div id="commonlogin_panel">
                <div id="commonlogin_panel_left">
                    <div id="commonlogin_panel_left_hover" style={{ background: `url(${backgroundImg[0]}) no-repeat`, backgroundSize: `80%`, backgroundPosition: '35%' }}>
                        <div>欢迎光临</div>
                        <div>欢迎来到易纹创，在这里，您所有的才华横溢将被无限放大！</div>
                    </div>
                </div>
                <div className="commonlogin_panel_right" style={{ display: curPanelState === 'login' ? 'flex' : 'none' }}>
                    <div>欢迎回来</div>
                    <div>第三方登录</div>
                    <div id="third_login_box">
                        <div><WeiboOutlined /></div>
                        <div><WechatOutlined /></div>
                        <div><QqOutlined /></div>
                        <div><GithubOutlined /></div>
                    </div>
                    <div className="description">———— 使用手机号码登录 ————</div>
                    <Form onFinish={this.onLoginConfirm} name="login" labelCol={{ span: 6 }} wrapperCol={{ span: 28 }} ref={(elem) => this.loginForm = elem}>
                        <Form.Item name={'phone'} label='手机' rules={[{ pattern: new RegExp(/^[0-9]\d*/g), message: '请输入有效数字' }, { min: 11, message: '请输入有效手机号' }, { max: 11, message: '请输入有效手机号' }, { required: true, message: '此为必填字段' }]}>
                            <Input allowClear prefix={<UserOutlined />} />
                        </Form.Item>
                        <Form.Item name={'password'} label='密码' rules={[{ required: true, message: '请输入您的密码' }]}>
                            <Input.Password allowClear prefix={<LockOutlined />} />
                        </Form.Item>
                        <Form.Item name="remember" valuePropName="checked">
                            <div className="remeber_box">
                                <Checkbox>记住我</Checkbox>
                                <a className="login-form-forgot" href=" ">忘记密码</a>
                            </div>
                        </Form.Item>
                        <Form.Item>
                            <Button className="commonlogin_button" type="primary" htmlType="submit">登录</Button>
                        </Form.Item>
                        <div>
                            还没有账号？<span className="login-form-forgot" onClick={() => { this.changePanelState("register"); return false; }}>
                                立即注册
                            </span>
                        </div>
                    </Form>
                </div>
                <div className="commonlogin_panel_right" style={{ display: curPanelState === 'register' ? 'flex' : 'none' }}>
                    <div>快速注册</div>
                    <div className="description">———— 使用手机号码注册 ————</div>
                    <Form onFinish={this.onRegisterConfirm} name="register" labelCol={{ span: 6 }} wrapperCol={{ span: 28 }} ref={(elem) => this.registerForm = elem}>
                        <Form.Item name={'phone'} label='手机' hasFeedback rules={[{ pattern: new RegExp(/^[0-9]\d*/g), message: '请输入有效数字' }, { min: 11, message: '请输入有效手机号' }, { max: 11, message: '请输入有效手机号' }, { required: true, message: '此为必填字段' }]}>
                            <Input placeholder="请输入手机号码" allowClear prefix={<UserOutlined />} />
                        </Form.Item>
                        <Form.Item name={'password'} hasFeedback label='密码' rules={[{ required: true, message: '请输入您的密码' }, { max: 16, min: 8, message: '密码应为8-16位' }]}>
                            <Input.Password placeholder="请输入8-16位密码" allowClear prefix={<LockOutlined />} />
                        </Form.Item>
                        <Form.Item name="re_password" hasFeedback dependencies={['password']} label="确认密码" rules={[{ required: true, message: '请确认您的密码' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) return Promise.resolve(); return Promise.reject("两次密码输入不相同") } })]}>
                            <Input.Password allowClear placeholder="请重复密码" prefix={<LockOutlined />} />
                        </Form.Item>
                        <Form.Item name="remember" valuePropName="checked" required>
                            <Checkbox>我同意并遵守服务协议</Checkbox>
                        </Form.Item>
                        <Form.Item>
                            <Button className="commonlogin_button" type="primary" htmlType="submit">注册</Button>
                        </Form.Item>
                        <Form.Item>
                            <div>
                                已有账号？<span className="login-form-forgot" onClick={() => { this.changePanelState("login"); }}>
                                    马上登录
                                </span>
                            </div>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        )
    }
}
