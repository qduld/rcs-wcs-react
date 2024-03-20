import React, { Component } from 'react';
import { connect, Dispatch } from 'umi';
import { Row, Col, Card, Table, notification } from 'antd';
import styles from './style.less'

interface CPProps {
    loading: boolean;
    dispatch: Dispatch;
}

interface ddlItem {
    id: Number,
    keyword: String,
    ddlCode: String,
    ddlName: String
}

class ConfigInfo extends Component<CPProps> {
    state = {
        actionData: [],
        ddlData: []
    }

    actionCol = [
        {
            title: '动作名称',
            dataIndex: 'portName',
            width: 150,
            ellipsis: true,
            render: (text: any, record: any, index: number) => {
                let actionCache = record.action
                return <span key={index}>{actionCache.portName}</span>
            }
        },
        {
            title: '功能点类型',
            dataIndex: 'portType',
            ellipsis: true,
            render: (text: any, record: any, index: number) => {
                let actionCache = record.action
                return <span key={index}>{actionCache.portType}</span>
            }
        },
        {
            title: '必经码值（Code）',
            dataIndex: 'code',
            ellipsis: true,
            render: (text: any, record: any, index: number) => {
                let actionCache = record.action
                return <span key={index}>{actionCache.code}</span>
            }
        },
        {
            title: '必经码值（Code1）',
            dataIndex: 'code1',
            ellipsis: true,
            render: (text: any, record: any, index: number) => {
                let actionCache = record.action
                return <span key={index}>{actionCache.code1}</span>
            }
        },
        {
            title: '必经码值（Code2）',
            dataIndex: 'code2',
            ellipsis: true,
            render: (text: any, record: any, index: number) => {
                let actionCache = record.action
                return <span key={index}>{actionCache.code2}</span>
            }
        }
        // {
        //     title: '动作集',
        //     dataIndex: 'actionGroup',
        //     render: (text:any,record:any,index:number) => {
        //         let {ddlData} = this.state
        //         let groupStr = ''
        //         if(record.actionGroup){
        //             record.actionGroup.forEach((outItem:any,index:number)=>{
        //                 let ddlFilter = ddlData.find((inItem:ddlItem)=>{
        //                     return inItem.ddlCode===outItem.ddlCode
        //                 })
        //                 if(ddlFilter){
        //                     groupStr += (outItem.code + '->' + ddlFilter.ddlName + ',')
        //                 }else{
        //                     groupStr += (outItem.code + '->' + outItem.ddlCode + ',')
        //                 }
        //             })
        //         }
        //         groupStr = groupStr?groupStr.slice(0,groupStr.length-1):''
        //         return <span key={index}>{groupStr}</span>
        //     }
        // }
    ]

    ddlCol = [
        {
            title: 'ID',
            dataIndex: 'id'
        },
        {
            title: '键',
            dataIndex: 'keyword'
        },
        {
            title: 'ddl编码',
            dataIndex: 'ddlCode',
        },
        {
            title: 'ddl名称',
            dataIndex: 'ddlName'
        }
    ]

    constructor(props: CPProps) {
        super(props);
    }

    componentDidMount() {
        this.getAllDDL();
        this.getAllAction();
    }

    getAllAction = () => {               //获取所有动作
        const { dispatch } = this.props
        dispatch({
            type: 'mapAndMonitor/fetchAllAction',
            callback: (resp: any) => {
                if (resp) {
                    this.setState({
                        actionData: resp.map((item: any) => {
                            item.key = item.action.id
                            return item
                        })
                    })
                }
            }
        });
    }

    getAllDDL = () => {               //获取所有动作
        const { dispatch } = this.props
        dispatch({
            type: 'mapAndMonitor/fetchAllDDL',
            callback: (resp: any) => {
                if (resp) {
                    this.setState({
                        ddlData: resp.map((item: any) => {
                            item.key = item.id
                            return item
                        })
                    })
                }
            }
        });
    }

    expandRowRender = (record: any, index: number, indent: any, expended: boolean) => {
        let { ddlData } = this.state
        let actionGroupTable = []
        const groupCol = [
            {
                title: '码值',
                dataIndex: 'code',
                width: 150,
                ellipsis: true,
                render: (text: any, record: any, index: number) => {
                    return <span key={index}>{record.code}</span>
                }
            },
            // {
            //     title: 'ddl码值',
            //     dataIndex: 'ddlCode',
            //     width: 150,
            //     ellipsis: true,
            //     render: (text: any, record: any, index: number) => {
            //         return <span key={index}>{record.ddlCode}</span>
            //     }
            // },
            {
                title: 'ddl名称',
                dataIndex: 'ddlName',
                width: 150,
                ellipsis: true,
                render: (text: any, record: any, index: number) => {
                    return <span key={index}>{record.ddlName}</span>
                }
            },
            // {
            //     title: '事件类型',
            //     dataIndex: 'eventType',
            //     width: 150,
            //     ellipsis: true,
            //     render: (text: any, record: any, index: number) => {
            //         return <span key={index}>{record.eventType}</span>
            //     }
            // },
            // {
            //     title: '键',
            //     dataIndex: 'keyword',
            //     width: 150,
            //     ellipsis: true,
            //     render: (text: any, record: any, index: number) => {
            //         return <span key={index}>{record.keyword}</span>
            //     }
            // },
            // {
            //     title: '元数据表',
            //     width: 150,
            //     dataIndex: 'metadataTable',
            //     ellipsis: true,
            //     render: (text: any, record: any, index: number) => {
            //         return <span key={index}>{record.metadataTable}</span>
            //     }
            // },
            {
                title: '区域',
                dataIndex: 'region',
                width: 150,
                ellipsis: true,
                render: (text: any, record: any, index: number) => {
                    let region = ''
                    switch (record.region) {
                        case 'region0':
                            region = "一层";
                            break;
                        case 'region1':
                            region = "二层";
                            break;
                        case 'region2':
                            region = "三层";
                            break;
                        case 'region3':
                            region = "四层";
                            break;
                    }
                    return <span key={index}>{region}</span>
                }
            }
        ]

        actionGroupTable = record.actionGroup.map((outItem: any, index: any) => {
            let ddlCache = null
            outItem.key = outItem.id + index
            ddlCache = ddlData.find((inItem: any, index: number) => {
                return inItem.keyword === outItem.keyword && inItem.ddlCode === outItem.ddlCode
            })
            if (ddlCache) {
                outItem.ddlName = ddlCache.ddlName
            } else {
                outItem.ddlName = ""
            }
            return outItem
        })

        return <Table rowKey={'' + Math.random()} bordered={true} columns={groupCol} dataSource={actionGroupTable} pagination={false} />
    }

    render() {
        let { actionData, ddlData } = this.state

        return (
            <Row className={styles.agvMgt}>
                <Col xl={24} lg={24} md={24} sm={24} xs={24}>
                    <Card className={styles.agvMgtCard}>
                        <h1 className={styles.header}>点信息</h1>
                        <Table
                            rowKey={'' + Math.random()}
                            bordered={true}
                            columns={this.actionCol}
                            expandedRowRender={this.expandRowRender}
                            dataSource={actionData}
                            expandRowByClick={true}
                        />
                    </Card>
                    <Card className={styles.agvMgtCard}>
                        <h1 className={styles.header}>指令集合</h1>
                        <Table
                            rowKey={'' + Math.random()}
                            bordered={true}
                            columns={this.ddlCol}
                            dataSource={ddlData}
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
)(ConfigInfo);

