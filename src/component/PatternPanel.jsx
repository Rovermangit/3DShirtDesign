import React from "react";
import "../css/PatternPanel.css";
import { PlusOutlined } from '@ant-design/icons';
import {Modal,Upload,Button} from 'antd';
import { nanoid } from "nanoid";
const uploadButton = (
    <div>
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        上传
      </div>
    </div>
);
export default class PatternPanel extends React.Component{
    state = {
        //整个图案面板显示状态
        patternPanelState:false,
        //预览面板显示状态
        previewPanelState:false,
        //预览面板图片展示
        previewPanelImg:'',
        //预览面板标题显示
        previewPanelTitle:'',
        //当前选中图片，用于返回至父级节点
        curPic:null,
        //当前预览图片数据
        curPreviewPic:null,
        //当前已上传图片列表
        fileList:[]
    }
    //获取图片数据的二进制流
    getBase64 = (file)=>new Promise((resolve,reject)=>{
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = ()=>resolve(reader.result);
        reader.onerror = (error)=>reject(error);
    })
    //关闭预览窗口
    handleCancel = ()=>{
        let {previewPanelState} = this.state;
        previewPanelState = false;
        this.setState({previewPanelState});
    }
    //打开预览窗口
    handlePreview = async(file)=>{
        let {previewPanelImg,previewPanelTitle,previewPanelState,curPreviewPic} = this.state;
        //若当前文件未存在，则进行异步获取图片原始数据
        if(!file.url && !file.preview){
            file.preview = await this.getBase64(file.originFileObj);
        }
        curPreviewPic = file;
        previewPanelImg = file.url?file.url:file.preview;
        previewPanelState = true;
        previewPanelTitle = file.name?file.name:file.url.substring(file.url.lastIndexOf('/') + 1);
        this.setState({previewPanelImg,previewPanelState,previewPanelTitle,curPreviewPic});
    }
    //处理图片预览列表更新函数
    handleChange = ({fileList:newFilelist})=>{
        let {fileList} = this.state;
        fileList = newFilelist;
        this.setState({fileList});
    }
    //临时处理图片上传函数
    handleUpload = (options)=>{
        const { file } = options;
        let {fileList} = this.state;
        const reader = new FileReader();
        let fileSteam = reader.readAsDataURL(file);
        let tempImg = {
            uid:nanoid(),
            url:fileSteam,
            name:'测试'
        }
        reader.onload = (file)=>{
            tempImg.status = 'done';
            tempImg.url = file.target.result;
        }

        reader.onerror = ()=>{
            tempImg.status = 'error';
        }
        fileList.push(tempImg);
        this.setState({fileList});
    }
    //处理模态框选择图像函数
    handleSelect = ()=>{
        let {curPic,curPreviewPic} = this.state;
        curPic = JSON.parse(JSON.stringify(curPreviewPic));
        this.handleCancel();
        this.setState({curPic});
    }
    //改变当前面板状态
    changePatternPanelState = ()=>{
        let {patternPanelState} = this.state;
        patternPanelState = !patternPanelState;
        this.setState({patternPanelState});
    }
    confirmClick = ()=>{
        let {patternPanelState,curPic} = this.state;
        patternPanelState = false;
        this.setState({patternPanelState});
        this.props.confirmCallBack(curPic);
    }
    getCurPatternPanelState = ()=>{
        return this.state.patternPanelState;
    }
    render(){
        const {fileList,patternPanelState,previewPanelState,previewPanelTitle,previewPanelImg,curPic} = this.state;
        return(
            <div className="pattern_panel" style={{display:patternPanelState?'block':'none'}}>
                <Upload
                    accept="image/*"
                    customRequest={this.handleUpload}
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={this.handlePreview}
                    onChange={this.handleChange}
                >
                    {uploadButton}
                </Upload>
                <Modal open={previewPanelState} title={previewPanelTitle} footer={[<Button className="save_button" key="apply" onClick={this.handleSelect}>应用</Button>
                ,<Button className="cancel_button" key="cancel" onClick={this.handleCancel}>取消</Button>]} 
                onCancel={this.handleCancel}>
                    <img
                    alt="样本"
                    style={{
                        width: '100%',
                    }}
                    src={previewPanelImg}
                    />
                </Modal>
                <div className="pattern_selected">
                    当前所选图案：
                    {curPic?<img alt="" className="img_selected" src={curPic.url}/>:<span>未选中任何图案</span>}
                </div>
                <div className="pattern_confirm">
                    <Button className="save_button" onClick={this.confirmClick}>确定</Button>
                </div>
            </div>
        )
    }
}