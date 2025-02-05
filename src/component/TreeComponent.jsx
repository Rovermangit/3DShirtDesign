import React from "react";
import { Tree, Tooltip } from "antd";
import { nanoid } from "nanoid";
import "../css/TreeComponent.css"
const { DirectoryTree } = Tree;
export default class TreeComponent extends React.Component {
    state = {
        myData: [],
        expandedKeys: [],
        selectedKeys: [],
        //由于该组件需要进行复用，故右键菜单的功能应分为固有功能与外来功能进行分开渲染
        treeEditOptions: [
            { title: '复制', onPressKey: 'Ctrl + C', key: 'KeyC', info: '复制', onClickFn: 'copyCurNode' },
            { title: '剪切', onPressKey: 'Ctrl + X', key: 'KeyX', info: '剪切', onClickFn: 'clipCurNode' },
            { title: '粘贴', onPressKey: 'Ctrl + V', key: 'KeyV', info: '粘贴', onClickFn: 'pasteCurNode' },
            { title: '删除', onPressKey: 'Ctrl + Del', key: 'Delete', info: '删除', onClickFn: "deleteCurNode" },
            { title: '重命名', onPressKey: 'Ctrl + R', key: 'KeyR', info: '重命名(当前仅可命名第一项选中项)', onClickFn: "renameCurNode" },
            { title: '组合', onPressKey: 'Ctrl + B', key: 'KeyB', info: '将当前所选节点组合为复合节点', onClickFn: 'regroupNode' },
        ],
        oddEditOptions: this.props.oddEditOptions,
        rightClickPanelState: false,
        rightClickPanelPosX: 0,
        rightClickPanelPosY: 0,
        copyNode: [],
        copyKeys:[],
        pasteType: 'copy',
    }
    componentDidMount() {
        //阻止右键默认事件
        document.oncontextmenu = function (e) {
            e = e || window.event;
            return false;
        }
        //监听click事件,，当点击目标不为当前右键菜单时则直接关闭
        document.addEventListener('click', (event) => {
            let e = event || window.event;
            let elem = e.target;
            while (elem) {
                if (elem.id && elem.id === 'tree_edit') {
                    return;
                }
                elem = elem.parentNode;
            }
            this.closeTreeEdit();
        })
        let {treeEditOptions,oddEditOptions} = this.state;
        document.addEventListener('keydown',(e)=>{
            for(let perOption of treeEditOptions){
                if(e && e.ctrlKey && e.code === perOption.key){
                    e.preventDefault();
                    this.switchExecuteFn(perOption.onClickFn)
                    return;
                }
            }
            //若存在父节点传入的右键函数，则给予添加按键事件
            if(oddEditOptions && oddEditOptions.length !== 0){
                for(let perOption of oddEditOptions){
                    if(e && e.ctrlKey && e.code === perOption.key){
                        e.preventDefault();
                        this.props.switchExecuteOddFn(perOption.onClickFn);
                        return;
                    }
                }
            }
        },false);
        if(this.props.data){
            this.setState({myData:[].concat(this.props.data)});
        }
    }
    //设置右键菜单显示以及位置设置
    showTreeEdit = ({ event, node }) => {
        let e = event.nativeEvent;
        let { selectedKeys } = this.state;
        this.setState(state => {
            state.rightClickPanelPosX = this.props.leftExpandState?e.clientX - 250:e.clientX;
            state.rightClickPanelPosY = e.clientY;
            state.rightClickPanelState = true;
            return state;
        })
        if (selectedKeys.length <= 1) {
            selectedKeys = [node.key];
            this.setState({ selectedKeys })
        }
    }
    //关闭右键菜单函数
    closeTreeEdit = () => {
        this.setState(state => {
            state.rightClickPanelState = false;
            return state;
        })
    }
    //设置完selectedKeys后应添加对应onSelect函数以添加选中后的自定义事件
    onSelect = (selectedKeys) => {
        this.setState({ selectedKeys });
        this.props.selectedFn(Array.from(selectedKeys));
    }
    //expand同理
    onExpand = (expandedKeys) => {
        this.setState({ expandedKeys });
    }
    //用于解决循环渲染中为同一类型元素绑定不同类型的点击的间接函数
    switchExecuteFn = (value) =>{
        switch(value){
            case 'copyCurNode':
                this.copyCurNode();
                break;
            case 'pasteCurNode':
                this.pasteCurNode();
                break;
            case 'clipCurNode':
                this.clipCurNode();
                break;
            case 'deleteCurNode':
                this.deleteCurNode();
                break;
            case 'renameCurNode':
                this.renameCurNode();
                break;
            case 'regroupNode':
                this.regroupNode();
                break;
            default :
                this.copyCurNode();
                break;
        }
        this.closeTreeEdit();
    }
    //复制当前节点包含子节点函数
    copyCurNode = ()=>{
        let {selectedKeys,pasteType} = this.state;
        let copyNode = []; 
        let copyKeys = [];
        for(let key of selectedKeys){
            //需要深拷贝数据至粘贴板上
            copyNode.push(JSON.parse(JSON.stringify(this.loopCheck(key).curNode)));
            copyKeys.push(key);
        }
        //清空当前选中项
        selectedKeys = [];
        pasteType = 'copy';
        this.setState({copyNode,selectedKeys,pasteType,copyKeys});
    }
    //剪切当前节点包含子节点函数
    clipCurNode = ()=>{
        let {myData,selectedKeys,pasteType} = this.state;
        let copyNode = [];
        let copyKeys = [];
        //树数据更新的必要步骤！！！
        myData = Array.from(myData);
        //遍历已选中项
        for(let key of selectedKeys){
            //设置遍历循环函数，对于符合项则深拷贝到粘贴栏中，同时除去当前选中数据并跳过该次循环
            const loop = (data,parentNode)=>{
                for(let idx in data){
                    if(data[idx].key === key){
                        copyNode.push(JSON.parse(JSON.stringify(data[idx])));
                        data.splice(idx,1);
                        //若当前节点不为根节点且子节点最后一个节点已删除，则为该节点添加叶子节点属性
                        if(data.length === 0 && parentNode){
                            parentNode.isLeaf = true;
                        }
                        continue;
                    }
                    //对于未符合项，查找其子节点，将子节点数据以原始数据形式传入循环函数中
                    if(data[idx].children && data[idx].children.length){
                        loop(data[idx].children,data[idx]);
                    }
                }
            }
            loop(myData,null);
            copyKeys.push(key);
        }
        //清空当前选中项
        selectedKeys = [];
        //将粘贴形式为设置为剪切
        pasteType = 'clip';
        this.setState({myData,selectedKeys,copyNode,pasteType,copyKeys});
        this.props.treeEditCallBack({type:'clipNode',myData:Array.from(myData),targetKeys:[...copyKeys]});
        return copyNode;
    }
    //粘贴当前已剪切或复制的节点
    pasteCurNode = ()=>{
        let {copyNode,selectedKeys,myData,pasteType,copyKeys} = this.state;
        //粘贴板内容为空时直接返回
        if(copyNode.length === 0)return;
        let targetKeys = [];
        let newData = [];
        //循环遍历粘贴板数据,将新对象内容中的key设置为唯一标志nanoid
        const loop = (data)=>{
            return data && data.map(item=>{
                //设置唯一标识
                item.key = nanoid();
                item.title += '-复制项';
                if(item.children && item.children.length){   
                    return loop(item.children);
                }else{
                    return item;
                }
            })
        }
        //如果当前无选中项，则直接粘贴到根目录下
        if(selectedKeys.length === 0){
            if(pasteType === 'copy')loop(copyNode);
            myData = myData.concat(copyNode);
            newData.push(JSON.parse(JSON.stringify(copyNode)));
            targetKeys.push('__root__');
        }else{
            //若已有选中项且存在多选情况则遍历选中项进行数据复制
            for(let key of selectedKeys){
                //由于所复制内容的key也需要保持不同，故遍历过程中每次粘贴板内容的key都需要变换
                if(pasteType === 'copy')loop(copyNode);
                else {pasteType = 'copy';}
                //每次获取的数据都要进行深拷贝
                let tempData = JSON.parse(JSON.stringify(copyNode));
                // 拷贝新节点用于新增图层的key赋值
                newData.push(tempData);
                let {curNode,parentNode} = this.loopCheck(key);
                //判断是否为组节点还是叶子节点
                if(curNode.children){
                    curNode.children = curNode.children.concat(tempData);
                    targetKeys.push(curNode.key);
                }
                //如果粘贴在叶子节点上，则将存放在与叶子节点同一级目录下
                else {
                    //查看所选当前节点是否有父节点，若无则将存放在根目录下
                    if(parentNode){
                        parentNode.children = tempData.concat(parentNode.children);
                        targetKeys.push(parentNode.key);
                    }
                    else {
                        myData = tempData.concat(myData)
                        targetKeys.push('__root__');
                    }
                }
            }
        }
        myData = Array.from(myData);
        //不论是复制还是剪切，粘贴完成后要将该值设置为复制，防止key值重复
        pasteType = 'copy';
        this.setState({myData,pasteType});
        this.props.treeEditCallBack({type:'pasteNode',myData:Array.from(newData),copyKeys,targetKeys});
    }
    //删除选中节点(函数体大致与剪切相同，只是没有将数据传入粘贴板的步骤)
    //若存在传入values值则为删除指定节点而不为选中节点，则将以values值为基准
    deleteCurNode = (values)=>{
        let {selectedKeys,myData} = this.state;
        //树数据更新的必要步骤！！！
        myData = Array.from(myData);
        if(values)selectedKeys = values;
        for(let key of selectedKeys){
            //设置遍历循环函数，对于符合项则直接删除并跳过该次循环
            const loop = (data,parentNode)=>{
                for(let idx in data){
                    if(data[idx].key === key){
                        data.splice(idx,1);
                        //若当前节点不为根节点且子节点最后一个节点已删除，则为该节点添加叶子节点属性
                        if(data.length === 0 && parentNode){
                            parentNode.isLeaf = true;
                        }
                        continue;
                    }
                    //对于未符合项，查找其子节点，将子节点数据以原始数据形式传入循环函数中
                    if(data[idx].children && data[idx].children.length){
                        loop(data[idx].children,data[idx]);
                    }
                }
            }
            loop(myData,null);
        }
        this.props.treeEditCallBack({type:'deleteNode',myData:Array.from(myData),targetKeys:[...selectedKeys]});
        //清空当前选中项
        selectedKeys = [];
        this.setState({selectedKeys,myData});
    }
    //重命名当前选中节点
    //添加输入框到当前节点位置，并为文本框添加焦点
    renameCurNode = ()=>{
        let {selectedKeys} = this.state;
        //暂不支持多选重命名，若存在多选将以第一个选中节点为重命名节点
        selectedKeys = [selectedKeys[0]];
        this.setState({selectedKeys});
        //获取选中节点在myData中的数据位置
        let curNode = this.loopCheck(selectedKeys[0]).curNode;
        //通过dom操作获取当前选中节点位置
        let elem = document.getElementsByClassName('ant-tree-node-selected')[0].getElementsByClassName('ant-tree-title')[0];
        //通过innerHTML的形式添加input文本框并为其添加焦点事件
        elem.innerHTML = `<input class='tempInput' value='${curNode.title}'/>`;
        //input元素默认获取焦点,并绑定相应事件，由于blur事件触发晚于keyenter，故触发按键后需要提前移除事件
        let tempInput = document.getElementsByClassName('tempInput')[0];
        tempInput.addEventListener('keydown',this.addKeyDownEvent,false);
        tempInput.addEventListener('blur',this.resetData,false);
        tempInput.focus();
        //默认全选内容
        tempInput.select();
    }
    //用于input元素添加与删除enter事件
    addKeyDownEvent = (e)=>{
        if(e && e.code === 'Enter'){
            let tempInput = document.getElementsByClassName('tempInput')[0];
            tempInput.removeEventListener('blur',this.resetData);
            this.resetData();
        }
    }
    //文本框失去焦点或按下enter后进行数据更新
    resetData = ()=>{
        let {myData,selectedKeys} = this.state;
        //树数据更新的必要步骤！！！
        myData = Array.from(myData);
        //获取当前编辑节点进行数据更新
        let curNode = this.loopCheck(selectedKeys[0]).curNode;
        let value = document.getElementsByClassName('tempInput')[0].value;
        if(value.trim().length === 0)value = '未命名节点';
        curNode.title = value;
        //删除文本框，并更新数据到myData（树数据）
        let elem = document.getElementsByClassName('ant-tree-node-selected')[0].getElementsByClassName('ant-tree-title')[0];
        //移除相应事件，包括失去焦点与按enter
        let tempInput = document.getElementsByClassName('tempInput')[0];
        tempInput.removeEventListener('keydown',this.addKeyDownEvent);
        tempInput.removeEventListener('blur',this.resetData);
        //将值赋为更新后的内容
        elem.innerHTML = curNode.title;
        this.setState({myData});
    }

