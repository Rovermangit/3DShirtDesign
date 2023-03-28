import React from "react";
import { Collapse,Select,Input,Button } from 'antd';
import { debounce } from "lodash";
import { CaretLeftFilled } from '@ant-design/icons';
import "../css/ChangePart.css";
import {fontFamily} from "../data/fontFamilyData";
import {fabric} from 'fabric';
import {ColorPanel} from './ColorPanel';
// import { connect} from 'react-redux';
// import { changeShirtScheme } from "../redux/actions";
const {Option} = Select;
const { Panel } = Collapse;
const {TextArea} = Input;
const customStyle = {
    background: 'white'
}
export class ChangePart extends React.Component {
    //更改每个手风琴的开关状态
    changeOpenIconState = () => {
        let {expandState} = this.state;
        expandState = !expandState;
        this.setState({expandState});
    }
    //设置每个手风琴右侧图标样式，包括开关时旋转位置
    showExpandIcon = () => (
        <CaretLeftFilled rotate={this.state.expandState ? -90 : 0} />
    )
    state = {
        expandState: false
    }
    render() {
        //props与state解构获取数据，简化下述解构
        const { svg, title} = this.props;
        const { expandState } = this.state;
        return (
            //设置手风琴基础状态，包括左侧图片显示，以及默认是否打开 defaultActiveKey={['1']}
            <Collapse onChange={this.changeOpenIconState} bordered={false} 
                expandIcon={_ => <img className="expand_icon" src={require(`../pic/ModelPanel/${svg}`)} alt="" />}>
                {/* 简单动画样式，增加开关状态显示情况 */}
                <div className={expandState ? 'expand_line_active expand_line' : 'expand_line_inactive expand_line'} />
                <Panel header={title} key='1' style={customStyle} extra={this.showExpandIcon()}>
                    {/* 手风琴面板内容展示，由于保证通用性与文档结构清晰，需将内容展示写入其他类中 */}
                    <ChangePartContent {...this.props}/>
                </Panel>
            </Collapse>
        )
    }
}
export class ChangePartContent extends React.Component {
    state = {
        alreadyUploadList:[], 
        currentInput:null
    }
    //监听上传文件变化
    fileChange = ()=>{
        let currentInput = this.currentInput;
        let files = currentInput.files;
        for (let file of files) {
            let object = {};
            object.title = file.name.substring(0, file.name.lastIndexOf('.'));
            object.hoverIfo = object.title;
            object.tempUpload = true;
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (result) => {
                this.setState(state => {
                    object.value = result.target.result;
                    object.src = result.target.result;
                    state.alreadyUploadList.push(object);
                    return state;
                })
            }
        }

    }
    componentDidMount = ()=>{
        //判断当前数据是否为文字添加组件数据，若是则在state中添加fontValue
        const data = this.props.data;
        if(data && data.isOddContent){
            this.handleFilterData = debounce(this.handleFilterData,800);
            this.changeTextContent = debounce(this.changeTextContent,800);
            //初始化画布
            this.canvas = new fabric.Canvas('text_temp_show',{
                width:210,
                height:100,
            })
            this.canvas.selection = false;
            this.resetTextPanel();
        }
    }
    //处理select搜索内容变换的函数
    handleFilterData = filterData =>{
        this.setState(state=>{
            if(filterData.trim().length === 0){
                state.fontData = fontFamily;
            }else{
                state.fontData = fontFamily.filter(item=>
                    item.value.indexOf(filterData)>=0
                )
            }
            return state;
        })
    }
    //处理select数据变换时的函数
    handleSelectChange = value=>{
        this.setState(state=>{
            state.fontValue = value;
            return state;
        })
        this.changeTextContent();
    }
    //调用脱离文档流的input上传框
    getUploadClick = ()=>{
        this.currentInput.click();
    }
    //设置点击删除自添加内容
    getItemDelete = (e,value)=>{
        e.stopPropagation();
        const {alreadyUploadList} = this.state;
        this.setState(state=>{
            state.alreadyUploadList = alreadyUploadList.filter(item=>item.value!==value);
            return state;
        })
    }

