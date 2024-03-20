import React, { Component } from 'react';
import { connect, Dispatch } from 'umi';
import { Row, Col, Card, Table, Checkbox, Button, notification } from 'antd';
import AddUpdateModal from './components/addUpdateModal';
import { SuppleState } from './data.d';
import styles from './style.less'

interface SuppleProps {
    loading: boolean;
    dispatch: Dispatch;
}

const initSupple: SuppleState = {
    id: 0,
    deviceName: "",
    ip: "",
    port: null,
    deviceType: "auto_door"
}

class supplementaryMgt extends Component<SuppleProps> {
    state = {
        suppleMgtData: [],
        selectedRowKeys: [],
        selectedRows: [],
        rowData: initSupple,
        type: 'add',
        modalVia: false
    }

    suppleMgtCol = [
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
            title: '设备类型',
            dataIndex: 'deviceType',
            render: (text: any, record: any, index: number) => {
                switch (text) {
                    case "auto_door": return '自动门';
                    case "auto_door1": return '卷帘门';
                    case "wind_door": return '风淋门';
                    case "lift": return '电梯';
                    default: return '';
                }
            }
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

    constructor(props: SuppleProps) {
        super(props);
        this.getAllSupple = this.getAllSupple.bind(this);
    }

    componentDidMount() {
        this.getAllSupple();
    }

    getAllSupple() {
        const { dispatch } = this.props;
        if (dispatch) {
            dispatch({
                type: 'supplementaryMgt/fetchAllSupple',
                callback: (resp: any) => {
                    let dataCache = resp.map((item: any) => {
                        item.key = item.id
                        return item
                    })
                    dataCache.sort((item1: any, item2: any) => {
                        return Number(item1.id) - Number(item2.id)
                    })
                    this.setState({
                        suppleMgtData: dataCache
                    })
                }
            })
        }
    }

    newRowData = () => {
        this.setState({
            modalVia: true,
            type: 'add',
            rowData: JSON.parse(JSON.stringify(initSupple))
        })
    }

    handleSave = (values: SuppleState) => {
        const that = this;
        const { dispatch } = this.props;
        const { type } = this.state;
        let fetchType = 'supplementaryMgt/fetchInsertSupple'
        let message = '新增'
        if (type === 'add') {
            fetchType = 'supplementaryMgt/fetchInsertSupple'
            message = '新增'
        } else {
            fetchType = 'supplementaryMgt/fetchUpdateSupple'
            message = '修改'
        }
        let reqData = JSON.parse(JSON.stringify(values))
        dispatch({
            type: fetchType,
            payload: reqData,
            callback: (resp: any) => {
                that.handleBack(resp, message)

                that.getAllSupple();
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
                type: 'supplementaryMgt/fetchDeleteSupple',
                payload: this.state.selectedRows.map((item: any) => item.id),
                callback: (resp: any) => {
                    that.handleBack(resp, '删除')

                    this.setState({ selectedRows: [], selectedRowKeys: [] })
                    that.getAllSupple();
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
                description: resp.message,
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
        let { suppleMgtData, modalVia, rowData } = this.state
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
            <Row className={styles.suppleMgt}>
                <Col xl={24} lg={24} md={24} sm={24} xs={24}>
                    <Card className={styles.suppleMgtCard}>
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
                            columns={this.suppleMgtCol}
                            dataSource={suppleMgtData}
                        />
                    </Card>
                </Col>
                <AddUpdateModal
                    visible={modalVia}
                    modalForm={rowData}
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
)(supplementaryMgt);

