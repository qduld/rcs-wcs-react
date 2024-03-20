import request from 'umi-request'

class UmiRequest {
    constructor(baseUrl){
        this.baseUrl=baseUrl
        
    }
    baseRequest(url,method,data,callback){
        let _this=this
        return request[method](_this.baseUrl+url,{
            [method==='get'?'params':'data']:{
                ...data
            }
        }).then(res=>{callback(res)}).catch(err=>err)
    }
    get(url,data,callback){
        if(arguments.length==2){
            callback=data
            data={}
        }
        return this.baseRequest(url,'get',data,callback)
    }
    post(url,data,callback){
        return this.baseRequest(url,'post',data,callback)
    }
}


export default UmiRequest