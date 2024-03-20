import React, { Component } from 'react';
import { connect, Dispatch } from 'umi';
import { Row, Col, Card, Table, Button, notification } from 'antd';
import AddUpdateModal from './components/addUpdateModal';
import { VoiceState } from './data.d';
import styles from './style.less'

interface VoiceProps {
    loading: boolean;
    dispatch: Dispatch;
}

const initVoice: VoiceState = {
    id: 0,
    deviceName: "",
    ip: "",
    port: null,
    agvId: ''
}

class voiceMgt extends Component<VoiceProps> {
    state = {
        voiceMgtData: [],
        agvMgtData: [],
        selectedRowKeys: [],
        selectedRows: [],
        rowData: initVoice,
        type: 'add',
        modalVia: false
    }

    voiceMgtCol = [
        {
            title: '设备名称',
            dataIndex: 'deviceName'
        },
        {
            title: 'IP',
            dataIndex: 'ip',
        },
        {
            title: '端口',
            dataIndex: 'port'
        },
        {
            title: '车辆Id',
            dataIndex: 'agvId'
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

    constructor(props: VoiceProps) {
        super(props);
        this.getAllVoice = this.getAllVoice.bind(this);
    }

    componentDidMount() {
        this.getAllVoice();
        this.getAllAgv();
    }

    getAllVoice() {
        const { dispatch } = this.props;
        if (dispatch) {
            dispatch({
                type: 'voiceMgt/fetchAllVoice',
                callback: (resp: any) => {
                    let dataCache = resp.map((item: any) => {
                        item.key = item.id
                        return item
                    })
                    dataCache.sort((item1: any, item2: any) => {
                        return Number(item1.id) - Number(item2.id)
                    })
                    this.setState({
                        voiceMgtData: dataCache
                    })
                }
            })
        }
    }

    getAllAgv() {
        const { dispatch } = this.props;
        if (dispatch) {
            dispatch({
                type: 'agvMgt/fetchAllAgv',
                callback: (agvList: any) => {
                    this.setState({
                        agvMgtData: agvList
                    })
                }
            })
        }
    }

    newRowData = () => {
        this.setState({
            modalVia: true,
            type: 'add',
            rowData: JSON.parse(JSON.stringify(initVoice))
        })
    }

    handleSave = (values: VoiceState) => {
        const that = this;
        const { dispatch } = this.props;
        const { type } = this.state;
        let fetchType = 'voiceMgt/fetchInsertVoice'
        let message = '新增'
        if (type === 'add') {
            fetchType = 'voiceMgt/fetchInsertVoice'
            message = '新增'
        } else {
            fetchType = 'voiceMgt/fetchUpdateVoice'
            message = '修改'
        }
        let reqData = JSON.parse(JSON.stringify(values))
        dispatch({
            type: fetchType,
            payload: reqData,
            callback: (resp: any) => {
                that.handleBack(resp, message)

                that.getAllVoice();
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
                type: 'voiceMgt/fetchDeleteVoice',
                payload: this.state.selectedRows.map((item: any) => item.id),
                callback: (resp: any) => {
                    that.handleBack(resp, '删除')

                    this.setState({ selectedRows: [], selectedRowKeys: [] })
                    that.getAllVoice();
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
        this.setState({
            modalVia: true,
            type: 'update',
            rowData: row
        })
    }

    deviceCheck = (event: any, row: any) => {
        event.stopPropagation();
    }

    render() {
        let { voiceMgtData, modalVia, rowData, agvMgtData } = this.state
        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            selections: [
                Table.SELECTION_ALL,
                Table.SELECTION_INVERT,
            ],
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
            <Row className={styles.voiceMgt}>
                <Col xl={24} lg={24} md={24} sm={24} xs={24}>
                    <Card className={styles.voiceMgtCard}>
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
                            rowKey={record => record.id}
                            onRow={rowClick}
                            rowSelection={rowSelection}
                            bordered={true}
                            columns={this.voiceMgtCol}
                            dataSource={voiceMgtData}
                        />
                    </Card>
                </Col>
                <AddUpdateModal
                    visible={modalVia}
                    modalForm={rowData}
                    agvList={agvMgtData}
                    onSubmit={this.handleSave}
                    onCancel={this.handleCancel}
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
    }) => ({}),
)(voiceMgt);

