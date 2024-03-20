import React,{useState,useEffect} from 'react'
import { connect, Dispatch } from 'umi';
import { Row , Col , Card, Button , Table , notification } from 'antd';
import styles from './styles/index.less';
import AddUpdateModal from './components/addUpdateModal';


const privateObjcet={
    agvId: '',
    agvIp: '',
    agvVoltageFull: null,          //最高电压
    agvVoltageLow: null,           //最低电压
    agvVoltageWork: null,          //工作电压
    agvEnable: 'Y',             //是否激活
    agvStatus: 'Y',             //是否可用
    chargeEnable: 'Y',            //是否可充电
    orderWaitEnable: 'Y',         //自动返回待命
    permissionCode: '',           //权限码
    permissionCodeList: [],
    agvChargeTimeScope: ''
}

class ChargeMgt extends React.Component {
    constructor(props){
        super(props)
        this.handleDelete = this.handleDelete.bind(this);
        this.getAllUser=this.getAllUser.bind(this)
    }
    state={
        agvMgtData:[],
        selectedRowKeys:[],
        selectedRows:[],
        rowData:privateObjcet,
        type:'add',
        modalVia:false,
        allCode:[]
    }
    abnormalCol = [
        {
            title: '名称',
            dataIndex: 'agvId',
            render: (text,record, index) => <span key={index+text}>{text.toUpperCase()}</span>,
            width: 100,
            
        },
        {
            title: '车辆IP',
            dataIndex: 'agvIp',
            width: 100,
        },
        {
            title: '自动充电',
            dataIndex: 'chargeEnable',
            render: (chargeBL,record, index) => {
                if(chargeBL==="Y"){
                    return <span key={index}>是</span>
                }else{
                    return <span key={index}>否</span>
                } 
            },
            width: 100
        },
        {
            title: '自动返回待命',
            dataIndex: 'orderWaitEnable',
            render: (chargeBL,record, index) => {
                if(chargeBL==="Y"){
                    return <span key={index}>是</span>
                }else{
                    return <span key={index}>否</span>
                } 
            },
            width:120
        },
        {
            title: '可用状态',
            dataIndex: 'agvStatus',
            render: (chargeBL,record, index) => {
                if(chargeBL==="Y"){
                    return <span key={index}>是</span>
                }else{
                    return <span key={index}>否</span>
                } 
            },
            width: 100
        },
        {
            title: '激活状态',
            dataIndex: 'agvEnable',
            render: (chargeBL,record, index) => {
                if(chargeBL==="Y"){
                    return <span key={index}>是</span>
                }else{
                    return <span key={index}>否</span>
                } 
            },
            width: 100
        },
        {
            title: '最高电压',
            dataIndex: 'agvVoltageFull',
            width: 100
        },
        {
            title: '最低电压',
            dataIndex: 'agvVoltageLow',
            width: 100
        },
        {
            title: '工作电压',
            dataIndex: 'agvVoltageWork',
            width: 100
        },  
        {
            title: '充电策略',
            dataIndex: 'agvChargeTimeScope',
            ellipsis:true,
            width:300
        },
        {
            title: '操作',
            ellipsis:true,
            fixed: 'right',
            render: (text,record,index) => {
                return (
                    <span className="row-options" >
                        <Button type='primary' onClick={(event)=>{this.rowEdit(event,record)}}>
                        <i className="icon-options ion-md-create" title="编辑" ></i>
                        编辑
                        </Button>
                    </span>
                )
            }
        }
    ]

    componentDidMount() {
        
    }

    getAllUser(){
        const { dispatch } = this.props;
        if(dispatch){
            dispatch({
                type: 'userMgt/fetchAllUser',
                callback: (res) => {
                    let userList=[]
                    if(res.status!==200){
                        console.log(res.status + ' ' + res.statusText)
                    }else{
                        userList=res
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
                callback: (roleList) => {
                    this.setState({
                        roleData : roleList
                    })
                }
            })
       }
    }
    handleSave = (values)=>{
        const that = this;
        const { dispatch } = this.props;
        const { type } = this.state;
        let fetchType = 'userMgt/fetchInsertUser'
        let message = '新增'
        let reqData = JSON.parse(JSON.stringify(values))
        for(let key in reqData){
            if(reqData[key]===true){
                reqData[key] = 'Y' 
            }else if(reqData[key]===false){
                reqData[key] = 'N'
            } 
            reqData.userId = reqData.userId.toLowerCase()
            reqData.agvName = reqData.userId
                  
        }
        if( type==='add' ){
            fetchType = 'userMgt/fetchsaveUser'
            message = '新增'
        }else{
            fetchType = 'userMgt/fetchsaveUser'
            message = '修改'
        }
        dispatch({
            type: fetchType,
            payload:reqData,
            callback: (resp) => {
                that.handleBack(resp,message)

                that.getAllAgv();
                this.setState({modalVia: false}) 
            }
        })
    }

    handleDelete = ()=>{
        const that = this;
        const {dispatch} = this.props;
        if(!this.state.selectedRows){
            return;
        }
        if(this.state.selectedRows.length==0){
            notification.info({
                description: '请选择一行数据',
                message: '无法删除',
            }); 
        }else{
            dispatch({
                type: 'userMgt/fetchDeleteUser',
                payload:this.state.selectedRows.map((item)=>item.userId),
                callback: (resp) => {
                    that.handleBack(resp,'删除')

                    this.setState({selectedRows:[],selectedRowKeys:[]})
                    that.getAllAgv();
                }
            })
        }
    }

    handleBack = (resp,message)=>{
        if(resp.resultCode && resp.resultCode==200){
            notification.success({
                description: resp.resultMsg,
                message: message + '成功',
            });
        }else{
            notification.warning({
                description: resp.resultMsg,
                message: message + '失败',
            });
        }
    }

    handleCancel = ()=>{
        console.log('close')
        setTimeout(()=>{console.log(this.state.rowData)},10)
        this.setState({
            modalVia: false,
            rowData:{}
        }) 
    }

    rowEdit = (event,row)=>{
        event.stopPropagation(); 
        let rowCache = JSON.parse(JSON.stringify(row))
        for(let key in rowCache){
            if(rowCache[key]==='Y'){
                rowCache[key] = true 
            }else if(rowCache[key]==='N'){
                rowCache[key] = false 
            } 
        }
        this.setState({
            modalVia: true,
            type:'update',
            rowData: rowCache
        }) 
    }
    newRowData = ()=>{
        this.setState({
            modalVia: true,
            type:'add',
            rowData: JSON.parse(JSON.stringify(privateObjcet))
        }) 
    }
    deviceCheck = (event,row)=>{
        event.stopPropagation();
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
                this.setState({ selectedRowKeys,selectedRows });
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
                                <Button type="primary" 
                                    size="large" 
                                    className={styles.delBtn}
                                    onClick={this.handleDelete}
                                >删除</Button>
                            </Col>
                        </Row>
                        <Table
                            rowKey={''+Math.random()}
                            onRow={rowClick}
                            rowSelection={rowSelection}
                            bordered={true}
                            scroll={{ x: 1300 }}
                            columns={this.abnormalCol}
                            dataSource={this.state.userMgtData?this.state.userMgtData:[]}
                        />
                    </Card>
                </Col>
                <AddUpdateModal
                    visible={modalVia}
                    modalForm={rowData}
                    // roleList={this.state.roleData}
                    onSubmit={this.handleSave}
                    onCancel={this.handleCancel}
                />
            </Row>
        )
    }
}
export default connect(
    ({
      loading,
    }) => {},
  )(ChargeMgt);
