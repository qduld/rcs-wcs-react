import React, { Component } from 'react';
import { connect, Dispatch, request } from 'umi';
import { Row, Col, Card, Table, Button, notification } from 'antd';
import AddUpdateModal from './components/addUpdateModal';
import { ModalState } from './data.d';
import styles from './style.less'
import moment from 'moment';
import { checkAgv } from './service';

interface AgvProps {
    loading: boolean;
    dispatch: Dispatch;
}

const initAgv: ModalState = {
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
    agvChargeTimeScope: [],
    agvSpeed: 0, //初始速度
    agvSpeedList: [], //初始速度
    timeListCache: []
}

class AgvMgt extends Component<AgvProps> {
    state = {
        agvMgtData: [],
        selectedRowKeys: [],
        selectedRows: [],
        rowData: initAgv,
        type: 'add',
        modalVia: false,
        allCode: [],
        timeListCache: [],
        agvChargeTimeScope: []
    }

    agvMgtCol = [
        {
            title: '名称',
            dataIndex: 'agvId',
            render: (text: any, record: any, index: number) => <span key={index + text}>{text.toUpperCase()}</span>,
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
            render: (chargeBL: any, record: any, index: number) => {
                if (chargeBL === "Y") {
                    return <span key={index}>是</span>
                } else {
                    return <span key={index}>否</span>
                }
            },
            width: 100
        },
        {
            title: '自动返回待命',
            dataIndex: 'orderWaitEnable',
            render: (chargeBL: any, record: any, index: number) => {
                if (chargeBL === "Y") {
                    return <span key={index}>是</span>
                } else {
                    return <span key={index}>否</span>
                }
            },
            width: 120
        },
        {
            title: '可用状态',
            dataIndex: 'agvStatus',
            render: (chargeBL: any, record: any, index: number) => {
                if (chargeBL === "Y") {
                    return <span key={index}>是</span>
                } else {
                    return <span key={index}>否</span>
                }
            },
            width: 100
        },
        {
            title: '激活状态',
            dataIndex: 'agvEnable',
            render: (chargeBL: any, record: any, index: number) => {
                if (chargeBL === "Y") {
                    return <span key={index}>是</span>
                } else {
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
            ellipsis: true,
            width: 300
        },
        {
            title: '车辆权限范围',
            dataIndex: 'permissionLabel',
            ellipsis: true,
            width: 300
        },
        {
            title: '操作',
            dataIndex: 'options',
            width: 100,
            fixed: 'right',
            render: (text: any, record: any) => {
                return (
                    <span className="row-options">
                        <i className="icon-options ion-md-create" title="编辑" onClick={(event) => { this.rowEdit(event, record) }}></i>
                        <i className="icon-options ion-md-checkbox-outline" title="检测" onClick={(event) => { this.deviceCheck(event, record) }}></i>
                    </span>
                )
            }
        }
    ]

    constructor(props: AgvProps) {
        super(props);
        this.getAllAgv = this.getAllAgv.bind(this);
        this.orgAgvMgtData = this.orgAgvMgtData.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    componentDidMount() {
        this.getAllAgv();
        this.getAllAction();
    }
    getAllAgv() {
        const { dispatch } = this.props;
        if (dispatch) {
            dispatch({
                type: 'agvMgt/fetchAllAgv',
                callback: (agvList: any) => {
                    this.setState({
                        agvMgtData: this.orgAgvMgtData(agvList)
                    })
                }
            })
        }
    }

    getAllAction() {
        const { dispatch } = this.props;
        if (dispatch) {
            dispatch({
                type: 'agvMgt/fetchAllAction',
                callback: (codeList: any) => {
                    this.setState({
                        allCode: this.orgAllCode(codeList)
                    })
                }
            })
        }
    }

    orgAgvMgtData(agvData: any) {
        let dataCache = agvData.map((agvItem: any) => {
            if (agvItem.permissionCode) {
                let codeList = agvItem.permissionCode.split(',')
                let permissionLabel = ''
                codeList.forEach((codeItem: any, codeIdx: any) => {
                    // let actionIdx = actionData.findIndex((actionItem:any)=>{return actionItem.action.code1 == codeItem})
                    // if(actionIdx!=-1){
                    if (codeIdx == codeList.length - 1) {
                        permissionLabel += codeItem
                    } else {
                        permissionLabel += codeItem + ','
                    }
                    // }
                })
                agvItem.permissionCodeList = codeList
                agvItem.permissionLabel = permissionLabel
            }
            agvItem.key = agvItem.agvId
            return agvItem
        })
        dataCache.sort((item1: any, item2: any) => {
            return Number(item1.agvId.replace(/[^0-9]/ig, "")) - Number(item2.agvId.replace(/[^0-9]/ig, ""))
        })
        return dataCache
    }

    orgAllCode = (codeList: any) => {
        let filterPort = ['port_work', 'port_order_wait', 'port_charge']
        let filterArr = []
        let codeArr = []
        filterArr = codeList.filter((item: any) => {
            return filterPort.indexOf(item.action.portType) != -1
        })
        codeArr = filterArr.map((item: any) => {
            let codeObj = { code: '', type: '' }
            switch (item.action.portType) {
                case 'port_work': codeObj.type = '工位'; break;
                case 'port_charge': codeObj.type = '充电桩'; break;
                case 'port_order_wait': codeObj.type = '待命位'; break;
            }

            if (item.action.code2) {
                codeObj.code = item.action.code2
            } else if (item.action.code1) {
                codeObj.code = item.action.code1
            } else if (item.action.code) {
                codeObj.code = item.action.code
            }
            return codeObj
        })
        return Array.from(new Set(codeArr))
    }

    newRowData = () => {
        this.setState({
            modalVia: true,
            type: 'add',
            rowData: JSON.parse(JSON.stringify(initAgv))
        })
    }

    digitsTwo = (data: any) => {
        let dataCache = data + ''
        let dataList = dataCache.split('.')
        if (dataList[1] && dataList[1].length < 2) {
            return Number(Number(dataCache).toFixed(2))
        } else {
            return Number(data)
        }
    }

    handleSave = (values: ModalState, agvChargeTimeScope: any) => {
        const that = this;
        const { dispatch } = this.props;
        const { type } = this.state;
        let fetchType = 'agvMgt/fetchInsertAgv'
        let message = '新增'
        let reqData = JSON.parse(JSON.stringify(values))
        for (let key in reqData) {
            if (reqData[key] === true) {
                reqData[key] = 'Y'
            } else if (reqData[key] === false) {
                reqData[key] = 'N'
            }
            reqData.agvId = reqData.agvId.toLowerCase()
            reqData.agvName = reqData.agvId
            reqData.agvVoltageFull = this.digitsTwo(reqData.agvVoltageFull)
            reqData.agvVoltageLow = this.digitsTwo(reqData.agvVoltageLow)
            reqData.agvVoltageWork = this.digitsTwo(reqData.agvVoltageWork)
            if (reqData.permissionCodeList.length > 0) {
                reqData.permissionCode = reqData.permissionCodeList.join(',')
            }
        }
        // 处理充电策略的部分
        reqData.agvChargeTimeScope = ''
        agvChargeTimeScope.forEach(item => {
            let temporary = item.value + ','
            reqData.agvChargeTimeScope += temporary
        });
        if (type === 'add') {
            fetchType = 'agvMgt/fetchInsertAgv'
            message = '新增'
            reqData.agvStatus = 'Y'
        } else {
            fetchType = 'agvMgt/fetchUpdateAgv'
            message = '修改'
        }
        dispatch({
            type: fetchType,
            payload: reqData,
            callback: (resp: any) => {
                that.handleBack(resp, message)
                that.getAllAgv();
                this.setState({ modalVia: false })
            }
        })
    }

    handleDelete = () => {
        const that = this;
        const { dispatch } = this.props;
        if (this.state.selectedRows.length == 0) {
            notification.info({
                description: '请选择一行数据',
                message: '无法删除',
            });
        } else {
            dispatch({
                type: 'agvMgt/fetchDeleteAgv',
                payload: this.state.selectedRows.map((item: any) => item.agvId),
                callback: (resp: any) => {
                    that.handleBack(resp, '删除')
                    this.setState({ selectedRows: [], selectedRowKeys: [] })
                    that.getAllAgv();
                }
            })
        }
    }

    handleBack = (resp: any, message: string) => {
        if (resp.resultCode && resp.resultCode == 200) {
            notification.success({
                description: resp.resultMsg,
                message: message + '成功',
            });
        } else {
            notification.warning({
                description: resp.resultMsg,
                message: message + '失败',
            });
        }
    }

    handleCancel = () => {
        this.setState({
            modalVia: false,
            rowData: {}
        })
    }

    rowEdit = (event: any, row: any) => {
        event.stopPropagation();
        let rowCache = JSON.parse(JSON.stringify(row))
        let timeArr = []
        let timeStr = rowCache.agvChargeTimeScope.split(",")
        let timeObj = {}
        timeStr.forEach(element => {
            if (element) {
                timeObj['value'] = element
                timeArr.push(timeObj)
            }
        });
        rowCache.agvChargeTimeScope = timeArr
        this.state.agvChargeTimeScope = timeArr
        console.log(rowCache, '充电时间')
        for (let key in rowCache) {
            if (rowCache[key] === 'Y') {
                rowCache[key] = true
            } else if (rowCache[key] === 'N') {
                rowCache[key] = false
            }
        }
        this.setState({
            modalVia: true,
            type: 'update',
            rowData: rowCache
        })
    }

    deviceCheck = (event: any, row: any) => {
        event.stopPropagation();
        console.log(row)
        // 检测位置
        async function getCheckAgv() {
            let data = await checkAgv(row)
            console.log(data)
        }
        getCheckAgv()
    }

    render() {
        let { agvMgtData, modalVia, rowData, allCode } = this.state
        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            fixed: true,
            selections: [
                Table.SELECTION_ALL,
                Table.SELECTION_INVERT,
            ],
            preserveSelectedRowKeys: true,
            onChange: (selectedRowKeys: any, selectedRows: any) => {
                this.setState({ selectedRowKeys, selectedRows });
            }
        };

        const rowClick = (record: any) => {
            return {
                onClick: (event: any) => { }
            }
        }

        return (
            <Row className={styles.agvMgt}>
                <Col xl={24} lg={24} md={24} sm={24} xs={24}>
                    <Card className={styles.agvMgtCard}>
                        <Row className={styles.btnOption}>
                            <Col>
                                <Button type="primary"
                                    size="large"
                                    onClick={this.newRowData}>新增</Button>
                            </Col>
                            <Col>
                                <Button type="primary"
                                    size="large"
                                    className={styles.delBtn}
                                    onClick={this.handleDelete}>删除</Button>
                            </Col>
                        </Row>
                        <Table
                            // rowKey={record => record.id}
                            onRow={rowClick}
                            rowSelection={rowSelection}
                            bordered={true}
                            columns={this.agvMgtCol as any}
                            dataSource={agvMgtData}
                        />
                    </Card>
                </Col>
                <AddUpdateModal
                    visible={modalVia}
                    modalForm={rowData}
                    codeList={allCode}
                    onSubmit={this.handleSave}
                    onCancel={this.handleCancel}
                    timeList={this.state.agvChargeTimeScope}
                />
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
    }) => ({
        loading: loading.effects['agvMgt/fetchRcsMap'],
    }),
)(AgvMgt);