    //组合当前所选节点（默认生成组与第一个选择节点为同一级目录）
    regroupNode = ()=>{
        let {selectedKeys} = this.state;
        let targetKeys = [...selectedKeys];
        let newNode = {
            title:'组',
            key:nanoid(),
            children:[],
        }
        //获取第一个选中项的父节点（此处可能存在严重bug）
        let parentNode = this.loopCheck(selectedKeys[selectedKeys.length-1]).parentNode;
        //使用链式函数使剪切函数完全执行完毕后再创建新节点
        new Promise(resolve => {
            resolve(this.clipCurNode());
        }).then(()=>{
            let {myData,copyNode,expandedKeys} = this.state;
            //树数据更新的必要步骤！！！
            myData = Array.from(myData);
            //遍历当前选中项为新节点的子节点
            for(let node of copyNode){
                newNode.children.push(node);
            }
            //同时设置粘贴板为空
            copyNode = [];
            //判断父节点的状态，若为空即为根目录，否则为节点下的子节点，需注意设置节点不为叶子节点
            if(parentNode){
                if(parentNode.children){
                    parentNode.children.unshift(newNode);
                }else{
                    parentNode.children = [newNode];
                }
                parentNode.isLeaf = false;
            }else{
                myData.unshift(newNode);
            } 
            selectedKeys = [newNode.key];
            expandedKeys.push(newNode.key);
            this.setState({myData,copyNode,selectedKeys,expandedKeys});
            this.props.treeEditCallBack({type:'reGroupNode',myData:Array.from(myData),targetKeys,parentKey:newNode.key,parentRouter:parentNode});
        })
        //原此处应使用finally调用重命名函数进行重命名，但无法触发focus，遂放弃
    }
    //递归遍历数据，获取所需数据节点
    loopCheck = (key)=>{
        const {myData} = this.state;
        let result = null;
        const loop = (data,parentNode)=>{
            if(result || !data)return ;
            for(let curNode of data){
                if(curNode.key === key){
                    result = {curNode,parentNode};
                    break;
                }else{
                    loop(curNode.children,curNode);
                }
            }
        }
        loop(myData);
        return result;
    }
    //数据添加函数
    addTreeData = (data)=>{
        let {myData} = this.state;
        myData = Array.from(myData);
        myData.push(data);
        this.setState({myData});
    }
    //选择赋值函数
    setSelectedData = (data)=>{
        let selectedKeys = data;
        this.setState({selectedKeys});
    }
    //获取所有数据
    getAllData = ()=>{
        return this.state.myData
    }
    //设置初始数据
    setInitialData = (data)=>{
        this.setState({myData:[].concat(data)});
    }
    render() {
        const { myData, treeEditOptions, oddEditOptions, rightClickPanelPosX, rightClickPanelPosY, rightClickPanelState, selectedKeys, expandedKeys } = this.state;
        return (
            <>
                <DirectoryTree defaultExpandedKeys={this.props.defaultExpandedKeys?this.props.defaultExpandedKeys:[]}  onSelect={this.onSelect} onExpand={this.onExpand} className="myTreePanel" selectedKeys={selectedKeys} expandedKeys={expandedKeys} multiple defaultExpandAll blockNode onRightClick={this.showTreeEdit} treeData={myData}>
                </DirectoryTree>
                <ul id="tree_edit" onBlur={this.closeTreeEdit} className="tree_edit" style={{ display: rightClickPanelState ? 'block' : 'none', left: rightClickPanelPosX, top: rightClickPanelPosY }}>
                    {treeEditOptions && treeEditOptions.map(item => {
                        return (
                            <Tooltip key={item.key} placement="right" title={item.info}>
                                <li className="tree_edit_option" onClick={()=>this.switchExecuteFn(item.onClickFn)}>
                                    <span>{item.title}</span>
                                    <span>{item.onPressKey}</span>
                                </li>
                            </Tooltip>
                        )
                    })}
                    <hr />
                    {oddEditOptions && oddEditOptions.map(item => {
                        return (
                            <Tooltip key={item.key} placement="right" title={item.info}>
                                <li className="tree_edit_option" onClick={()=>this.props.switchExecuteOddFn(item.onClickFn)}>
                                    <span>{item.title}</span>
                                    <span>{item.onPressKey}</span>
                                </li>
                            </Tooltip>
                        )
                    })}
                </ul>
            </>
        )
    }
}