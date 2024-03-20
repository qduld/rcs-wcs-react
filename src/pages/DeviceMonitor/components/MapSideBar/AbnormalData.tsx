import React, { useEffect, useState, useRef } from 'react';
import { connect, Dispatch, useIntl } from 'umi';
import styles from './style.less';
import { Card, Form, Input, Button, Select, Row, Col, notification } from 'antd';
import ActionOrderList from '@/components/ActionOrder/ActionOrderList';
import PowerShow from '@/components/SVG/PowerShow';
import usePrevious from '@/utils/customeEffect';
import { wsHost } from '@/../config/proxy.ts'

const { Option } = Select;

interface AgvProps {
    actionList: Array<object>,
    agvList: Object,
    loading: boolean,
    dispatch: Dispatch,
    currentRegion: '0',
    codeMapList: [],
    updateActionList: () => void
}

interface AgvInfoProps {
    agvId: string,
    power: string,
    taskId: string,
    taskStatus: string,
    startCode: string,
    endCode: string
}

interface PowerInfoProps {
    percent: number,
    charging: boolean
}

const agvInfoInit = {
    agvId: '',
    power: '',
    chargingType: '',
    taskId: '',
    taskStatus: '',
    startCode: '',
    endCode: ''
}

const powerInfoInit = {
    percent: 0,
    charging: false
}

const AgvRunning: React.FC<AgvProps> = (props) => {
    const { agvList, dispatch, currentRegion, codeMapList, updateActionList } = props;
    let [agvId, setAgvId] = useState<string>();
    let [agvInfo, setAgvInfo] = useState<AgvInfoProps>(agvInfoInit);
    let [actionGroup, setActionGroup] = useState<Array<Object>>([]);
    let [currentAction, setCurrentAction] = useState<Array<Object>>([]);
    let [powerInfo, setPowerInfo] = useState<PowerInfoProps>(powerInfoInit);

    let prevAgvInfo = usePrevious(agvInfo);

    useEffect(() => {
        let percentCompute = 0
        let powerNum = Number(agvInfo.power)
        if (powerNum) {
            if (powerNum < 30) {
                percentCompute = Math.floor((powerNum - 22) / 0.07)
            } else if (powerNum > 30) {
                percentCompute = Math.floor((powerNum - 40) / 0.14)
            }
            if (percentCompute < 0) {
                percentCompute = 0
            } else if (percentCompute > 100) {
                percentCompute = 100
            }
            setPowerInfo({ percent: percentCompute, charging: false })
        }
    }, [agvInfo])

    const renderAgvList = () => {
        let orgArr = []
        for (let key in agvList) {
            orgArr.push(<Option value={key} key={key}>{key.toUpperCase()}</Option>)
        }
        return orgArr
    }

    const handleAgvLocation = () => {
        const { dispatch } = props;
        let reqObj = { agvId: agvId }
        dispatch({
            type: 'deviceAndMonitor/getAgvInfo',
            payload: reqObj,
            callback: (agvInfo: any) => {
                setAgvInfo(agvInfo)
                searchPathList()
            }
        });
    }

    const searchPathList = () => {
        dispatch({
            type: 'deviceAndMonitor/getPathList',
            payload: agvInfo.taskId,
            callback: (actionGroup: any) => {
                setActionGroup(actionGroup)
                agvRun()
            }
        });
    }

    const agvRun = () => {           //模拟小车运行              
        const ws = new WebSocket('ws://' + wsHost + '/location/' + agvId);

        ws.onopen = function (e) {
            console.log('连接上 ws 服务端了');

            //   ws.send(JSON.stringify(data));
        }
        ws.onmessage = function (msg) {
            console.log('接收服务端发过来的消息: %o', '模拟小车运行的数据', msg);
        };
        ws.onclose = function (e) {
            console.log('ws 连接关闭了');
        }
    }

    return (
        <div className={styles.agvRunningWrapper}>
            <Card title="定位AGV" className={styles.locationAgv}>
                <Form.Item label="选择车辆">
                    <Select
                        value={agvId}
                        onChange={handleAgvLocation}
                        {...renderAgvList()}>
                    </Select>
                </Form.Item>
            </Card>
            <Card title="AGV状态" className={styles.agvStatus}>
                <Form>
                    <Form.Item label="电量显示">
                        <PowerShow
                            powerInfo={powerInfo}
                        />
                        <span style={{ marginLeft: '20px' }}>{powerInfo.percent + '%'}</span>
                    </Form.Item>
                    <Form.Item label="当前任务">
                        <span>{agvInfo.taskStatus}</span>
                    </Form.Item>
                    <Row>
                        <Col span={12}>
                            <Form.Item label="起始点">
                                <span>{agvInfo.startCode}</span>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item label="到达点">
                                <span>{agvInfo.endCode}</span>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>
            <Card title="路径列表" className={styles.pathList}>
                <ActionOrderList
                    actionList={actionGroup}
                    addVisible={false}
                    optVisible={false}
                    currentAction={currentAction}
                />
            </Card>
        </div>
    );
};

export default connect(({ loading }: { loading: { effects: { [key: string]: boolean } } }) => ({}))(AgvRunning);
