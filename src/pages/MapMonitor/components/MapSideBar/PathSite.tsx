import React, { useState } from 'react';
import { connect, Dispatch, useIntl } from 'umi';
import styles from './style.less';
import ActionOrderList from '@/components/ActionOrder/ActionOrderList';
import { Card, Form, Input, Button, Select, notification, Col, List } from 'antd';
import MapContext from '../../context';
import { beginSimulation } from '../../service';
import { wsHost } from '@/../config/proxy.ts'
import { isJSON } from '@/utils/usefulFunction.js'
import { LOStorage } from '@/utils/utils';
const { Option } = Select

interface PathSiteProps {
    updatePathList: (param: any, param1: any) => void;
    updateAgvList: (param?: any) => void;
    updateCurrentAgv: (param: any) => void;
    updateTrackFlag: (param: any) => void;
    updateMonitorAgvList: (param: any) => void;
    codeMapList: Array<Object>;
    monitorAgvList: Array<String>;
    currentRegion: string,
    dispatch: Dispatch;
    allDDL: Array<Object>;
}

const PathSite: React.FC<PathSiteProps> = (props) => {
    const [form] = Form.useForm();
    const { formatMessage } = useIntl();
    let [agvId, setAgvId] = useState();
    let [liveAction, setLiveAction] = useState('');
    let [agvList, setAgvList] = useState<Array<{ agvId: string, agvName: string }>>([]);
    let [startCode, setStartCode] = useState();
    let [endCode, setEndCode] = useState();
    let [simulationPath, setSimulationPath] = useState([]);
    let [currentAction, setCurrentAction] = useState({});

    const { updatePathList, updateAgvList, updateCurrentAgv, updateTrackFlag, updateMonitorAgvList, codeMapList, currentRegion, monitorAgvList, allDDL } = props
    // let mapContext = useContext(MapContext);

    const formItemLayout = {
        labelCol: {
            xs: { span: 5 },
            sm: { span: 5 },
        }
    };


    const searchIdleAgv = () => {              //查询空闲agv
        if (!form.validateFields(['startCode']) || !form.validateFields(['endCode'])) return;
        const { dispatch } = props;
        dispatch({
            type: 'mapAndMonitor/fetchSimulateAgv',
            payload: form.getFieldsValue(),
            callback: (resp: any) => {
                if (resp.status) {
                    if (resp.status !== 200) {
                        return;
                    }
                } else {
                    if (resp && Array.isArray(resp)) {
                        setAgvList(resp)
                    } else {
                        return;
                    }
                }
            }
        });
    }

    const generatePath = () => {              //点击生成路径,获取模拟动作列表
        form.validateFields()
        const { dispatch } = props;
        let reqObj = {
            agvId: agvId,
            startCode: startCode,
            endCode: endCode,
            region: 'region' + currentRegion
        }
        // 清除本地对应的小车到站信息
        let LOStorageContent = JSON.parse(LOStorage.getItem('now_agv_state'))
        if (LOStorageContent.length > 0) {
            for (let index = 0; index < LOStorageContent.length; index++) {
                const element = LOStorageContent[index];
                if (element.agvId == reqObj.agvId && element.actionLabel.indexOf('小车到站，请收放物料') != -1) {
                    LOStorageContent[index].actionLabel = ''
                    LOStorage.setItem('now_agv_state', JSON.stringify(LOStorageContent))
                }
            }
        }
        dispatch({
            type: 'mapAndMonitor/genPath',
            payload: reqObj,
            callback: (actionList: any, codeList: any) => {
                if ((actionList.status && actionList.status != 200) || (codeList.status && codeList.status != 200)) {
                    return;
                }
                if (actionList.length === 0) {
                    notification.error({
                        description: '没有对应的动作配置',
                        message: '模拟失败',
                    });
                    return;
                }
                setSimulationPath(actionList)
                updatePathList(codeList, agvId)
            }
        });
    }


    const beginSimulation = () => {
        const { dispatch } = props;
        // console.log('form.getFieldsValue()',form.getFieldsValue())
        let formData=form.getFieldsValue();
        console.log('formData',formData)
        dispatch({
            type: 'mapAndMonitor/startSimulation',
            payload: formData,
            callback: (response: any) => {
                // console.log('beginSimulation response',response)
                monitorRun(formData);
            }
        });
    }

    const monitorRun = (formData:any) => {           //模拟小车运行
        updateCurrentAgv(agvId);         //开始模拟更新追踪Agv
        updateTrackFlag(true);
        updateAgvList();

        // 从ws中获取数据设置monitorAgvList更新模拟车列表
        const ws = new WebSocket('ws://' + wsHost + '/location/' + agvId);
        // let outLineSum = 0
        ws.onopen = function (e) {
            console.log('连接上 ws 服务端了');
        }
        ws.onmessage = function (msg) {
            console.log('接收服务端发过来的消息: %o', msg);
            // if (!isJSON(msg.data)) {
            //     outLineSum += 1;
            //     if (outLineSum > 3) {
            //         outLineSum = 0;

            //         ws.close()

            //     }
            //     return;
            // }else{
            //     outLineSum=(outLineSum-1)<0?0:(outLineSum-1);
            // }
            let backData = JSON.parse(msg.data);
            if (backData && backData.agvId) {
                if (monitorAgvList.indexOf(backData.agvId) === -1) {
                    monitorAgvList.push(backData.agvId)
                    updateMonitorAgvList(monitorAgvList)
                }
                setCurrentAction(backData);
                // debugger;
            }
        };
        ws.onclose = function (e) {
            console.log('ws 连接关闭了');
        }
    }

    const changeAgvId = (value: any) => {         //修改AgvId
        setAgvId(value)
    }

    const changeStartCode = (e: any) => {         //修改AgvId
        setStartCode(e.target.value)
    }

    const changeEndCode = (e: any) => {         //修改AgvId
        setEndCode(e.target.value)
    }

    const checkCode = (_: any, value: string) => {
        const promise = Promise;
        if (value) {
            if (!codeMapList.find((item: any) => { return item.code_num == value && item.position_flag != "#" })) {
                return promise.reject(formatMessage({ id: 'mapMonitor.validCode' }));
            }
            if (_.field === 'startCode') {
                if (value == endCode) {
                    return promise.reject(formatMessage({ id: 'mapMonitor.repeatCode' }));
                }
            } else if (_.field === 'endCode') {
                if (value == startCode) {
                    return promise.reject(formatMessage({ id: 'mapMonitor.repeatCode' }));
                }
            }
        }
        return promise.resolve();
    }

    return (
        <div className={styles.pathSiteWrapper}>
            <Card title="模拟校验" className={styles.pathSite}>
                <Form form={form}>
                    <Form.Item
                        label="起点码值"
                        name="startCode"
                        dependencies={['endCode']}
                        {...formItemLayout}
                        rules={[
                            {
                                required: true,
                                message: '请输入起点',
                            },
                            {
                                validator: checkCode
                            }
                        ]}
                    >
                        <Input value={startCode}
                            onChange={changeStartCode}
                            autoComplete="off"
                        />
                    </Form.Item>
                    <Form.Item
                        label="终点码值" {...formItemLayout}
                        name="endCode"
                        dependencies={['startCode']}
                        rules={[
                            {
                                required: true,
                                message: '请输入终点',
                            },
                            {
                                validator: checkCode
                            }
                        ]}
                    >
                        <Input value={endCode} onChange={changeEndCode} autoComplete="off" />
                    </Form.Item>
                    <Form.Item label="AGV小车" {...formItemLayout} name='agvId'
                        rules={[
                            {
                                required: true,
                                message: '请选择小车',
                            }
                        ]}>
                        <Select
                            value={agvId}
                            onFocus={searchIdleAgv}
                            onChange={changeAgvId}>
                            {agvList.map((item, index) => {
                                return <Option value={item.agvId} key={index}>{item.agvName}</Option>
                            })}
                        </Select>
                    </Form.Item>
                    <Form.Item className={styles.optBtn}>
                        <Button type="primary" onClick={generatePath}>生成路径</Button>
                        <Button type="primary" onClick={beginSimulation}>开始模拟</Button>
                    </Form.Item>
                </Form>
            </Card>
            {/* <Card className={styles.pathPicture}>
                <div>
                </div>
            </Card> */}
            <Card className={styles.actionList} >
                <ActionOrderList
                    actionList={simulationPath}
                    ddlList={allDDL}
                    addVisible={false}
                    optVisible={false}
                    unSelectable={true}
                    currentAction={currentAction}
                />
            </Card>
        </div>
    );
};

export default connect(({ loading }: { loading: { effects: { [key: string]: boolean } } }) => ({}))(PathSite);
