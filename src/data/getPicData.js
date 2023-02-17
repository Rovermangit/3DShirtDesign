//获取图片数据，进行重新编码处理
let fs = require("fs");
let fileList = fs.readdirSync("./src/pic/ModelPanel/picForChange");
let data = [];
for(let idx in fileList){
    data.push({src:'picForChange/'+fileList[idx],title:'形状'+(+idx+1),hoverIfo:'形状'+(+idx+1),userType:0,value:'picForChange/'+fileList[idx]})
}
//将生成数据写入到根目录output.txt文件中
fs.writeFile("output.txt",JSON.stringify(data),'utf-8',function(err){
    console.log(err);
})
