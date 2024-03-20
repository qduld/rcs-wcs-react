import React, { Component } from 'react';
import { connect, Dispatch } from 'umi';
import { Row , Col , Card , Table , notification } from 'antd';
import SearchCondition from './components/searchCondition';
import styles from './style.less'
import { formatDate } from '@/utils/utils'

interface RcsProps {
  loading: boolean;
  dispatch: Dispatch;
}

class AbnormalInfo extends Component<RcsProps> {
    state={ 
        abnormalData:[],
        abnormalDataCache:[],
        typeList:[],
        filterType:'all',
    }
    
    abnormalCol = [
        {
            title: '序号',
            dataIndex: 'index',
            ellipsis:true,
            render: (text:any,record:any,index:number) => {
                return <span key={index}>{index+1}</span>
            }
        },
        {
            title: '故障设备',
            dataIndex: 'deviceName',
            ellipsis:true,
            render: (text:any,record:any,index:number) => {
                return <span key={text+index}>{((text?text:record.deviceNo)+'').toUpperCase()}</span>
            }
        },
        {
            title: '故障类型',
            dataIndex: 'breakdownType',
            ellipsis:true,
        },
        {
            title: '故障时间',
            dataIndex: 'breakdownTime',
            ellipsis:true,
            render: (text:any,record:any,index:number) => {
                return <span key={text+index}>{formatDate(text)}</span>
            }
        },
        {
            title: '当前任务',
            dataIndex: 'nowMission',
            ellipsis:true,
        },
        // {
        //     title: '异常描述',
        //     dataIndex: 'remark',
        //     ellipsis:true,
        // }
    ]

    constructor(props:RcsProps) {
        super(props);
    }

    componentDidMount() {
        this.getRcsErrorType();
        this.getAllAbnormal();
    }

    getRcsErrorType=()=>{
        const {dispatch} = this.props;
        dispatch({
            type: 'abnormalInfo/getRcsErrorType',
            callback: (resp:any) => {
                if(resp){
                    this.setState({
                        typeList:this.orgAbnormalType(resp)
                    })
                }
            }
        });
    }

    getAllAbnormal(){
        const { dispatch } = this.props;
        if(dispatch){
            dispatch({
                type: 'abnormalInfo/fetchAllAbnormal',
                callback: (resp:any) => {
                    if(resp){
                        let abnormalDataBack = resp.map((item:any)=>{item.key=item.id;return item})
                        this.setState({
                            abnormalData:abnormalDataBack,
                            abnormalDataCache:abnormalDataBack,
                        })
                    }
                }
            })
       }
    }

    orgAbnormalType(data:any){
        let typeArr = [] as Array<object>
        let errFilter = data.filter((item:any)=>{
            return item.keyword === "rcs_err" && item.ddlCode >2            //ddlCode 任务被占用不属于异常
        })
        if(errFilter && errFilter.length>0){
            errFilter.forEach((item:any)=>{
                typeArr.push({value:item.keyword+','+item.ddlCode,label:item.ddlName})
            })
        }
        return typeArr
    }

    changeFilterType=(backSel:any)=>{
        const { typeList , abnormalData } = this.state
        if(backSel == 'all'){
            this.setState({
                filterType:"all",
                abnormalDataCache: JSON.parse(JSON.stringify(abnormalData))
            })
        }else{
            let filterObj = typeList.find((item:any)=>{return item.value == backSel})
            let filterData = [] as any
            if(filterObj){
                filterData = abnormalData.filter((item:any)=>{return item.breakdownType == filterObj.label})
            }
                this.setState({
                    filterType:backSel,
                    abnormalDataCache: filterData
                })
        }
    }

    render() {
        let { abnormalDataCache , typeList , filterType } = this.state
        
        return (
                <Row className={styles.abnormalMgt}>
                    <Col xl={24} lg={24} md={24} sm={24} xs={24}>
                        <Card className={styles.abnormalMgtCard}>
                            <Row className={styles.btnOption}>
                                <SearchCondition
                                    abnormalType={typeList}
                                    changeFilterType={this.changeFilterType}
                                    filterType={filterType}
                                />
                            </Row>
                            <Table
                                rowKey={''+Math.random()}
                                bordered={true}
                                columns={this.abnormalCol}
                                dataSource={abnormalDataCache}
                                />
                        </Card>
                    </Col>
                </Row>
        );
    }
}; 

export default connect(
  ({
    loading,
  }: {
    loading: {
      effects: { [key: string]: boolean };
    };
  }) => ({}),
)(AbnormalInfo);

