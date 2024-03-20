import React,{useState,useEffect} from 'react'
import UMR from './utils/umiRequest'
import { connect, Dispatch } from 'umi';
import { Row , Col , Icon , Card, Button , Input , Table , notification } from 'antd';
import {DeleteOutlined,EditOutlined} from '@ant-design/icons'
import styles from './styles/index.less';
import AddUpdateModal from './components/addUpdateModal';
import { formatDate } from '@/utils/utils'

/* 
seek update
*/ 
function consoleTimeout(...rest){
    return setTimeout(()=>{console.log(...rest)},500)
}
const rowFormData={
    id:'',
    username:'',              //用户名
    password:'',
    sex:'',
    age:'',
    tel:'',
    address:'',
    roleId:'',
    roleName:'',
    idCard:'',
    userRole:'',              //用户角色
}
const startingValues={
    id:'',
    username:'', 
    password:'',
    sex:'',
    age:'',
    tel:'',
    address:'',
    roleId:'',
    roleName:'',
    idCard:'',
    userRole:'', 
}
class UserMgtIndex extends React.Component {
    constructor(props){
        super(props)

        this.rowEdit=this.rowEdit.bind(this)
        this.getAllRole=this.getAllRole.bind(this)
        this.getAllUser=this.getAllUser.bind(this)
        this.handleSeek=this.handleSeek.bind(this)
        this.handleSave=this.handleSave.bind(this)
        this.handleBack=this.handleBack.bind(this)
        this.handleCancel=this.handleCancel.bind(this)
        this.handleDelete = this.handleDelete.bind(this);
        this.handleSetRowData = this.handleSetRowData.bind(this);
    }
    state={
        userMgtData:[],
        roleData:[],
        selectedRowKeys:[],
        selectedRows:[],
        rowData:rowFormData,  // 单行数据
        type:'add',
        modalVia:false,
        allCode:[],
        startingValues:startingValues
    }
    userCol = [
        {
            title: '用户名称',
            dataIndex: 'username',
            ellipsis:true,
            width: 100,
        },
        {
            title: '性别',
            dataIndex: 'sex',
            ellipsis:true,
            width: 100,
            render(v,row){
                return (<><span>{row.sex=='1'?'男':'女'}</span></>)
            }
        },
        {
            title: '年龄',
            dataIndex: 'age',
            ellipsis:true,
            width: 100,
        },
        {
            title: '用户角色',
            dataIndex: 'roleName',
            ellipsis:true,
            width: 100,
        },
        {
            title: '联系电话',
            dataIndex: 'tel',
            ellipsis:true,
            width: 200,
        },
        {
            title: '住址',
            dataIndex: 'address',
            ellipsis:true,
        },
        {
            title: '身份证号',
            dataIndex: 'idCard',
            ellipsis:true,
            width: 200,
        },
        {
            title: '操作',
            ellipsis:true,
            render: (text,record,index) => {
                return (
                    <span className="row-options" >
                        <Button type='primary' onClick={(event)=>{this.rowEdit(event,record,this)}}>
                        <EditOutlined />
                        编辑
                        </Button>
                        <Button type='danger' 
                                onClick={({nativeEvent:e})=>{this.handleDelete(e,record)}}
                        >
                            <DeleteOutlined />
                            删除</Button>
                    </span>
                )
            }
        }
    ]
    componentDidMount() {
        this.getAllUser()
        this.getAllRole()
    }
    getAllUser(){
        const { dispatch } = this.props;
        if(dispatch){
            dispatch({
                type: 'userMgt/fetchAllUser',
                callback: (res) => {
                    let userList=[]
                    if(res.status&&res.status!==200){
                        
                        console.log(res.status + ' ' + res.statusText)
                    }else{
                        if(res.length>=0){
                            userList=res instanceof Object?res: JSON.parse(res)
                        }
                    }
                    this.setState({
                        userMgtData : userList
                    })
                }
            })
       }
    }
    getAllRole(){
        const { dispatch } = this.props;
        if(dispatch){
            dispatch({
                type: 'userMgt/fetchAllRole',
                callback: (res) => {
                    let roleList=[]
                    if(res.status&&res.status!==200){
                        console.log(res.status + ' ' + res.statusText)
                        return
                    }else{
                        roleList=res
                    }
                    this.setState({
                        roleData : roleList
                    })
                }
            })
       }
    }
    handleSave = (values)=>{
        console.log('模态框数据',values)
        const that = this;
        const { dispatch } = this.props;
        const { type } = this.state;
        let fetchType = 'userMgt/fetchSaveUser'
        let message = '新增'
        let reqData = JSON.parse(JSON.stringify(values))

        if( type==='add' ){
            fetchType = 'userMgt/fetchSaveUser'
            message = '新增'
        }else{
            fetchType = 'userMgt/fetchUpdateUser'
            message = '修改'
            if(!reqData.id){
                return;
            }
        }
        if(reqData.age){
            reqData.age=reqData.age-0
        }
        if(reqData.sex.trim()){
            reqData.sex=reqData.sex=='男'?1:0
        }
        
        console.log('rid',reqData)
        dispatch({
            type: fetchType,
            payload:reqData,
            callback: (resu) => {
                that.handleBack(resu,message)

                that.getAllUser();
                that.setState({modalVia: false}) 
            }
        })
    }
    handleSeek = (userIdentify)=>{
        let msg='查找'
        if(!userIdentify.trim()){
            
            notification.warning({
                description: "空查询将重置页面",
                message: msg + '重置',
            })
            this.getAllUser()
            return
        }
        const _this=this;
        const { dispatch } = this.props;
        if(!userIdentify){
            console.log('未得其名')
            return;
        }
        
        // const formData = new FormData();
        // formData.append('id',userIdentify-0)
        // Object.keys(_payObj).forEach((key) => {
        //     formData.append(key, _payObj[key]);
        // });
        dispatch({
            type:'userMgt/fetchUserInfoById',
            payload:{id:userIdentify-0},
            callback:(resu)=>{
                console.log('seek',resu)
                let res=JSON.parse(resu)
                if(res.status&&res.status!==200){
                    notification.warning({
                        description: res.status,
                        message: msg + '出错',
                    })
                }else{
                    let parseRes=JSON.parse(JSON.stringify(res))
                    notification.success({
                        description: 200,
                        message: msg + '成功',
                    })
                    let arrRes=[parseRes]
                    _this.setState(()=>{return {userMgtData:arrRes}})
                    consoleTimeout('搜索',_this.state.userMgtData)
                }
            }
        })

    }
    handleDelete = (e,row)=>{
        const that = this;
        let rowId=null;
        const {dispatch} = this.props;
        if(e&&row){
            e.stopPropagation()
            e.preventDefault()
            rowId=row.id
        }
        dispatch({
            type: 'userMgt/fetchDeleteUser',
            payload:{id:rowId},
            callback: (resu) => {
                that.handleBack(resu,'删除')
                this.setState({selectedRows:[],selectedRowKeys:[]})
                that.getAllUser();
            }
        })
    }
    handleBack = (res,message)=>{
        if(res.resultCode && res.resultCode==200){
            notification.success({
                description: res.resultMsg,
                message: message + '成功',
            });
        }else{
            notification.warning({
                description: res.resultMsg,
                message: message + '失败',
            });
        }
    }
    handleSetRowData(event,values,keyName){
        let rd=JSON.parse(JSON.stringify(this.state.rowData))
        if(values){
            for(let x in values){
                if(rd.hasOwnProperty(x)){
                    rd[x]=values[x]
                }
            }
            this.setState(()=>{
                return {
                rowData:{...rd}
            }})
        }else if(event&&event.target&&event.target.value&&keyName){
            console.log(keyName,event.target.value)
            rd[keyName]=event.target.value
            this.setState({
                rowData:{...rd}
            })
        }
        
    }
    rowEdit = (event,row,caller)=>{
        console.log(row)
        let rc = JSON.parse(JSON.stringify(row))
        if(rc.hasOwnProperty('sex')){
            rc.sex=rc.sex=='1'?'男':'女'
        }
        this.setState({
            modalVia: true,
            type:'update',
            startingValues:rc,
            rowData:rc
        },()=>{
            console.log(this.state.rowData)
        })
    }
    newRowData = ()=>{
        this.setState({
            modalVia: true,
            type:'add',
            rowData: JSON.parse(JSON.stringify(rowFormData))
        }) 
    }
    handleCancel = ()=>{
        this.setState({
            modalVia: false,
            rowData:{},
            startingValues:{}
        }) 
    }
    render(){ 
        let { userMgtData , modalVia , rowData , allCode } = this.state
        const rowSelection = {
            selectedRowKeys:this.state.selectedRowKeys,
            fixed:true,
            selections: [
                Table.SELECTION_ALL,
                Table.SELECTION_INVERT,
            ],
            preserveSelectedRowKeys:true,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({ selectedRowKeys:[...selectedRowKeys],selectedRows:[...selectedRows] });
            }
        };
        const rowClick = (record)=>{
            return {
                onClick:(event)=>{}
            }
        }
        return (
            <Row className={styles.abnormalMgt}>
                <Col xl={24} lg={24} md={24} sm={24} xs={24}>
                    <Card className={styles.abnormalMgtCard}>
                        <Row className={styles.btnOption}>
                            <Col>
                                <Button type="primary" 
                                    size="large" 
                                    onClick={this.newRowData}
                                >新增</Button>
                            </Col>
                            <Col>
                                <Input.Search  placeholder='请输入要查询人员ID'  
                                    onSearch={(v)=>{this.handleSeek(v)}}
                                    className={styles.seek}
                                    size='large'
                                />
                            </Col>
                        </Row>
                        <Table
                        rowKey={''+Math.random()}
                            onRow={rowClick}
                            rowSelection={rowSelection}
                            bordered={true}
                            columns={this.userCol}
                            dataSource={this.state.userMgtData?this.state.userMgtData:[]}
                        />
                    </Card>
                </Col>
                <AddUpdateModal
                    visible={modalVia}
                    modalForm={this.state.rowData}
                    roleList={this.state.roleData}
                    onSetting={this.handleSetRowData}
                    onSubmit={this.handleSave}
                    onCancel={this.handleCancel}
                    initValues={this.state.startingValues}
                />
            </Row>
        )
    }
}
export default connect(
    ({
      loading,
    }) => {},
  )(UserMgtIndex);
