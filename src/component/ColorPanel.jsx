import React from "react";
import {Select,Input,Button} from 'antd';
import { HexColorPicker } from "react-colorful";
import '../css/ColorPanel.css';
const {Option} = Select;
//自创作颜色选择器，可通过onChangeFn连接颜色改变的回调函数
export class ColorPanel extends React.Component{
    state = {
        color:'#7F7F7F',
        colorInput:'#7F7F7F',
        colorType:'purity',
        colors:[
            {color:'#ffffff',id:'origin1',offset:0},
            {color:"#000000",id:'origin2',offset:1}
        ],
        selectNode:null,
        colorPanelOpenState:false,
    }
    //监听用户的delete按键实现颜色节点的删除
    //存在bug：即与ModelPanel的图层删除存在连带关系，删除图层时会附带删除渐变色节点
    //已有解决方法（文字添加后，默认选中节点设置为第一个或最后节点，使其无法删除=>暂不处理）
    componentDidMount = ()=>{
        window.addEventListener('keydown',(e)=>{
            //当按下delete按键后对选中的图层块进行删除，删除后同步整个图层到右侧模型展示
            const {selectNode,colors} = this.state;
            if(e && e.code === 'Delete'){
                if(selectNode && selectNode.id !== 'origin1' && selectNode.id !== 'origin2'){
                    this.setState(state=>{
                        for(let idx in colors){
                            if(selectNode.id === colors[idx].id){
                                state.colors.splice(idx,1);
                            }
                        }
                        state.selectNode = state.colors[0];
                        state.colorInput = state.colors[0].color;
                        return state;
                    })
                    this.props.onChangeFn();
                }
            }
        },false);
    }
    //监听当前选择颜色是否为纯色还是渐变色
    handleColorTypeSelect = (value)=>{
        this.setState(state=>{
            state.colorType = value;
            if(value === 'purity'){
                state.selectNode = null;
                state.colorInput = state.color;
            }else{
                state.selectNode = state.colors[0];
                state.colorInput = state.selectNode.color;
            }
            return state;            
        })
        this.props.onChangeFn();
    }    
    //更改颜色选择器的开关状态
    changeColorPanelState = ()=>{
        this.setState(state=>{
            state.colorPanelOpenState = !state.colorPanelOpenState;
            return state;
        })
    }    
    //获取当前颜色板的开关状态
    getCurColorPanelState = ()=>{
        return this.state.colorPanelOpenState
    }
    //更改颜色
    changeCurColor = (value)=>{
        const {colorType,selectNode,colors} = this.state;
        this.setState(state=>{
            if(colorType === 'purity'){
                state.color = value;
            }else{
                for(let idx in colors){
                    if(colors[idx].id === selectNode.id){
                        state.colors[idx].color = value;
                        selectNode.color = value;
                        break;
                    }
                }
            }
            state.colorInput = value;
            return state;
        })
        this.props.onChangeFn(value);
    }    
    //改变颜色输入后的input内容显示
    changeColorInput = (elem)=>{
        let value = elem.target.value;
        this.setState(state=>{
            state.colorInput = value;
            return state;
        })
    }    
    //监听颜色输入，包括失去焦点以及按enter后的处理
    watchColorInput = ()=>{
        const {colorType,colors,selectNode} = this.state;
        let value = this.state.colorInput;
        this.setState(state=>{
            //处理颜色未符合指定长度的字符串
            if(value.length === 7 && value[0] === '#'){
                value = value.substring(1);
            }
            //遍历字符串判断是否每个字符是否在颜色取色范围内，若不符合则直接赋上一次颜色
            let tempValue = '';
            if(value.length === 6){
                let values = value.toLowerCase().split("");
                for(let perLetter of values){
                    let code = perLetter.charCodeAt();
                    if((code>=48 && code<=57)||(code>=97 && code<=102)){
                        tempValue += perLetter;
                    }else{
                        return state;
                    }
                }
            }
            state.colorInput = "#"+tempValue; 
            if(colorType === 'purity'){
                state.color = "#"+tempValue;
            }else{
                for(let idx in colors){
                    if(colors[idx].id === selectNode.id){
                        state.colors[idx].color = value;
                        selectNode.color = value;
                        break;
                    }
                }
            }
            this.props.onChangeFn(state.color);
            return state;
        })
    }
    //重置颜色数据
    resetColorData = ()=>{
        this.setState(state=>{
            state.color = '#7F7F7F';
            state.colorInput = state.color;
            state.colorType = 'purity';
            state.colors = [
                {color:'#ffffff',id:'origin1',offset:0},
                {color:"#000000",id:'origin2',offset:1}
            ];
            state.colorPanelOpenState = false;
            state.selectNode = null;
            return state;   
        })
    }
    //选中渐变条中的颜色节点
    selectColorNode=(elem)=>{
        //阻止冒泡事件
        elem.stopPropagation();
        this.setState(state=>{
            state.selectNode = JSON.parse(elem.target.dataset.colordata);
            return state;
        })
    }
    //添加颜色节点
    addColorNode = (e)=>{
        const {colors} = this.state;
        let event = e.nativeEvent;
        let newElem = {};
        newElem.color = '#000000';
        newElem.offset = (event.offsetX/190).toFixed(2);
        newElem.id = new Date().getTime();
        this.setState(state=>{
            for(let idx in colors){
                if(colors[idx].offset>newElem.offset){
                    state.colors.splice(idx,0,newElem);
                    break;
                }
            }
            state.selectNode = newElem;
            state.colorInput = newElem.color;
            return state;
        })
    }
    render(){
        const {color,colorInput,colorType,colors,colorPanelOpenState,selectNode} = this.state;
        const {canBeGradient} = this.props;
        return (
        <div id="color_picker_panel" className={colorPanelOpenState?'color_panel_state_open':'color_panel_state_close'}>
            <Select style={{width:90,fontSize:14,margin:"5px 10px",float:'left',display:canBeGradient?'block':'none'}} value={colorType} onChange={this.handleColorTypeSelect}>
                <Option value="purity">纯色</Option>
                <Option value="gradient">渐变色</Option>
            </Select>
            {colors?
            <div id="gradient_line" onClick={this.addColorNode} style={{display:colorType==='gradient'?'block':'none',background:'linear-gradient(90deg,'+colors.reduce((cur,next,idx,arr)=>cur+=next.color+' '+next.offset*100+'%'+(idx !== arr.length-1?',':''),'')+')'}}>
                {colors.map(item=>
                    <div data-colordata={JSON.stringify(item)} key={item.id} id={selectNode && item.id === selectNode.id?'selectedNode':''} onClick={(elem)=>this.selectColorNode(elem)} className="gradient_node" style={{left:item.offset*190-5,background:item.color}}></div>    
                )}
            </div>
            :''}
            <HexColorPicker id="color_picker" onChange={this.changeCurColor} color={selectNode?selectNode.color:color}/>
            <div id="color_picker_part">
                当前:<Input type="text" maxLength={7} onChange={this.changeColorInput} onBlur={this.watchColorInput} onPressEnter={this.watchColorInput} id="color_input" value={colorInput}/>
                <Button onClick={this.changeColorPanelState}>确定</Button>
            </div>
        </div>
        )
    }
}