    //添加效果到文本内容块上
    changeTextEffect = (value)=>{
        this.setState(state=>{
            switch(value){
                case 'bold':
                    state.isBold = !state.isBold;
                    break;
                case 'italic':
                    state.isItalic = !state.isItalic;
                    break;
                case 'hasUl':
                    state.hasUl = !state.hasUl;
                    break;
                case 'hasDl':
                    state.hasDl = !state.hasDl;
                    break;
                default:
                    break;
            }
            return state;   
        })
        this.changeTextContent();
    }
    //更改画布文案内容函数,(渐变角度与描边暂不考虑)
    changeTextContent = ()=>{
        const canvas = this.canvas;
        const {isBold,isItalic,hasUl,hasDl,fontValue,textContent} = this.state;
        const {color,colorType,colors} = this.colorPanel.state;
        //判断颜色选择器的颜色是否有变化，若有则对该板块的color属性进行重新赋值，以便图标显示
        if(this.state.color !== color)this.setState(state=>{state.color = color;return state;})
        //若文本框无内容则直接返回
        if(textContent.trim().length === 0)return;
        //清空画布
        canvas.clear();
        //重新绘制内容
        let Text = new fabric.IText(textContent,{
            fontFamily:fontValue,
            fontWeight:isBold?'bold':'normal',
            fontStyle:isItalic?'italic':'normal',
            underline:hasUl,
            linethrough:hasDl,
            fontSize:canvas.width/textContent.length,
            selectable:false
        })
        //根据字体大小进行字号重置，防止预览内容过小
        if(Text.width<=150)Text.set('fontSize',Text.fontSize+10);
        //对颜色选择器当前选中类别进行判断，查看其是否为纯色还是渐变
        let fontColor = color;
        Text.fillType = 'color';
        if(colorType === 'gradient'){
            fontColor = new fabric.Gradient({
                type: 'linear',  //linear radial
                gradientUnits: 'pixels', //pixels 百分比
                coords: {
                x1: 0,
                y1: 0,
                x2: Text.width,
                y2: 0,
                },
                colorStops: colors
            })
            Text.fillType = 'gradient';
        }
        Text.set('fill',fontColor);
        Text.left = (canvas.width-Text.width)/2;
        Text.top = (canvas.height-Text.height)/2;
        canvas.add(Text);
    }
    //重置所有内容
    resetTextPanel = ()=>{
        this.setState(state=>{
            state.fontValue = fontFamily[0].value;
            state.fontData = fontFamily;
            state.isBold = false;
            state.isItalic = false;
            state.hasUl = false;
            state.hasDl = false;
            state.textContent = '';
            this.colorPanel.resetColorData();
            state.color = "#7f7f7f";
            this.canvas.clear();
            return state;
        })
    }
    //监听文本输入框内容
    watchTextContent = (elem)=>{
        let value = elem.target.value;
        this.setState(state=>{
            state.textContent = value;
            return state; 
        })
        this.changeTextContent();
    }
    //添加文本输入内容到模型
    addTextContentToModal = ()=>{
        let text = this.canvas.getObjects()[0];
        if(text)this.props.addTextContent(text);
    }
    render() {
        const data = this.props.data;
        const {alreadyUploadList,fontValue,fontData,isBold,isItalic,hasDl,hasUl,color,textContent} = this.state;
        let odata;
        let pdata;
        let currentStyle;
        //判断数据是否传入正确，且是否为空对象
        if (data && JSON.stringify(data) !== '{}') {
            //设置每个子内容展示样式，根据需要展示内容多少进行动态更改，如每行4个，则宽度为总宽度的21%
            currentStyle = {
                width: (100 / data.itemsPerRow - data.itemsPerRow) + '%',
                height: data.itemsPerRow * 16 + 'px',
                display: 'flex',
                justifyContent:'center',
                alignItems:'center',
                flexDirection: 'column',
                cursor:'pointer'
            };
            //判断数据是否仅包含官方数据，如切换模型展示方向
            if (!data.onlyOfficial) {
                //根据数据类型进行数据分类，若为0即为官方数据，为1即为个人保存数据
                odata = data.data.filter(item => item.userType === 0)
                pdata = data.data.filter(item => item.userType === 1)
                //判断数据是否可上传，若可上传，则添加一个上传按钮用于文件上传
                //暂未完成：此处还需要进行数据个数判别，即若超过8个后数据应如何显示
                if(data.canBeUpload){
                    if(alreadyUploadList.length !== 0)pdata = [...alreadyUploadList].concat(pdata);
                    pdata.push(
                        {
                            src:'upload.svg',title:'上传',hoverIfo:'点击上传',userType:1,value:'upload',isUpload:true,
                        }
                    )
                }
            } else {
                odata = data.data;
            }
        }

        return (
            data && data.isOddContent?
            <div className="text_content_box">
                <div className="text_content_box_detail">
                    字体：<Select value={fontValue} showSearch filterOption={false} showArrow={false} onChange={this.handleSelectChange} onSearch={this.handleFilterData} style={{width:'80%'}}>
                        {fontData && fontData.map(item=>
                            <Option key={item.value}>{item.value}</Option>
                        )}
                    </Select>
                </div>
                <div className="text_content_box_detail">
                    <div className="text_label">内容：</div>
                    <TextArea id="text_input_box" onChange={this.watchTextContent} maxLength={15} style={{width:'100%'}} autoSize={{ minRows: 1, maxRows: 3 }} value={textContent}/>
                </div>
                <div className="text_content_box_detail" id="text_content_effect">
                    <div className="text_label">效果添加：</div>
                    <div className="text_effect_box">
                        <svg onClick={()=>this.changeTextEffect("bold")} t="1673247310724" className={isBold?'effect_apply text_effect':'effect_unapply text_effect'} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4230" width="200" height="200"><path d="M768.96 575.072c-22.144-34.112-54.816-56.8-97.984-68.032v-2.176c22.88-10.88 42.112-23.04 57.696-36.48 15.616-12.704 27.584-26.144 35.936-40.288 16.32-29.76 24.128-60.96 23.392-93.632 0-63.872-19.776-115.232-59.328-154.08-39.2-38.464-97.824-58.048-175.84-58.784H215.232v793.728H579.52c62.432 0 114.496-20.864 156.256-62.624 42.112-39.936 63.52-94.176 64.224-162.752 0-41.376-10.336-79.68-31.04-114.88zM344.32 228.832h194.912c43.904 0.736 76.224 11.424 96.896 32.128 21.056 22.144 31.584 49.184 31.584 81.12s-10.528 58.432-31.584 79.488c-20.672 22.848-52.992 34.304-96.896 34.304H344.32V228.832z m304.352 536.256c-20.672 23.584-53.344 35.744-97.984 36.48H344.32v-238.432h206.336c44.64 0.704 77.312 12.512 97.984 35.392 20.672 23.232 31.04 51.168 31.04 83.84 0 31.904-10.336 59.488-31.008 82.72z" p-id="4231" fill="#707070"></path></svg>
                        <svg onClick={()=>this.changeTextEffect("italic")} t="1673247357613" className={isItalic?'effect_apply text_effect':'effect_unapply text_effect'} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4480" width="200" height="200"><path d="M768 85.792h-288a32 32 0 0 0 0 64h96.32l-230.336 704H256a32 32 0 0 0 0 64h288a32 32 0 0 0 0-64h-93.728l230.528-704H768a32 32 0 0 0 0-64z" p-id="4481" fill="#707070"></path></svg>
                        <svg onClick={()=>this.changeTextEffect("hasUl")} t="1673247376258" className={hasUl?'effect_apply text_effect':'effect_unapply text_effect'} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4730" width="200" height="200"><path d="M512 811.296a312 312 0 0 0 312-312V89.6h-112v409.696a200 200 0 1 1-400 0V89.6h-112v409.696a312 312 0 0 0 312 312zM864 885.792H160a32 32 0 0 0 0 64h704a32 32 0 0 0 0-64z" p-id="4731" fill="#707070"></path></svg>
                        <svg onClick={()=>this.changeTextEffect("hasDl")} t="1673247407729" className={hasDl?'effect_apply text_effect':'effect_unapply text_effect'} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5028" width="200" height="200"><path d="M893.088 501.792H125.344a32 32 0 0 0 0 64h767.744a32 32 0 0 0 0-64zM448 448h112V208h288V96H160v112h288zM448 640h112v288H448z" p-id="5029" fill="#707070"></path></svg>
                        {/*由于path的fill属性无法设置渐变效果，故不考虑选择渐变时产生对应效果*/}
                        <svg onClick={this.colorPanel && this.colorPanel.changeColorPanelState} id="font_color_svg" style={{'--curColor':color}} t="1673322299636" className="text_effect" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5820" data-spm-anchor-id="a313x.7781069.0.i2" width="200" height="200"><path d="M839 768H735.3l-74.1-192.7H358.6L288.7 768H185L461.8 64h100.4L839 768zM632.1 495.8L522.3 203.1c-3.4-9.4-7.2-25.7-11.3-49.1h-2.3c-3.4 21.2-7.4 37.6-11.7 49.1L388.1 495.8h244z" fill="#707070" p-id="5821" data-spm-anchor-id="a313x.7781069.0.i1"></path><path id="show_color_path" d="M64 832h896v128H64z" fill="#707070" p-id="5822" data-spm-anchor-id="a313x.7781069.0.i3"></path></svg>
                        <ColorPanel canBeGradient={true} ref={(elem)=>this.colorPanel = elem} onChangeFn = {this.changeTextContent}/>
                    </div>
                </div>
                <div className="text_content_box_detail">
                    <div className="text_label">效果展现：</div>
                    <canvas id="text_temp_show"></canvas>
                </div>
                <div className="text_content_box_detail text_content_box_resetAadd" >
                    <Button onClick={this.resetTextPanel}>重置</Button>
                    <Button onClick={this.addTextContentToModal}id="text_content_add_confirm">添加</Button>
                </div>
            </div>
            :
            <div>
                <div className="content_box">
                    {/*首先判别仅有官方数据，若如此，则仅显示数据同时不展现官方预设标题*/}
                    <div style={{ display: !data || data.onlyOfficial ? 'none' : 'flex' }}>
                        <img alt="" src={require(`../pic/ModelPanel/official_ver.svg`).default}/>
                        官方预设
                    </div>
                    <div className="content_box_detail">
                        {
                            //若官方数据存在则进行数据遍历，将数据进行依次展示，同时展示样式存在两种
                            odata && odata.map((item, i) =>
                                <div key={i} style={currentStyle} onClick={()=>data.onClickFn?eval('this.props.'+data.onClickFn+'(item.value)'):{}}>
                                    <div className="content_box_detail_imgBox" style={{background: data.showType === 1 ? '#F3F5F6' : '#FFFFFF'}}><img className="content_box_img" src={require(`../pic/ModelPanel/${item.src}`)} alt="图片出错" title={item.hoverIfo} /></div>
                                    <span style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(0,0,0,50%)' }}>{item.title}</span>
                                </div>
                            )
                        }
                    </div>
                </div>
                <div className="content_box">
                    {/*判别是否存在个人数据，之后再进行判别是否可进行上传*/}
                    <div style={{ display: !data || data.onlyOfficial ? 'none' : 'flex' ,marginTop:'15px'}}>
                        <img alt="" src={require(`../pic/ModelPanel/private_ver.svg`).default}/>
                        个人预设
                    </div>
                    <div className="content_box_detail" style={{ display: !data || data.onlyOfficial ? 'none' : 'flex' }}>
                        {/*设置上传框，通过ref绑定后，将其隐藏使其脱离文档流，通过其他按钮点击调用*/}
                        <input type="file" multiple accept="image/*" onChange={this.fileChange} ref={(element)=>{this.currentInput = element}} style={{display:'none'}}/>
                        {
                            pdata && pdata.length?
                            pdata.map((item,i)=>
                                <div key={item.value} style={currentStyle} onClick={item.isUpload? this.getUploadClick:()=>{eval('this.props.'+data.onClickFn+'("@@@"+item.value)')}}>
                                    <div className="content_box_detail_imgBox" style={{background: data.showType === 1 ? '#F3F5F6' : '#FFFFFF'}}>
                                        <img className="content_box_img" src={item.tempUpload?item.src:require(`../pic/ModelPanel/${item.src}`)} alt="图片出错" title={item.hoverIfo} />
                                    </div>
                                    <img onClick={(e)=>this.getItemDelete(e,item.value)} className="delete_img" style={{display:item.value!=='upload'?'block':'none'}} src={require(`../pic/ModelPanel/delete.svg`).default} alt="图片出错"/>
                                    <div style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(0,0,0,50%)' }}>{item.title}</div>
                                </div>
                            ):
                            <div style={{fontSize:'13px',width:'100%',textAlign:'center'}}>
                                当前未存在个人预设
                            </div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}
