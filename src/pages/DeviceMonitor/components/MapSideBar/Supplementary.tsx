import React, { useEffect, useState, useRef, } from 'react';
import { connect, Dispatch, useIntl, Route } from 'umi';
import styles from './style.less';
import { Card, Form, Button, Select, Row, Col, notification, Table } from 'antd';
import { createWebsocket } from '../../service'
import { wsHost } from '@/../config/proxy.ts'
import { getSupplementaryDeviceStatus } from '../../service';

const { Option } = Select;

interface AgvProps {
    actionList: Array<object>,
    agvList: Object,
    loading: boolean,
    dispatch: Dispatch,
    currentRegion: '0',
    codeMapList: [],
    updateActionList: () => void,
    exceptionList: Array<Object>;
}

interface supplementaryState {
    deviceId: number | string,
    deviceIp: number | string,
    deviceName: number | string,
    devicePort: number | string,
    deviceType: number | string,
    exceptionStatus: number | string,
    id: number | string,
    key?: number | string,
}

const Supplementary: React.FC<AgvProps> = (props) => {

    let [supplementaryList, setSupplementaryList] = useState<Array<supplementaryState>>([])

    useEffect(() => {
        getSupplementaryList()
    }, [])

    const supplementaryCol = [
        {
            title: '名称',
            dataIndex: 'deviceName',
            ellipsis: true,
            key: '名称',
        },
        {
            title: '连接状态',
            dataIndex: 'exceptionStatus',
            ellipsis: true,
            key: '状态',
        }
    ];
    async function getSupplementaryList() {
        supplementaryList = await getSupplementaryDeviceStatus()
        for (let i = 0; i < supplementaryList.length; i++) {
            if (supplementaryList[i]['exceptionStatus'] == 'Y') {   //处理异常显示
                supplementaryList[i].exceptionStatus = '连接异常'
            } else {
                supplementaryList[i].exceptionStatus = '连接正常'
            }
            // if (supplementaryList[i].deviceType == 'auto_door') {   //添加排序标识
            //     supplementaryList[i].key = 1
            // } else if (supplementaryList[i].deviceType == 'auto_door1') {
            //     supplementaryList[i].key = 2
            // } else if (supplementaryList[i].deviceType == 'wind_door') {
            //     supplementaryList[i].key = 3
            // } else if (supplementaryList[i].deviceType == 'lift') {
            //     supplementaryList[i].key = 4
            // } else if (supplementaryList[i].deviceType == '1') {
            //     supplementaryList[i].key = 5
            // };

        }
        // 排序
        supplementaryList.sort((a: any, b: any) => {
            return a.deviceId - b.deviceId
        })
        setSupplementaryList(supplementaryList)

        let ws = new WebSocket('ws://' + wsHost + '/device/' + new Date().getTime() + '')

        ws.onopen = function (e) {
            console.log('连接上 ws 辅助类设备服务端了');
        }
        ws.onmessage = function (msg) {
            let backData = []
            console.log('接收辅助类设备服务端发过来的消息: %o', msg.data);
            if (msg.data != '连接成功') {
                backData = JSON.parse(msg.data)
            }
            if (backData != '连接成功') {
                for (let i = 0; i < backData.length; i++) {
                    if (backData[i]['exceptionStatus'] == 'Y') {   //处理异常显示
                        backData[i].exceptionStatus = '连接异常'
                    } else {
                        backData[i].exceptionStatus = '连接正常'
                    }
                    // switch (backData[i].deviceType) {
                    //     case 'auto_door':
                    //         backData[i].key = 1
                    //         break;
                    //     case 'auto_door1':
                    //         backData[i].key = 2
                    //         break;
                    //     case 'wind_door':
                    //         backData[i].key = 2
                    //         break;
                    //     case 'lift':
                    //         backData[i].key = 3
                    //         break;
                    //     case '1':
                    //         backData[i].key = 4
                    //         break;
                    //     case 'auto_door':
                    //         backData[i].key = 5
                    //         break;
                    // }
                    // if (backData[i].deviceType == 'auto_door') {   //添加排序标识
                    //     backData[i].key = 1
                    // } else if (backData[i].deviceType == 'auto_door1') {
                    //     backData[i].key = 2
                    // } else if (backData[i].deviceType == 'wind_door') {
                    //     backData[i].key = 3
                    // } else if (backData[i].deviceType == 'lift') {
                    //     backData[i].key = 4
                    // } else if (backData[i].deviceType == 'lift') {
                    //     backData[i].key = 5
                    // }
                    // ;
                    // 排序
                    backData.sort((a: any, b: any) => {
                        return a.deviceId - b.deviceId
                    })
                    setSupplementaryList(backData)
                }

            }

        };
        ws.onclose = function (e) {
            console.log('ws辅助类设备服务 连接关闭了');
        }

    }
    return (
        <div className={styles.agvRunningWrapper}>
            <Card title="设备状态" className={styles.agvStatus}>
                {/* <Form.Item label="设备类型">    //领导说这个地方先不加了    后面再说
                    
                </Form.Item> */}
                {/* <Select
                    placeholder={'请选择设备类型'}
                // value={agvId}
                // onChange={handleAgvLocation}

                >
                </Select>
                <Option value="auto_door">自动门</Option>
                <Option value="auto_door1">卷帘门	</Option>
                <Option value="wind_door">风淋门	</Option>
                <Option value="lift">电梯</Option>
                <Option value="1">充电位</Option> */}
                <Table
                    rowKey={'' + Math.random()}
                    bordered={true}
                    columns={supplementaryCol as any}
                    dataSource={supplementaryList}
                />
            </Card>
        </div>
    );
};

export default connect(({ loading }: { loading: { effects: { [key: string]: boolean } } }) => ({}))(Supplementary);
