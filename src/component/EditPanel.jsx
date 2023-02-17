import React from "react";
import {Modal,Button,Input} from "antd";
import "../css/EditPanel.css";
export class EditPanel extends React.Component{
    state ={
        loading:false,
        open:false
    }
    showModal = ()=>{
        this.setState(state=>{
            state.open = true;
            return state;
        })
    }
    handleOk = ()=>{
        //此处用于数据保存与模型更新
        this.setState(state=>{
            state.loading = true;
            return state;
        })
        setTimeout(()=>{
            this.setState({loading:false,open:false});
        },3000);
    }
    handleCancel = ()=>{
        this.setState({open:false});
    }
    render(){
        const {open,loading} = this.state;
        return(
            <Modal open={open} title={(
                <div className="edit_panel_title">
                    <img alt="" src={require(`../pic/ModelPanel/addAsave.svg`).default}/>
                    <div id="decoration_line"></div>
                    <div>新增自定义版型</div>
                </div>
            )} onOk={this.handleOk} onCancel={this.handleCancel}
                footer={[<Button className="save_button" key="save" onClick={this.handleOk}>保存为预设</Button>,<Button className="save_button" key="apply" onClick={this.handleOk} loading={loading}>应用</Button>,<Button className="cancel_button" key="cancel" onClick={this.handleCancel}>取消</Button>]}
            >
                <div className="edit_panel_content">
                    <div className="edit_panel_leftContent">
                        <div className="edit_panel_item">
                            <div className="edit_panel_item_title">版型名称：</div>
                            <Input placeholder="未命名版型1"/>
                        </div>
                        <div className="edit_panel_item">
                            <div className="edit_panel_item_title">基础版型：</div>
                            <Input placeholder="基础版型"/>
                        </div>
                    </div>
                    <div className="edit_panel_rightContent"></div>
                </div>
            </Modal>
        )
    }
}
